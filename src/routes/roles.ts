import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  index,
  pluck,
  store,
  update,
  destroy,
  getRolePermissions,
  updateRolePermissionStatus
} from '../controllers/roles';
import { CreateRolePayload, UpdateRolePayload, ApiResponse, Role } from '../types';
import { asyncHandler } from '../utils/errorHandler';

interface RoleParams {
  id: string;
  roleId: string;
}

interface UpdateRolePermissionStatusBody {
  permission_id: number;
  enabled: boolean;
}

/**
 * Role routes handler
 */
export async function rolesRoutes(fastify: FastifyInstance) {
  // Get all roles
  fastify.get<{ Reply: ApiResponse<Role[]> }>(
    '/roles', 
    asyncHandler(async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = await index();
      return reply.code(200).send(result);
    })
  );

  // Get a single role by ID
  fastify.get<{ 
    Params: RoleParams;
    Reply: ApiResponse<Role>;
  }>(
    '/roles/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: RoleParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await pluck(id);
      return reply.code(200).send(result);
    })
  );

  // Create a new role
  fastify.post<{
    Body: CreateRolePayload;
    Reply: ApiResponse<Role>;
  }>(
    '/roles', 
    asyncHandler(async (request: FastifyRequest<{ Body: CreateRolePayload }>, reply: FastifyReply) => {
      const result = await store(request.body);
      return reply.code(201).send(result);
    }, 201)
  );

  // Update a role
  fastify.put<{
    Params: RoleParams;
    Body: UpdateRolePayload;
    Reply: ApiResponse<Role>;
  }>(
    '/roles/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: RoleParams; Body: UpdateRolePayload }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await update(id, request.body);
      return reply.code(200).send(result);
    })
  );

  // Delete a role
  fastify.delete<{
    Params: RoleParams;
    Reply: ApiResponse<Role>;
  }>(
    '/roles/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: RoleParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await destroy(id);
      return reply.code(200).send(result);
    })
  );

  // Get all permissions for a specific role
  fastify.get<{
    Params: { roleId: string };
    Reply: ApiResponse<any[]>;
  }>(
    '/roles/:roleId/permissions',
    asyncHandler(async (request: FastifyRequest<{ Params: { roleId: string } }>, reply: FastifyReply) => {
      const { roleId } = request.params;
      const result = await getRolePermissions(roleId);
      return reply.code(200).send(result);
    })
  );

  // Update role permission status (enable/disable)
  fastify.put<{
    Params: { roleId: string };
    Body: UpdateRolePermissionStatusBody;
    Reply: ApiResponse<any>;
  }>(
    '/roles/:roleId/permissions',
    asyncHandler(async (request: FastifyRequest<{ 
      Params: { roleId: string };
      Body: UpdateRolePermissionStatusBody;
    }>, reply: FastifyReply) => {
      const { roleId } = request.params;
      const { permission_id, enabled } = request.body;

      if (permission_id === undefined || enabled === undefined) {
        throw {
          statusCode: 400,
          message: 'permission_id and enabled are required'
        };
      }

      const result = await updateRolePermissionStatus(roleId, permission_id, enabled);
      return reply.code(200).send(result);
    })
  );
}

