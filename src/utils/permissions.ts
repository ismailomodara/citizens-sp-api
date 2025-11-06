import { query } from '../config/database.js';

/**
 * Check if a role has a specific permission
 * @param roleId - The role ID to check
 * @param permissionCode - The permission code (e.g., 'statuses.create', 'requests.approve')
 * @returns Promise<boolean> - True if the role has the permission, false otherwise
 */
export async function roleHasPermission(roleId: number, permissionCode: string): Promise<boolean> {
  try {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM roles_permissions rp
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = $1 AND p.code = $2
    `, [roleId, permissionCode]);

    return parseInt(result.rows[0].count, 10) > 0;
  } catch (error) {
    console.error('Error checking role permission:', error);
    return false;
  }
}

/**
 * Get all permission codes for a role
 * @param roleId - The role ID
 * @returns Promise<string[]> - Array of permission codes
 */
export async function getRolePermissions(roleId: number): Promise<string[]> {
  try {
    const result = await query<{ code: string }>(`
      SELECT p.code
      FROM roles_permissions rp
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = $1
    `, [roleId]);

    return result.rows.map(row => row.code);
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return [];
  }
}

/**
 * Check if an admin has a specific permission
 * @param adminId - The admin UUID
 * @param permissionCode - The permission code (e.g., 'statuses.create', 'requests.approve')
 * @returns Promise<boolean> - True if the admin has the permission, false otherwise
 */
export async function adminHasPermission(adminId: string, permissionCode: string): Promise<boolean> {
  try {
    // First get the admin's role_id
    const adminResult = await query<{ role_id: number }>(
      'SELECT role_id FROM admins WHERE id = $1',
      [adminId]
    );

    if (adminResult.rows.length === 0) {
      return false;
    }

    const roleId = adminResult.rows[0].role_id;
    return await roleHasPermission(roleId, permissionCode);
  } catch (error) {
    console.error('Error checking admin permission:', error);
    return false;
  }
}

/**
 * Get admin's role_id from admin ID
 * @param adminId - The admin UUID
 * @returns Promise<number | null> - The role_id or null if admin not found
 */
export async function getAdminRoleId(adminId: string): Promise<number | null> {
  try {
    const result = await query<{ role_id: number }>(
      'SELECT role_id FROM admins WHERE id = $1',
      [adminId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].role_id;
  } catch (error) {
    console.error('Error fetching admin role:', error);
    return null;
  }
}

