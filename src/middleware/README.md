# Permission Middleware

This directory contains middleware for checking admin permissions before allowing actions.

## Files

- `requirePermission.ts` - Main middleware functions for permission checking
- `../utils/permissions.ts` - Helper functions for permission checks

## Usage

### Basic Usage

```typescript
import { requirePermission } from '../middleware/requirePermission';

// Require a single permission
fastify.post('/statuses', {
  preHandler: requirePermission('statuses.create')
}, async (request, reply) => {
  // Handler code - admin is guaranteed to have 'statuses.create' permission
  const adminId = request.admin?.id; // Available after permission check
});
```

### Require Any of Multiple Permissions

```typescript
import { requireAnyPermission } from '../middleware/requirePermission';

// Admin needs at least one of these permissions
fastify.post('/requests', {
  preHandler: requireAnyPermission(['requests.create', 'requests.approve'])
}, async (request, reply) => {
  // Handler code
});
```

### Require All Permissions

```typescript
import { requireAllPermissions } from '../middleware/requirePermission';

// Admin needs all of these permissions
fastify.delete('/requests/:id', {
  preHandler: requireAllPermissions(['requests.delete', 'requests.read'])
}, async (request, reply) => {
  // Handler code
});
```

### Custom Admin ID Extraction

By default, the middleware looks for admin ID in:
1. `request.admin.id` (set by authentication middleware)
2. `request.headers['x-admin-id']` (fallback)

You can customize this:

```typescript
fastify.put('/requests/:id', {
  preHandler: requirePermission('requests.update', {
    getAdminId: (req) => {
      // Custom extraction logic
      return req.query.adminId as string;
    },
    adminNotFoundMessage: 'Please provide admin ID',
    permissionDeniedMessage: 'You cannot update requests'
  })
}, async (request, reply) => {
  // Handler code
});
```

## Helper Functions

You can also use the permission checking functions directly:

```typescript
import { adminHasPermission, roleHasPermission, getRolePermissions } from '../utils/permissions';

// Check if an admin has a permission
const canCreate = await adminHasPermission(adminId, 'statuses.create');

// Check if a role has a permission
const roleCanCreate = await roleHasPermission(roleId, 'statuses.create');

// Get all permissions for a role
const permissions = await getRolePermissions(roleId);
```

## Permission Codes

Permission codes follow the pattern: `{entity}.{action}`

Examples:
- `statuses.create`
- `statuses.read`
- `statuses.update`
- `requests.create`
- `requests.approve`
- `requests.deny`
- `admins.create`
- `roles.update`

See the permissions migration file for the complete list.

## Response Format

When permission is denied, the middleware returns:

```json
{
  "success": false,
  "error": "You do not have permission to perform this action",
  "message": "Required permission: statuses.create"
}
```

HTTP Status Codes:
- `401` - Admin not found/authenticated
- `403` - Permission denied
- `500` - Error checking permissions

