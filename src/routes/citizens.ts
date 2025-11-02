import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  index,
  pluck,
  store,
  update,
  destroy
} from '../controllers/citizens';
import { CreateCitizenPayload, UpdateCitizenPayload, ApiResponse, Citizen } from '../types';
import { asyncHandler } from '../utils/errorHandler';

interface CitizenParams {
  id: string;
}

/**
 * Citizen routes handler
 */
export async function citizensRoutes(fastify: FastifyInstance) {
  // Get all citizens
  fastify.get<{ Reply: ApiResponse<Citizen[]> }>(
    '/citizens', 
    asyncHandler(async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = await index();
      return reply.code(200).send(result);
    })
  );

  // Get a single citizen by ID
  fastify.get<{ 
    Params: CitizenParams;
    Reply: ApiResponse<Citizen>;
  }>(
    '/citizens/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: CitizenParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await pluck(id);
      return reply.code(200).send(result);
    })
  );

  // Create a new citizen
  fastify.post<{
    Body: CreateCitizenPayload;
    Reply: ApiResponse<Citizen>;
  }>(
    '/citizens', 
    asyncHandler(async (request: FastifyRequest<{ Body: CreateCitizenPayload }>, reply: FastifyReply) => {
      const result = await store(request.body);
      return reply.code(201).send(result);
    }, 201)
  );

  // Update a citizen
  fastify.put<{
    Params: CitizenParams;
    Body: UpdateCitizenPayload;
    Reply: ApiResponse<Citizen>;
  }>(
    '/citizens/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: CitizenParams; Body: UpdateCitizenPayload }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await update(id, request.body);
      return reply.code(200).send(result);
    })
  );

  // Delete a citizen
  fastify.delete<{
    Params: CitizenParams;
    Reply: ApiResponse<Citizen>;
  }>(
    '/citizens/:id', 
    asyncHandler(async (request: FastifyRequest<{ Params: CitizenParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await destroy(id);
      return reply.code(200).send(result);
    })
  );
}

