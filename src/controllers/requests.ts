import { query } from '../config/database.js';
import { Request, CreateRequestPayload, UpdateRequestPayload, ApiResponse, Statuses } from '../types';

/**
 * Get all requests
 */
export async function index(): Promise<ApiResponse<Request[]>> {
  try {
    const result = await query<Request>('SELECT * FROM requests ORDER BY created_at DESC');
    return {
      success: true,
      data: result.rows,
      count: result.rows.length
    };
  } catch (error) {
    throw {
      statusCode: 500,
      message: 'Failed to fetch requests',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get a single request by ID
 */
export async function pluck(id: string): Promise<ApiResponse<Request>> {
  try {
    const result = await query<Request>('SELECT * FROM requests WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Request not found'
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
      message: 'Failed to fetch request',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create a new request
 */
export async function store(input: CreateRequestPayload): Promise<ApiResponse<Request>> {
  try {
    const { title, description, citizen_id, assigned_admin_id, status_id } = input;

    // Validation
    if (!title) {
      throw {
        statusCode: 400,
        message: 'Title is required'
      };
    }

    if (!description) {
      throw {
        statusCode: 400,
        message: 'Description is required'
      };
    }

    if (!citizen_id) {
      throw {
        statusCode: 400,
        message: 'Citizen ID is required'
      };
    }

    // Validate citizen exists
    const citizenCheck = await query('SELECT id FROM citizens WHERE id = $1', [citizen_id]);
    if (citizenCheck.rows.length === 0) {
      throw {
        statusCode: 400,
        message: 'Invalid citizen_id'
      };
    }

    // Validate assigned_admin_id if provided
    if (assigned_admin_id) {
      const adminCheck = await query('SELECT id FROM admins WHERE id = $1', [assigned_admin_id]);
      if (adminCheck.rows.length === 0) {
        throw {
          statusCode: 400,
          message: 'Invalid assigned_admin_id'
        };
      }
    }

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

    const result = await query<Request>(
      'INSERT INTO requests (title, description, citizen_id, assigned_admin_id, status_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, citizen_id, assigned_admin_id || null, status_id || Statuses.PENDING]
    );

    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    if (error.code === '23503') { // Foreign key violation
      throw {
        statusCode: 400,
        message: 'Invalid citizen_id, assigned_admin_id, or status_id'
      };
    }

    throw {
      statusCode: 500,
      message: 'Failed to create request',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update a request
 */
export async function update(id: string, input: UpdateRequestPayload): Promise<ApiResponse<Request>> {
  try {
    const { title, description, citizen_id, assigned_admin_id, status_id } = input;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (citizen_id !== undefined) {
      // Validate citizen exists
      const citizenCheck = await query('SELECT id FROM citizens WHERE id = $1', [citizen_id]);
      if (citizenCheck.rows.length === 0) {
        throw {
          statusCode: 400,
          message: 'Invalid citizen_id'
        };
      }
      updates.push(`citizen_id = $${paramCount++}`);
      values.push(citizen_id);
    }

    if (assigned_admin_id !== undefined) {
      // Handle null assignment (unassigning admin)
      if (assigned_admin_id === null) {
        updates.push(`assigned_admin_id = $${paramCount++}`);
        values.push(null);
      } else {
        // Validate admin exists
        const adminCheck = await query('SELECT id FROM admins WHERE id = $1', [assigned_admin_id]);
        if (adminCheck.rows.length === 0) {
          throw {
            statusCode: 400,
            message: 'Invalid assigned_admin_id'
          };
        }
        updates.push(`assigned_admin_id = $${paramCount++}`);
        values.push(assigned_admin_id);
      }
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
    const result = await query<Request>(
      `UPDATE requests SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Request not found'
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

    if (error.code === '23503') { // Foreign key violation
      throw {
        statusCode: 400,
        message: 'Invalid citizen_id, assigned_admin_id, or status_id'
      };
    }

    throw {
      statusCode: 500,
      message: 'Failed to update request',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Delete a request
 */
export async function destroy(id: string): Promise<ApiResponse<Request>> {
  try {
    const result = await query<Request>('DELETE FROM requests WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Request not found'
      };
    }

    return {
      success: true,
      message: 'Request deleted successfully',
      data: result.rows[0]
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    throw {
      statusCode: 500,
      message: 'Failed to delete request',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

