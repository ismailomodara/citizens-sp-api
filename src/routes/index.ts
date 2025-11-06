import { FastifyInstance } from 'fastify';
import { statusesRoutes } from './statuses';
import { servicesRoutes } from './services';
import { localesRoutes } from './locales';
import { authRoutes } from "./auth";
import { citizensRoutes } from './citizens';
import { rolesRoutes } from './roles';
import { permissionsRoutes } from './permissions';
import { adminsRoutes } from "./admins";
import { requestsRoutes } from './requests';

const API_PREFIX = '/api/v1';

/**
 * Register all routes under the base API prefix
 */
export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(async function (fastify) {
    await fastify.register(statusesRoutes);
    await fastify.register(servicesRoutes);
    await fastify.register(localesRoutes);
    await fastify.register(authRoutes);
    await fastify.register(citizensRoutes);
    await fastify.register(rolesRoutes);
    await fastify.register(permissionsRoutes);
    await fastify.register(adminsRoutes);
    await fastify.register(requestsRoutes);
  }, { prefix: API_PREFIX });
}
