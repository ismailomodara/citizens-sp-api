import { Pool, QueryResult } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const poolConfig: any = {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

    // Optional pool configuration from environment variables
    if (process.env.DB_POOL_MIN) {
      poolConfig.min = parseInt(process.env.DB_POOL_MIN, 10);
    }
    if (process.env.DB_POOL_MAX) {
      poolConfig.max = parseInt(process.env.DB_POOL_MAX, 10);
    }
    if (process.env.DB_POOL_IDLE_TIMEOUT) {
      poolConfig.idleTimeoutMillis = parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10);
    }
    if (process.env.DB_POOL_CONNECTION_TIMEOUT) {
      poolConfig.connectionTimeoutMillis = parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT, 10);
    }

    pool = new Pool(poolConfig);

    pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const client = getPool();
  const start = Date.now();
  try {
    const res = await client.query<T>(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error', error);
    throw error;
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

