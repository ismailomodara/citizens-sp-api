import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  index,
  pluck,
  store,
  update,
  destroy
} from '../controllers/requests';
import { CreateRequestPayload, UpdateRequestPayload, ApiResponse, Request } from '../types';
import { asyncHandler } from '../utils/errorHandler';

interface RequestParams {
  id: string;
}

/**
 * Request routes handler
 */
export async function requestsRoutes(fastify: FastifyInstance) {
  // Get all requests
  fastify.get<{ Reply: ApiResponse<Request[]> }>(
    '/requests', 
    asyncHandler(async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = await index();
      return reply.code(200).send(result);
    })
  );

  // Get a single request by ID
  fastify.get<{ 
    Params: RequestParams;
    Reply: ApiResponse<Request>;
  }>(
    '/requests/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: RequestParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await pluck(id);
      return reply.code(200).send(result);
    })
  );

  // Create a new request
  fastify.post<{
    Body: CreateRequestPayload;
    Reply: ApiResponse<Request>;
  }>(
    '/requests', 
    asyncHandler(async (request: FastifyRequest<{ Body: CreateRequestPayload }>, reply: FastifyReply) => {
      const result = await store(request.body);
      return reply.code(201).send(result);
    }, 201)
  );

  // Update a request
  fastify.put<{
    Params: RequestParams;
    Body: UpdateRequestPayload;
    Reply: ApiResponse<Request>;
  }>(
    '/requests/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: RequestParams; Body: UpdateRequestPayload }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await update(id, request.body);
      return reply.code(200).send(result);
    })
  );

  // Delete a request
  fastify.delete<{
    Params: RequestParams;
    Reply: ApiResponse<Request>;
  }>(
    '/requests/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: RequestParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await destroy(id);
      return reply.code(200).send(result);
    })
  );
}

