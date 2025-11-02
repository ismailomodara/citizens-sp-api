import { config } from 'dotenv';
import Fastify, { FastifyInstance } from 'fastify';
import env from '@fastify/env';
import { registerRoutes } from './routes';
import { getPool } from './config/database.js';

// Load environment variables from .env file before Fastify initialization
config();

const schema = {
  type: 'object',
  required: ['DATABASE_URL'],
  properties: {
    DATABASE_URL: {
      type: 'string',
    },
    PORT: {
      type: 'string',
      default: '3000',
    },
    NODE_ENV: {
      type: 'string',
      default: 'development',
    },
    HOST: {
      type: 'string',
      default: '0.0.0.0',
    },
    LOG_LEVEL: {
      type: 'string',
      default: 'debug',
    },
    // Optional database pool configuration
    DB_POOL_MIN: {
      type: 'string',
    },
    DB_POOL_MAX: {
      type: 'string',
    },
    DB_POOL_IDLE_TIMEOUT: {
      type: 'string',
    },
    DB_POOL_CONNECTION_TIMEOUT: {
      type: 'string',
    },
  },
};

const options = {
  confKey: 'config',
  schema: schema,
  dotenv: true,
};

const fastify: FastifyInstance = Fastify({
  logger: {
    level: (process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')) as any,
  },
});

// Register environment variables plugin
await fastify.register(env, options);

// Health check route (under /api/v1 prefix)
fastify.get('/api/v1/health', async (_request, reply) => {
  try {
    // Test database connection
    const pool = getPool();
    await pool.query('SELECT 1');
    
    return {
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    reply.code(503);
    return {
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

// Register all routes
await registerRoutes(fastify);

// Root API route (under /api/v1 prefix)
fastify.get('/api/v1', async (_request, _reply) => {
  return {
    message: 'Citizens SP API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      statuses: '/statuses',
    },
  };
});

// Start server
const start = async (): Promise<void> => {
  try {
    // After registering @fastify/env, the config is available on fastify instance
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.DB_HOST || '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`🚀 Server is running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await fastify.close();
    console.log('Server closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing server:', err);
    process.exit(1);
  }
});

start();

