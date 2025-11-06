import { FastifyRequest, FastifyReply } from 'fastify';
import { adminHasPermission, getAdminRoleId } from '../utils/permissions';

/**
 * Extended FastifyRequest interface to include admin information
 * This should be populated by an authentication middleware before permission checks
 */
export interface AuthenticatedRequest extends FastifyRequest {
  admin?: {
    id: string;
    role_id: number;
    email?: string;
  };
}

/**
 * Options for the requirePermission middleware
 */
interface RequirePermissionOptions {
  /**
   * Custom function to extract admin ID from request
   * Default: reads from request.admin.id or request.headers['x-admin-id']
   */
  getAdminId?: (request: FastifyRequest) => string | null | undefined;
  
  /**
   * Custom error message when admin is not found
   */
  adminNotFoundMessage?: string;
  
  /**
   * Custom error message when permission is denied
   */
  permissionDeniedMessage?: string;
}

/**
 * Middleware factory to require a specific permission
 * 
 * @param permissionCode - The permission code required (e.g., 'statuses.create', 'requests.approve')
 * @param options - Optional configuration
 * @returns Fastify middleware function
 * 
 * @example
 * // In a route file:
 * fastify.post('/statuses', {
 *   preHandler: requirePermission('statuses.create')
 * }, async (request, reply) => {
 *   // Handler code
 * });
 * 
 * @example
 * // With custom admin ID extraction:
 * fastify.put('/requests/:id', {
 *   preHandler: requirePermission('requests.update', {
 *     getAdminId: (req) => req.query.adminId as string
 *   })
 * }, async (request, reply) => {
 *   // Handler code
 * });
 */
export function requirePermission(
  permissionCode: string,
  options: RequirePermissionOptions = {}
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  const {
    getAdminId = (req: FastifyRequest) => {
      // Try to get from authenticated admin object first
      const authenticatedReq = req as AuthenticatedRequest;
      if (authenticatedReq.admin?.id) {
        return authenticatedReq.admin.id;
      }
      // Fallback to header
      return req.headers['x-admin-id'] as string | undefined;
    },
    adminNotFoundMessage = 'Admin authentication required',
    permissionDeniedMessage = 'You do not have permission to perform this action'
  } = options;

  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      // Get admin ID from request
      const adminId = getAdminId(request);

      if (!adminId) {
        reply.code(401).send({
          success: false,
          error: adminNotFoundMessage
        });
        return;
      }

      // Check if admin has the required permission
      const hasPermission = await adminHasPermission(adminId, permissionCode);

      if (!hasPermission) {
        reply.code(403).send({
          success: false,
          error: permissionDeniedMessage,
          message: `Required permission: ${permissionCode}`
        });
        return;
      }

      // Permission granted, attach admin info to request for use in handlers
      const authenticatedReq = request as AuthenticatedRequest;
      if (!authenticatedReq.admin) {
        const roleId = await getAdminRoleId(adminId);
        if (roleId) {
          authenticatedReq.admin = {
            id: adminId,
            role_id: roleId
          };
        }
      }

      // Continue to next handler
      return;
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Error checking permissions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
  };
}

/**
 * Middleware factory to require any of multiple permissions
 * 
 * @param permissionCodes - Array of permission codes, admin needs at least one
 * @param options - Optional configuration
 * @returns Fastify middleware function
 * 
 * @example
 * fastify.post('/requests', {
 *   preHandler: requireAnyPermission(['requests.create', 'requests.approve'])
 * }, async (request, reply) => {
 *   // Handler code
 * });
 */
export function requireAnyPermission(
  permissionCodes: string[],
  options: RequirePermissionOptions = {}
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  const {
    getAdminId = (req: FastifyRequest) => {
      const authenticatedReq = req as AuthenticatedRequest;
      if (authenticatedReq.admin?.id) {
        return authenticatedReq.admin.id;
      }
      return req.headers['x-admin-id'] as string | undefined;
    },
    adminNotFoundMessage = 'Admin authentication required',
    permissionDeniedMessage = 'You do not have permission to perform this action'
  } = options;

  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const adminId = getAdminId(request);

      if (!adminId) {
        reply.code(401).send({
          success: false,
          error: adminNotFoundMessage
        });
        return;
      }

      // Check if admin has any of the required permissions
      const permissionChecks = await Promise.all(
        permissionCodes.map(code => adminHasPermission(adminId, code))
      );

      const hasAnyPermission = permissionChecks.some(has => has);

      if (!hasAnyPermission) {
        reply.code(403).send({
          success: false,
          error: permissionDeniedMessage,
          message: `Required one of: ${permissionCodes.join(', ')}`
        });
        return;
      }

      // Permission granted
      const authenticatedReq = request as AuthenticatedRequest;
      if (!authenticatedReq.admin) {
        const roleId = await getAdminRoleId(adminId);
        if (roleId) {
          authenticatedReq.admin = {
            id: adminId,
            role_id: roleId
          };
        }
      }

      return;
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Error checking permissions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
  };
}

/**
 * Middleware factory to require all of multiple permissions
 * 
 * @param permissionCodes - Array of permission codes, admin needs all of them
 * @param options - Optional configuration
 * @returns Fastify middleware function
 * 
 * @example
 * fastify.delete('/requests/:id', {
 *   preHandler: requireAllPermissions(['requests.delete', 'requests.read'])
 * }, async (request, reply) => {
 *   // Handler code
 * });
 */
export function requireAllPermissions(
  permissionCodes: string[],
  options: RequirePermissionOptions = {}
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  const {
    getAdminId = (req: FastifyRequest) => {
      const authenticatedReq = req as AuthenticatedRequest;
      if (authenticatedReq.admin?.id) {
        return authenticatedReq.admin.id;
      }
      return req.headers['x-admin-id'] as string | undefined;
    },
    adminNotFoundMessage = 'Admin authentication required',
    permissionDeniedMessage = 'You do not have permission to perform this action'
  } = options;

  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const adminId = getAdminId(request);

      if (!adminId) {
        reply.code(401).send({
          success: false,
          error: adminNotFoundMessage
        });
        return;
      }

      // Check if admin has all required permissions
      const permissionChecks = await Promise.all(
        permissionCodes.map(code => adminHasPermission(adminId, code))
      );

      const hasAllPermissions = permissionChecks.every(has => has);

      if (!hasAllPermissions) {
        reply.code(403).send({
          success: false,
          error: permissionDeniedMessage,
          message: `Required all of: ${permissionCodes.join(', ')}`
        });
        return;
      }

      // Permission granted
      const authenticatedReq = request as AuthenticatedRequest;
      if (!authenticatedReq.admin) {
        const roleId = await getAdminRoleId(adminId);
        if (roleId) {
          authenticatedReq.admin = {
            id: adminId,
            role_id: roleId
          };
        }
      }

      return;
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Error checking permissions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
  };
}

