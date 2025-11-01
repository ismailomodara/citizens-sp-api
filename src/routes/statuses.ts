import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query } from '../config/database.js';
import { Status, CreateStatusInput, UpdateStatusInput, ApiResponse } from '../types/index.js';

interface StatusParams {
  id: string;
}

interface StatusBody {
  name?: string;
  description?: string;
  color?: string;
}

export async function statusesRoutes(fastify: FastifyInstance) {
  // Get all statuses
  fastify.get<{ Reply: ApiResponse<Status[]> }>('/statuses', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await query<Status>('SELECT * FROM statuses ORDER BY id');
      return {
        success: true,
        data: result.rows,
        count: result.rows.length
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch statuses',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Get a single status by ID
  fastify.get<{ 
    Params: StatusParams;
    Reply: ApiResponse<Status>;
  }>('/statuses/:id', async (request: FastifyRequest<{ Params: StatusParams }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const result = await query<Status>('SELECT * FROM statuses WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        reply.code(404);
        return {
          success: false,
          error: 'Status not found'
        };
      }
      
      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch status',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Create a new status
  fastify.post<{
    Body: CreateStatusInput;
    Reply: ApiResponse<Status>;
  }>('/statuses', async (request: FastifyRequest<{ Body: CreateStatusInput }>, reply: FastifyReply) => {
    try {
      const { name, description, color } = request.body;
      
      if (!name) {
        reply.code(400);
        return {
          success: false,
          error: 'Name is required'
        };
      }
      
      const result = await query<Status>(
        'INSERT INTO statuses (name, description, color) VALUES ($1, $2, $3) RETURNING *',
        [name, description || null, color || null]
      );
      
      reply.code(201);
      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        reply.code(409);
        return {
          success: false,
          error: 'Status with this name already exists'
        };
      }
      reply.code(500);
      return {
        success: false,
        error: 'Failed to create status',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Update a status
  fastify.put<{
    Params: StatusParams;
    Body: UpdateStatusInput;
    Reply: ApiResponse<Status>;
  }>('/statuses/:id', async (request: FastifyRequest<{ Params: StatusParams; Body: UpdateStatusInput }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const { name, description, color } = request.body;
      
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
        reply.code(400);
        return {
          success: false,
          error: 'No fields to update'
        };
      }
      
      values.push(id);
      const result = await query<Status>(
        `UPDATE statuses SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );
      
      if (result.rows.length === 0) {
        reply.code(404);
        return {
          success: false,
          error: 'Status not found'
        };
      }
      
      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        reply.code(409);
        return {
          success: false,
          error: 'Status with this name already exists'
        };
      }
      reply.code(500);
      return {
        success: false,
        error: 'Failed to update status',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Delete a status
  fastify.delete<{
    Params: StatusParams;
    Reply: ApiResponse<Status>;
  }>('/statuses/:id', async (request: FastifyRequest<{ Params: StatusParams }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const result = await query<Status>('DELETE FROM statuses WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        reply.code(404);
        return {
          success: false,
          error: 'Status not found'
        };
      }
      
      return {
        success: true,
        message: 'Status deleted successfully',
        data: result.rows[0]
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to delete status',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
}

