import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  index,
  pluck,
  store,
  update,
  destroy
} from '../controllers/offices';
import { CreateOfficeInput, UpdateOfficeInput, ApiResponse, Office } from '../types';
import { asyncHandler } from '../utils/errorHandler';

interface OfficeParams {
  id: string;
}

/**
 * Office routes handler
 */
export async function officesRoutes(fastify: FastifyInstance) {
  // Get all offices
  fastify.get<{ Reply: ApiResponse<Office[]> }>(
    '/offices', 
    asyncHandler(async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = await index();
      return reply.code(200).send(result);
    })
  );

  // Get a single office by ID
  fastify.get<{ 
    Params: OfficeParams;
    Reply: ApiResponse<Office>;
  }>(
    '/offices/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: OfficeParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await pluck(id);
      return reply.code(200).send(result);
    })
  );

  // Create a new office
  fastify.post<{
    Body: CreateOfficeInput;
    Reply: ApiResponse<Office>;
  }>(
    '/offices', 
    asyncHandler(async (request: FastifyRequest<{ Body: CreateOfficeInput }>, reply: FastifyReply) => {
      const result = await store(request.body);
      return reply.code(201).send(result);
    }, 201)
  );

  // Update an office
  fastify.put<{
    Params: OfficeParams;
    Body: UpdateOfficeInput;
    Reply: ApiResponse<Office>;
  }>(
    '/offices/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: OfficeParams; Body: UpdateOfficeInput }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await update(id, request.body);
      return reply.code(200).send(result);
    })
  );

  // Delete an office
  fastify.delete<{
    Params: OfficeParams;
    Reply: ApiResponse<Office>;
  }>(
    '/offices/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: OfficeParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await destroy(id);
      return reply.code(200).send(result);
    })
  );
}

