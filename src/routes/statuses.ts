import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  index,
  pluck,
  store,
  update,
  destroy
} from '../controllers/statuses';
import { CreateStatusInput, UpdateStatusInput, ApiResponse, Status } from '../types';
import { asyncHandler } from '../utils/errorHandler';

interface StatusParams {
  id: string;
}

/**
 * Status routes handler
 */
export async function statusesRoutes(fastify: FastifyInstance) {
  // Get all statuses
  fastify.get<{ Reply: ApiResponse<Status[]> }>(
    '/statuses', 
    asyncHandler(async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = await index();
      return reply.code(200).send(result);
    })
  );

  // Get a single status by ID
  fastify.get<{ 
    Params: StatusParams;
    Reply: ApiResponse<Status>;
  }>(
    '/statuses/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: StatusParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await pluck(id);
      return reply.code(200).send(result);
    })
  );

  // Create a new status
  fastify.post<{
    Body: CreateStatusInput;
    Reply: ApiResponse<Status>;
  }>(
    '/statuses', 
    asyncHandler(async (request: FastifyRequest<{ Body: CreateStatusInput }>, reply: FastifyReply) => {
      const result = await store(request.body);
      return reply.code(201).send(result);
    }, 201)
  );

  // Update a status
  fastify.put<{
    Params: StatusParams;
    Body: UpdateStatusInput;
    Reply: ApiResponse<Status>;
  }>(
    '/statuses/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: StatusParams; Body: UpdateStatusInput }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await update(id, request.body);
      return reply.code(200).send(result);
    })
  );

  // Delete a status
  fastify.delete<{
    Params: StatusParams;
    Reply: ApiResponse<Status>;
  }>(
    '/statuses/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: StatusParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await destroy(id);
      return reply.code(200).send(result);
    })
  );
}
