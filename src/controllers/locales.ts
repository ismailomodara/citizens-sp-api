import { query } from '../config/database.js';
import {Locale, CreateLocalePayload, UpdateLocalePayload, ApiResponse, Statuses} from '../types';

/**
 * Get all locales
 */
export async function index(): Promise<ApiResponse<Locale[]>> {
  try {
    // Admin response - all locales
    // const result = await query<Locale>('SELECT * FROM locales ORDER BY id');
    const result = await query<Locale>('SELECT label, code, description FROM locales WHERE status_id = $1 ORDER BY id', [Statuses.ENABLED]);
    return {
      success: true,
      data: result.rows,
      count: result.rows.length
    };
  } catch (error) {
    throw {
      statusCode: 500,
      message: 'Failed to fetch locales',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get a single locale by ID
 */
export async function pluck(id: string): Promise<ApiResponse<Locale>> {
  try {
    const result = await query<Locale>('SELECT * FROM locales WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Locale not found'
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
      message: 'Failed to fetch locale',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create a new status
 */
export async function store(input: CreateLocalePayload): Promise<ApiResponse<Locale>> {
  try {
    const { label, code, description } = input;

    if (!label) {
      throw {
        statusCode: 400,
        message: 'Label is required'
      };
    }

    const result = await query<Locale>(
      'INSERT INTO locales (label, code, description, status_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [label, code, description || null, Statuses.ENABLED]
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
        message: 'Locale with this label already exists'
      };
    }

    throw {
      statusCode: 500,
      message: 'Failed to create locale',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update a status
 */
export async function update(id: string, input: UpdateLocalePayload): Promise<ApiResponse<Locale>> {
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
    const result = await query<Locale>(
      `UPDATE locales SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Locale not found'
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
        message: 'Locale with this label already exists'
      };
    }

    throw {
      statusCode: 500,
      message: 'Failed to update locale',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

