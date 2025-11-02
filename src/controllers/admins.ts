import bcrypt from 'bcrypt';
import { query } from '../config/database.js';
import {Admin, CreateAdminPayload, UpdateAdminPayload, ApiResponse, Statuses, Locales} from '../types';

const SALT_ROUNDS = 10;

/**
 * Get all citizens
 */
export async function index(): Promise<ApiResponse<Admin[]>> {
  try {
    const result = await query<Admin>('SELECT * FROM admins ORDER BY created_at DESC');
    return {
      success: true,
      data: result.rows,
      count: result.rows.length
    };
  } catch (error) {
    throw {
      statusCode: 500,
      message: 'Failed to fetch admins',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get a single citizen by ID
 */
export async function pluck(id: string): Promise<ApiResponse<Admin>> {
  try {
    const result = await query<Admin>('SELECT * FROM admins WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Admin not found'
      };
    }
    
    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error: any) {
    // Re-throw if it's already our formatted error
    if (error.statusCode) {
      throw error;
    }
    throw {
      statusCode: 500,
      message: 'Failed to fetch admin',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create a new citizen
 */
export async function store(input: CreateAdminPayload): Promise<ApiResponse<Admin>> {
  try {
    const { email, password, firstname, lastname, country, role_id, locale_id, status_id } = input;
    
    // Validation
    if (!email) throw { statusCode: 400, message: 'Email is required'};
    if (!password) throw { statusCode: 400, message: 'Password is required'};
    if (!country) throw { statusCode: 400, message: 'Country is required'};

    // Validate email format (basic check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw {
        statusCode: 400,
        message: 'Invalid email format'
      };
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      throw {
        statusCode: 400,
        message: 'Password must be at least 8 characters long'
      };
    }
    
    if (!country || country.length !== 3) {
      throw {
        statusCode: 400,
        message: 'Country must be a valid ISO3 code (3 characters)'
      };
    }
    
    // Validate role_id
    if (role_id) {
      const roleCheck = await query('SELECT id FROM roles WHERE id = $1', [role_id]);
      if (roleCheck.rows.length === 0) {
        throw {
          statusCode: 400,
          message: 'Invalid role'
        };
      }
    }

    // Validate locale_id
    if (locale_id) {
      const localeCheck = await query('SELECT id FROM locales WHERE id = $1', [locale_id]);
      if (localeCheck.rows.length === 0) {
        throw {
          statusCode: 400,
          message: 'Invalid locale'
        };
      }
    }

    // Validate status_id if provided
    if (status_id) {
      const statusCheck = await query('SELECT id FROM statuses WHERE id = $1', [status_id]);
      if (statusCheck.rows.length === 0) {
        throw {
          statusCode: 400,
          message: 'Invalid status'
        };
      }
    }
    
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const result = await query<Admin>(
      'INSERT INTO citizens (email, password, firstname, lastname, country, role_id, status_id, locale_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [email.toLowerCase(), hashedPassword, firstname || null, lastname || null, country.toUpperCase(), role_id, status_id || Statuses.ENABLED, locale_id || Locales.ENGLISH]
    );
    
    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error: any) {
    // Re-throw if it's already our formatted error
    if (error.statusCode) {
      throw error;
    }
    
    if (error.code === '23505') { // Unique violation
      throw {
        statusCode: 409,
        message: 'Admin with this email already exists'
      };
    }
    
    if (error.code === '23503') { // Foreign key violation
      throw {
        statusCode: 400,
        message: `Invalid ${error.constraint.split("_")[-1]}`
      };
    }

    if (error.code === '23514') { // Check constraint violation
      throw {
        statusCode: 400,
        error: error.constraint,
        message: error.constraint === 'chk_citizens_country_length' ?
          'Country must be a valid ISO3 code (3 characters)' : '-'
      };
    }

    if (error.code === '23514') { // Check constraint violation
      throw {
        statusCode: 400,
        error: error.constraint,
        message: error.constraint === 'chk_citizens_country_length'
          ? 'Country must be a valid ISO3 code (3 characters)' : ''
      };
    }
    
    throw {
      statusCode: 500,
      message: 'Failed to create citizen',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update a citizen
 */
export async function update(id: string, input: UpdateAdminPayload): Promise<ApiResponse<Admin>> {
  try {
    const { password, firstname, lastname, country, status_id, locale_id } = input;
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    

    if (password !== undefined) {
      // Validate password strength (minimum 8 characters)
      if (password.length < 8) {
        throw {
          statusCode: 400,
          message: 'Password must be at least 8 characters long'
        };
      }
      // Hash the password before updating
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      updates.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }
    if (firstname !== undefined) {
      updates.push(`firstname = $${paramCount++}`);
      values.push(firstname);
    }
    if (lastname !== undefined) {
      updates.push(`lastname = $${paramCount++}`);
      values.push(lastname);
    }
    if (country !== undefined) {
      if (country.length !== 3) {
        throw {
          statusCode: 400,
          message: 'Country must be a valid ISO3 code (3 characters)'
        };
      }
      updates.push(`country = $${paramCount++}`);
      values.push(country.toUpperCase());
    }

    if (status_id !== undefined) {
      // Validate status_id exists
      const statusCheck = await query('SELECT id FROM statuses WHERE id = $1', [status_id]);
      if (statusCheck.rows.length === 0) {
        throw {
          statusCode: 400,
          message: 'Invalid status_id'
        };
      }
      updates.push(`status_id = $${paramCount++}`);
      values.push(status_id);
    }

    if (locale_id !== undefined) {
      // Validate locale_id exists
      const localeCheck = await query('SELECT id FROM locales WHERE id = $1', [locale_id]);
      if (localeCheck.rows.length === 0) {
        throw {
          statusCode: 400,
          message: 'Invalid locale'
        };
      }
      updates.push(`locale_id = $${paramCount++}`);
      values.push(locale_id);
    }
    
    if (updates.length === 0) {
      throw {
        statusCode: 400,
        message: 'No fields to update'
      };
    }
    
    values.push(id);
    const result = await query<Admin>(
      `UPDATE citizens SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Admin not found'
      };
    }
    
    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error: any) {
    // Re-throw if it's already our formatted error
    if (error.statusCode) {
      throw error;
    }
    
    if (error.code === '23505') { // Unique violation
      throw {
        statusCode: 409,
        message: 'Admin with this email already exists'
      };
    }

    if (error.code === '23503') { // Foreign key violation
      throw {
        statusCode: 400,
        message: `Invalid ${error.constraint.split("_")[-1]}`
      };
    }
    
    if (error.code === '23514') { // Check constraint violation
      throw {
        statusCode: 400,
        error: error.constraint,
        message: error.constraint === 'chk_citizens_country_length'
          ? 'Country must be a valid ISO3 code (3 characters)' : ''
      };
    }
    
    throw {
      statusCode: 500,
      message: 'Failed to update citizen',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Delete a citizen
 */
export async function destroy(id: string): Promise<ApiResponse<Admin>> {
  try {
    const result = await query<Admin>('DELETE FROM citizens WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Citizen not found'
      };
    }
    
    return {
      success: true,
      message: 'Citizen deleted successfully',
      data: result.rows[0]
    };
  } catch (error: any) {
    // Re-throw if it's already our formatted error
    if (error.statusCode) {
      throw error;
    }
    
    throw {
      statusCode: 500,
      message: 'Failed to delete citizen',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

