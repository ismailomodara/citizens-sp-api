import { query } from '../config/database.js';
import {Service, CreateServicePayload, UpdateServicePayload, ApiResponse, Statuses} from '../types';

/**
 * Get all services
 */
export async function index(): Promise<ApiResponse<Service[]>> {
  try {
    const result = await query<Service>('SELECT * FROM services ORDER BY id');
    return {
      success: true,
      data: result.rows,
      count: result.rows.length
    };
  } catch (error) {
    throw {
      statusCode: 500,
      message: 'Failed to fetch services',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get a single status by ID
 */
export async function pluck(id: string): Promise<ApiResponse<Service>> {
  try {
    const result = await query<Service>('SELECT * FROM services WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Service not found'
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
      message: 'Failed to fetch service',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create a new status
 */
export async function store(input: CreateServicePayload): Promise<ApiResponse<Service>> {
  try {
    const { label, description } = input;
    const code = label.toLowerCase().replaceAll(" ", "_");

    if (!label) {
      throw {
        statusCode: 400,
        message: 'Label is required'
      };
    }

    const result = await query<Service>(
      'INSERT INTO services (label, code, description, status_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [label, code, description || null, Statuses.ACTIVE]
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
        message: 'Service with this label already exists'
      };
    }

    throw {
      statusCode: 500,
      message: 'Failed to create service',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update a status
 */
export async function update(id: string, input: UpdateServicePayload): Promise<ApiResponse<Service>> {
  try {
    const { label, description, status_id } = input;
    const code = label && label.toLowerCase().replaceAll(" ", "_");

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (label !== undefined) {
      updates.push(`label = $${paramCount++}`);
      updates.push(`code = $${paramCount++}`);
      values.push(label);
      values.push(code);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (status_id !== undefined) {
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
    const result = await query<Service>(
      `UPDATE services SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Service not found'
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
        message: 'Service with this label already exists'
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
export async function destroy(id: string): Promise<ApiResponse<Service>> {
  try {
    const result = await query<Service>('DELETE FROM services WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Service not found'
      };
    }

    return {
      success: true,
      message: 'Service deleted successfully',
      data: result.rows[0]
    };
  } catch (error: any) {
    // Re-throw if it's already our formatted error
    if (error.statusCode) {
      throw error;
    }

    throw {
      statusCode: 500,
      message: 'Failed to delete Service',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

