import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  index,
  pluck,
  store,
  update
} from '../controllers/locales';
import { CreateLocalePayload, UpdateLocalePayload, ApiResponse, Locale } from '../types';
import { asyncHandler } from '../utils/errorHandler';

interface LocaleParams {
  id: string;
}

/**
 * Locale routes handler
 */
export async function localesRoutes(fastify: FastifyInstance) {
  // Get all locales
  fastify.get<{ Reply: ApiResponse<Locale[]> }>(
    '/locales',
    asyncHandler(async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = await index();
      return reply.code(200).send(result);
    })
  );

  // Get a single locale by ID
  fastify.get<{
    Params: LocaleParams;
    Reply: ApiResponse<Locale>;
  }>(
    '/locales/:id',
    asyncHandler(async (request: FastifyRequest<{ Params: LocaleParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await pluck(id);
      return reply.code(200).send(result);
    })
  );

  // Create a new locale
  fastify.post<{
    Body: CreateLocalePayload;
    Reply: ApiResponse<Locale>;
  }>(
    '/locales',
    asyncHandler(async (request: FastifyRequest<{ Body: CreateLocalePayload }>, reply: FastifyReply) => {
      const result = await store(request.body);
      return reply.code(201).send(result);
    }, 201)
  );

  // Update an locale
  fastify.put<{
    Params: LocaleParams;
    Body: UpdateLocalePayload;
    Reply: ApiResponse<Locale>;
  }>(
    '/locales/:id',
    asyncHandler(async (request: FastifyRequest<{ Params: LocaleParams; Body: UpdateLocalePayload }>, reply: FastifyReply) => {
      const { id } = request.params;
      const result = await update(id, request.body);
      return reply.code(200).send(result);
    })
  );
}

