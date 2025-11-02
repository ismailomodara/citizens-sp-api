import { query } from '../config/database.js';
import { Office, CreateOfficeInput, UpdateOfficeInput, ApiResponse } from '../types';

/**
 * Get all offices
 */
export async function index(): Promise<ApiResponse<Office[]>> {
  try {
    const result = await query<Office>('SELECT * FROM offices ORDER BY id');
    return {
      success: true,
      data: result.rows,
      count: result.rows.length
    };
  } catch (error) {
    throw {
      statusCode: 500,
      message: 'Failed to fetch offices',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get a single office by ID
 */
export async function pluck(id: string): Promise<ApiResponse<Office>> {
  try {
    const result = await query<Office>('SELECT * FROM offices WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Office not found'
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
      message: 'Failed to fetch office',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create a new office
 */
export async function store(input: CreateOfficeInput): Promise<ApiResponse<Office>> {
  try {
    const { label, code, address, status_id, country } = input;
    
    if (!label) {
      throw {
        statusCode: 400,
        message: 'Label is required'
      };
    }
    
    if (!code) {
      throw {
        statusCode: 400,
        message: 'Code is required'
      };
    }
    
    if (!status_id) {
      throw {
        statusCode: 400,
        message: 'Status ID is required'
      };
    }
    
    if (!country || country.length !== 3) {
      throw {
        statusCode: 400,
        message: 'Country must be a valid ISO3 code (3 characters)'
      };
    }
    
    // Validate status_id exists
    const statusCheck = await query('SELECT id FROM statuses WHERE id = $1', [status_id]);
    if (statusCheck.rows.length === 0) {
      throw {
        statusCode: 400,
        message: 'Invalid status_id'
      };
    }
    
    const result = await query<Office>(
      'INSERT INTO offices (label, code, address, status_id, country) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [label, code, address || null, status_id, country.toUpperCase()]
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
        message: 'Office with this code already exists'
      };
    }
    
    if (error.code === '23503') { // Foreign key violation
      throw {
        statusCode: 400,
        message: 'Invalid status_id'
      };
    }
    
    throw {
      statusCode: 500,
      message: 'Failed to create office',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update an office
 */
export async function update(id: string, input: UpdateOfficeInput): Promise<ApiResponse<Office>> {
  try {
    const { label, code, address, status_id, country } = input;
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (label !== undefined) {
      updates.push(`label = $${paramCount++}`);
      values.push(label);
    }
    if (code !== undefined) {
      updates.push(`code = $${paramCount++}`);
      values.push(code);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(address);
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
    
    if (updates.length === 0) {
      throw {
        statusCode: 400,
        message: 'No fields to update'
      };
    }
    
    values.push(id);
    const result = await query<Office>(
      `UPDATE offices SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Office not found'
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
        message: 'Office with this code already exists'
      };
    }
    
    if (error.code === '23503') { // Foreign key violation
      throw {
        statusCode: 400,
        message: 'Invalid status_id'
      };
    }
    
    throw {
      statusCode: 500,
      message: 'Failed to update office',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Delete an office
 */
export async function destroy(id: string): Promise<ApiResponse<Office>> {
  try {
    const result = await query<Office>('DELETE FROM offices WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Office not found'
      };
    }
    
    return {
      success: true,
      message: 'Office deleted successfully',
      data: result.rows[0]
    };
  } catch (error: any) {
    // Re-throw if it's already our formatted error
    if (error.statusCode) {
      throw error;
    }
    
    throw {
      statusCode: 500,
      message: 'Failed to delete office',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

