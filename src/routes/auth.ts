import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { store } from '../controllers/citizens';
import { CreateCitizenPayload, ApiResponse, Citizen } from '../types';
import { asyncHandler } from '../utils/errorHandler';

/**
 * Citizen routes handler
 */
export async function authRoutes(fastify: FastifyInstance) {
  // Onboard a new citizen
  fastify.post<{
    Body: CreateCitizenPayload;
    Reply: ApiResponse<Citizen>;
  }>(
    '/accounts/onboard',
    asyncHandler(async (request: FastifyRequest<{ Body: CreateCitizenPayload }>, reply: FastifyReply) => {
      const result = await store(request.body);
      return reply.code(201).send(result);
    }, 201)
  );
}

