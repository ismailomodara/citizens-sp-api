import { query } from '../config/database.js';
import { Status, ApiResponse } from '../types';

/**
 * Get all statuses
 */
export async function index(): Promise<ApiResponse<Status[]>> {
  try {
    const result = await query<Status>('SELECT label, code, description, color FROM statuses ORDER BY id');
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