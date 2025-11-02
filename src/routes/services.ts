import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { index } from '../controllers/services';
import { ApiResponse, Status } from '../types';
import { asyncHandler } from '../utils/errorHandler';

/**
 * Status routes handler
 */
export async function servicesRoutes(fastify: FastifyInstance) {
  // Get all request types
  fastify.get<{ Reply: ApiResponse<Status[]> }>(
    '/services',
    asyncHandler(async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = await index();
      return reply.code(200).send(result);
    })
  );
}
