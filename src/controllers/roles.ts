import { query } from '../config/database.js';
import { Role, CreateRolePayload, UpdateRolePayload, ApiResponse, Statuses } from '../types';

/**
 * Get all roles
 */
export async function index(): Promise<ApiResponse<Role[]>> {
  try {
    const result = await query<Role>('SELECT * FROM roles ORDER BY id');
    return {
      success: true,
      data: result.rows,
      count: result.rows.length
    };
  } catch (error) {
    throw {
      statusCode: 500,
      message: 'Failed to fetch roles',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get a single role by ID
 */
export async function pluck(id: string): Promise<ApiResponse<Role>> {
  try {
    const result = await query<Role>('SELECT * FROM roles WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Role not found'
      };
    }
    
    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw {
      statusCode: 500,
      message: 'Failed to fetch role',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create a new role
 */
export async function store(input: CreateRolePayload): Promise<ApiResponse<Role>> {
  try {
    const { label, code, description, status_id } = input;
    
    if (!label) {
      throw {
        statusCode: 400,
        message: 'Label is required'
      };
    }
    
    // Generate code from label if not provided
    const finalCode = code || label.toLowerCase().replace(/\s+/g, '_');
    
    // Validate status_id if provided
    if (status_id) {
      const statusCheck = await query('SELECT id FROM statuses WHERE id = $1', [status_id]);
      if (statusCheck.rows.length === 0) {
        throw {
          statusCode: 400,
          message: 'Invalid status_id'
        };
      }
    }
    
    const result = await query<Role>(
      'INSERT INTO roles (label, code, description, status_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [label, finalCode, description || null, status_id || Statuses.ACTIVE]
    );
    
    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    
    if (error.code === '23505') { // Unique violation
      throw {
        statusCode: 409,
        message: 'Role with this code already exists'
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
      message: 'Failed to create role',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update a role
 */
export async function update(id: string, input: UpdateRolePayload): Promise<ApiResponse<Role>> {
  try {
    const { label, code, description, status_id } = input;
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (label !== undefined) {
      updates.push(`label = $${paramCount++}`);
      values.push(label);
      // Update code if label changed and code not explicitly provided
      if (code === undefined) {
        const generatedCode = label.toLowerCase().replace(/\s+/g, '_');
        updates.push(`code = $${paramCount++}`);
        values.push(generatedCode);
      }
    }
    
    if (code !== undefined) {
      updates.push(`code = $${paramCount++}`);
      values.push(code);
    }
    
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
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
    
    if (updates.length === 0) {
      throw {
        statusCode: 400,
        message: 'No fields to update'
      };
    }
    
    values.push(id);
    const result = await query<Role>(
      `UPDATE roles SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Role not found'
      };
    }
    
    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    
    if (error.code === '23505') { // Unique violation
      throw {
        statusCode: 409,
        message: 'Role with this code already exists'
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
      message: 'Failed to update role',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Delete a role
 */
export async function destroy(id: string): Promise<ApiResponse<Role>> {
  try {
    const result = await query<Role>('DELETE FROM roles WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Role not found'
      };
    }
    
    return {
      success: true,
      message: 'Role deleted successfully',
      data: result.rows[0]
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    
    throw {
      statusCode: 500,
      message: 'Failed to delete role',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

