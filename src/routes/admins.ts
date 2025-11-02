import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  index,
  pluck,
  store,
  update,
  destroy
} from '../controllers/admins';
import { CreateAdminPayload, UpdateAdminPayload, ApiResponse, Admin } from '../types';
import { asyncHandler } from '../utils/errorHandler';

interface AdminParams {
  id: string;
}

/**
 * Admins routes handler
 */
export async function adminsRoutes(fastify: FastifyInstance) {
  // Get all admins
  fastify.get<{ Reply: ApiResponse<Admin[]> }>(
    '/admins',
    asyncHandler(async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = await index();
      return reply.code(200).send(result);
    })
  );

  // Get a single admin by ID
  fastify.get<{ 
    Params: AdminParams;
    Reply: ApiResponse<Admin>;
  }>(
    '/admins/:id',
    asyncHandler(async (request: FastifyRequest<{ Params: AdminParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await pluck(id);
      return reply.code(200).send(result);
    })
  );

  // Create a new admin
  fastify.post<{
    Body: CreateAdminPayload;
    Reply: ApiResponse<Admin>;
  }>(
    '/admins',
    asyncHandler(async (request: FastifyRequest<{ Body: CreateAdminPayload }>, reply: FastifyReply) => {
      const result = await store(request.body);
      return reply.code(201).send(result);
    }, 201)
  );

  // Update a admins
  fastify.put<{
    Params: AdminParams;
    Body: UpdateAdminPayload;
    Reply: ApiResponse<Admin>;
  }>(
    '/admins/:id',
    asyncHandler(async (request: FastifyRequest<{ Params: AdminParams; Body: UpdateAdminPayload }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await update(id, request.body);
      return reply.code(200).send(result);
    })
  );

  // Delete a admins
  fastify.delete<{
    Params: AdminParams;
    Reply: ApiResponse<Admin>;
  }>(
    '/admins/:id',
    asyncHandler(async (request: FastifyRequest<{ Params: AdminParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await destroy(id);
      return reply.code(200).send(result);
    })
  );
}

