import { FastifyInstance } from 'fastify';
import { statusesRoutes } from './statuses';
import { servicesRoutes } from './services';

const API_PREFIX = '/api/v1';

/**
 * Register all routes under the base API prefix
 */
export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(async function (fastify) {
    await fastify.register(statusesRoutes);
    await fastify.register(servicesRoutes);
  }, { prefix: API_PREFIX });
}
