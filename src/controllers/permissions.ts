import { query } from '../config/database.js';
import { Permission, CreatePermissionPayload, UpdatePermissionPayload, ApiResponse, Statuses } from '../types';

/**
 * Get all permissions
 */
export async function index(): Promise<ApiResponse<Permission[]>> {
  try {
    const result = await query<Permission>('SELECT * FROM permissions ORDER BY entity_code, action');
    return {
      success: true,
      data: result.rows,
      count: result.rows.length
    };
  } catch (error) {
    throw {
      statusCode: 500,
      message: 'Failed to fetch permissions',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get a single permission by ID
 */
export async function pluck(id: string): Promise<ApiResponse<Permission>> {
  try {
    const result = await query<Permission>('SELECT * FROM permissions WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Permission not found'
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
      message: 'Failed to fetch permission',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create a new permission
 */
export async function store(input: CreatePermissionPayload): Promise<ApiResponse<Permission>> {
  try {
    const { label, code, entity_code, action, description, status_id } = input;
    
    if (!label) {
      throw {
        statusCode: 400,
        message: 'Label is required'
      };
    }
    
    if (!entity_code) {
      throw {
        statusCode: 400,
        message: 'Entity code is required'
      };
    }
    
    if (!action) {
      throw {
        statusCode: 400,
        message: 'Action is required'
      };
    }
    
    // Generate code from entity_code and action if not provided
    // Extract entity name from entity_code (e.g., 'entity.statuses' -> 'statuses')
    const entityName = entity_code.includes('.') ? entity_code.split('.').pop() : entity_code;
    const finalCode = code || `${entityName}.${action}`.toLowerCase();
    
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
    
    const result = await query<Permission>(
      'INSERT INTO permissions (label, code, entity_code, action, description, status_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [label, finalCode, entity_code.toLowerCase(), action.toLowerCase(), description || null, status_id || Statuses.ACTIVE]
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
        message: 'Permission with this code already exists'
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
      message: 'Failed to create permission',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update a permission
 */
export async function update(id: string, input: UpdatePermissionPayload): Promise<ApiResponse<Permission>> {
  try {
    const { label, code, entity_code, action, description, status_id } = input;
    
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
    
    if (entity_code !== undefined) {
      updates.push(`entity_code = $${paramCount++}`);
      values.push(entity_code.toLowerCase());
      // Update code if entity_code changed and code not explicitly provided
      if (code === undefined && action !== undefined) {
        const entityName = entity_code.includes('.') ? entity_code.split('.').pop() : entity_code;
        const generatedCode = `${entityName}.${action.toLowerCase()}`;
        updates.push(`code = $${paramCount++}`);
        values.push(generatedCode);
      }
    }
    
    if (action !== undefined) {
      updates.push(`action = $${paramCount++}`);
      values.push(action.toLowerCase());
      // Update code if action changed and code not explicitly provided
      if (code === undefined && entity_code !== undefined) {
        const entityName = entity_code.includes('.') ? entity_code.split('.').pop() : entity_code;
        const generatedCode = `${entityName}.${action.toLowerCase()}`;
        // Check if code update already added
        if (!updates.some(u => u.startsWith('code'))) {
          updates.push(`code = $${paramCount++}`);
          values.push(generatedCode);
        }
      }
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
    const result = await query<Permission>(
      `UPDATE permissions SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Permission not found'
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
        message: 'Permission with this code already exists'
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
      message: 'Failed to update permission',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Delete a permission
 */
export async function destroy(id: string): Promise<ApiResponse<Permission>> {
  try {
    const result = await query<Permission>('DELETE FROM permissions WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Permission not found'
      };
    }
    
    return {
      success: true,
      message: 'Permission deleted successfully',
      data: result.rows[0]
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    
    throw {
      statusCode: 500,
      message: 'Failed to delete permission',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

