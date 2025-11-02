import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  index,
  pluck,
  store,
  update,
  destroy
} from '../controllers/permissions';
import { CreatePermissionPayload, UpdatePermissionPayload, ApiResponse, Permission } from '../types';
import { asyncHandler } from '../utils/errorHandler';

interface PermissionParams {
  id: string;
}

/**
 * Permission routes handler
 */
export async function permissionsRoutes(fastify: FastifyInstance) {
  // Get all permissions
  fastify.get<{ Reply: ApiResponse<Permission[]> }>(
    '/permissions', 
    asyncHandler(async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = await index();
      return reply.code(200).send(result);
    })
  );

  // Get a single permission by ID
  fastify.get<{ 
    Params: PermissionParams;
    Reply: ApiResponse<Permission>;
  }>(
    '/permissions/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: PermissionParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await pluck(id);
      return reply.code(200).send(result);
    })
  );

  // Create a new permission
  fastify.post<{
    Body: CreatePermissionPayload;
    Reply: ApiResponse<Permission>;
  }>(
    '/permissions', 
    asyncHandler(async (request: FastifyRequest<{ Body: CreatePermissionPayload }>, reply: FastifyReply) => {
      const result = await store(request.body);
      return reply.code(201).send(result);
    }, 201)
  );

  // Update a permission
  fastify.put<{
    Params: PermissionParams;
    Body: UpdatePermissionPayload;
    Reply: ApiResponse<Permission>;
  }>(
    '/permissions/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: PermissionParams; Body: UpdatePermissionPayload }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await update(id, request.body);
      return reply.code(200).send(result);
    })
  );

  // Delete a permission
  fastify.delete<{
    Params: PermissionParams;
    Reply: ApiResponse<Permission>;
  }>(
    '/permissions/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: PermissionParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await destroy(id);
      return reply.code(200).send(result);
    })
  );
}

