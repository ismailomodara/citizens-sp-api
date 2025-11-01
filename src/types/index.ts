export enum Statuses {
  ACTIVE = 1,
  INACTIVE ,
  PENDING,
  DELETED,
  APPROVED,
  REJECTED,
  ERROR,
  ENABLED,
  DISABLED
}

export interface Status {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStatusInput {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateStatusInput {
  name?: string;
  description?: string;
  color?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

export interface EnvConfig {
  DATABASE_URL: string;
  PORT: string;
  NODE_ENV: string;
  HOST?: string;
  LOG_LEVEL?: string;
  DB_POOL_MIN?: string;
  DB_POOL_MAX?: string;
  DB_POOL_IDLE_TIMEOUT?: string;
  DB_POOL_CONNECTION_TIMEOUT?: string;
}

