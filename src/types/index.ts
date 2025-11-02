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
  CONFIRMED,
  INVITED
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

export enum Services {
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

export enum Locales {
  ENGLISH = 1,
  ARABIC
}

export interface Locale {
  id: number;
  label: string;
  code: string;
  status_id: number
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateLocalePayload {
  label: string;
  code: string;
  description?: string;
  status_id: number
}

export interface UpdateLocalePayload {
  label?: string;
  code?: string;
  description?: string;
  status_id?: number
}

export interface Citizen {
  id: string; // UID
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  country: string;
  status_id: number;
  locale_id: number;
  created_at: Date;
  modified_at: Date;
}

export interface CreateCitizenPayload {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  country: string;
  status_id: number;
  locale_id: string;
}

export interface UpdateCitizenPayload {
  password?: string;
  firstname?: string;
  lastname?: string;
  country?: string;
  status_id?: number;
  locale_id?: string;
}

export enum Roles {
  SYSTEM_ADMIN = 1,
  SENIOR_OFFICER ,
  OFFICER_LEVEL_2,
  OFFICER_LEVEL_1
}

export interface Role {
  id: number;
  label: string;
  code: string;
  description: string | null;
  status_id: number;
  created_at: Date;
  modified_at: Date;
}

export interface CreateRolePayload {
  label: string;
  code?: string;
  description?: string;
  status_id?: number;
}

export interface UpdateRolePayload {
  label?: string;
  code?: string;
  description?: string;
  status_id?: number;
}

export interface Permission {
  id: number;
  label: string;
  code: string;
  entity_code: string;
  action: string;
  description: string | null;
  status_id: number;
  created_at: Date;
  modified_at: Date;
}

export interface CreatePermissionPayload {
  label: string;
  code?: string;
  entity_code: string;
  action: string;
  description?: string;
  status_id?: number;
}

export interface UpdatePermissionPayload {
  label?: string;
  code?: string;
  entity_code?: string;
  action?: string;
  description?: string;
  status_id?: number;
}

export interface RolePermission {
  id: number;
  role_id: number;
  permission_id: number;
  created_at: Date;
  modified_at: Date;
}

export interface CreateRolePermissionPayload {
  role_id: number;
  permission_id: number;
}

export interface UpdateRolePermissionPayload {
  role_id?: number;
  permission_id?: number;
}

export interface Admin {
  id: string; // UID
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  country: string;
  role_id: number;
  locale_id: number;
  status_id: number;
  created_at: Date;
  modified_at: Date;
}

export interface CreateAdminPayload {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  country: string;
  role_id: number;
  locale_id: string;
  status_id: number;
}

export interface UpdateAdminPayload {
  password?: string;
  firstname?: string;
  lastname?: string;
  country?: string;
  role_id?: number;
  locale_id?: string;
  status_id?: number;
}