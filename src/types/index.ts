export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

export enum Statuses {
  ACTIVE = 1,
  INACTIVE ,
  PENDING,
  IN_PROGRESS,
  DELETED,
  APPROVED,
  REJECTED,
  ERROR,
  ENABLED,
  DISABLED,
  CONFIRMED
}

export interface Status {
  id: number;
  label: string;
  code: string;
  description: string | null;
  color: string | null;
  created_at: Date;
  updated_at: Date;
}

export enum RequestTypes {
  EDUCATION = 1,
  HOUSING ,
  ELECTRICITY,
  FOOD,
  HEALTHCARE,
  TRANSPORTATION,
  UTILITIES,
  POLICE,
  LEGAL,
  SOCIAL_SERVICES,
  MILITARY,
  TAX,
  OTHERS
}

export interface Service {
  id: number;
  label: string;
  code: string;
  status_id: number
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateServicePayload {
  label: string;
  code: string;
  description?: string;
  status_id: number
}

export interface UpdateServicePayload {
  label?: string;
  code?: string;
  description?: string;
  status_id?: number
}

export interface Office {
  id: number;
  label: string;
  code: string;
  address: string | null;
  status_id: number;
  country: string;
  created_at: Date;
  modified_at: Date;
}

export interface CreateOfficeInput {
  label: string;
  code: string;
  address?: string;
  status_id: number;
  country: string;
}

export interface UpdateOfficeInput {
  label?: string;
  code?: string;
  address?: string;
  status_id?: number;
  country?: string;
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

