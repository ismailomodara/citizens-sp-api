import { FastifyRequest, FastifyReply } from 'fastify';
import { ApiResponse } from '../types';

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
  error?: string;
}

/**
 * Handle errors in route handlers and send standardized error response
 */
export function handleError(reply: FastifyReply, error: unknown): FastifyReply {
  const err = error as ErrorWithStatusCode;
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Unknown error';
  
  const response: ApiResponse<never> = {
    success: false,
    error: errorMessage,
    ...(err.error && { message: err.error })
  };
  
  return reply.code(statusCode).send(response);
}

/**
 * Wrap an async route handler with automatic error handling
 * This eliminates the need for try-catch blocks in route handlers
 * 
 * @param handler - The async route handler function
 * @param defaultStatusCode - Optional default HTTP status code for successful responses (default: 200)
 * @returns Wrapped handler with error handling
 * 
 * @example
 * fastify.get('/route', asyncHandler(async (request, reply) => {
 *   const data = await someAsyncOperation();
 *   return reply.code(201).send(data);
 * }, 201));
 */
export function asyncHandler<RequestType = FastifyRequest>(
  handler: (request: RequestType, reply: FastifyReply) => Promise<FastifyReply | any>,
  defaultStatusCode: number = 200
) {
  return async (request: RequestType, reply: FastifyReply): Promise<FastifyReply | any> => {
    try {
      const result = await handler(request, reply);
      // If handler didn't explicitly send a response via reply, send with default status code
      if (!reply.sent && result !== reply) {
        return reply.code(defaultStatusCode).send(result);
      }
      return result;
    } catch (error) {
      return handleError(reply, error);
    }
  };
}

