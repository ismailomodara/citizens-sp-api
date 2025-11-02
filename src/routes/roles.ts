import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  index,
  pluck,
  store,
  update,
  destroy
} from '../controllers/roles';
import { CreateRolePayload, UpdateRolePayload, ApiResponse, Role } from '../types';
import { asyncHandler } from '../utils/errorHandler';

interface RoleParams {
  id: string;
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
}

