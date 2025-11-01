import { query } from '../config/database.js';
import { Status, CreateStatusInput, UpdateStatusInput, ApiResponse } from '../types';

/**
 * Get all statuses
 */
export async function index(): Promise<ApiResponse<Status[]>> {
  try {
    const result = await query<Status>('SELECT * FROM statuses ORDER BY id');
    return {
      success: true,
      data: result.rows,
      count: result.rows.length
    };
  } catch (error) {
    throw {
      statusCode: 500,
      message: 'Failed to fetch statuses',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get a single status by ID
 */
export async function pluck(id: string): Promise<ApiResponse<Status>> {
  try {
    const result = await query<Status>('SELECT * FROM statuses WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Status not found'
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
      message: 'Failed to fetch status',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create a new status
 */
export async function store(input: CreateStatusInput): Promise<ApiResponse<Status>> {
  try {
    const { name, description, color } = input;
    
    if (!name) {
      throw {
        statusCode: 400,
        message: 'Name is required'
      };
    }
    
    const result = await query<Status>(
      'INSERT INTO statuses (name, description, color) VALUES ($1, $2, $3) RETURNING *',
      [name, description || null, color || null]
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
        message: 'Status with this name already exists'
      };
    }
    
    throw {
      statusCode: 500,
      message: 'Failed to create status',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update a status
 */
export async function update(id: string, input: UpdateStatusInput): Promise<ApiResponse<Status>> {
  try {
    const { name, description, color } = input;
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (color !== undefined) {
      updates.push(`color = $${paramCount++}`);
      values.push(color);
    }
    
    if (updates.length === 0) {
      throw {
        statusCode: 400,
        message: 'No fields to update'
      };
    }
    
    values.push(id);
    const result = await query<Status>(
      `UPDATE statuses SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Status not found'
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
        message: 'Status with this name already exists'
      };
    }
    
    throw {
      statusCode: 500,
      message: 'Failed to update status',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Delete a status
 */
export async function destroy(id: string): Promise<ApiResponse<Status>> {
  try {
    const result = await query<Status>('DELETE FROM statuses WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Status not found'
      };
    }
    
    return {
      success: true,
      message: 'Status deleted successfully',
      data: result.rows[0]
    };
  } catch (error: any) {
    // Re-throw if it's already our formatted error
    if (error.statusCode) {
      throw error;
    }
    
    throw {
      statusCode: 500,
      message: 'Failed to delete status',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

