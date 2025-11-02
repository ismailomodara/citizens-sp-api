-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  code VARCHAR(64) NOT NULL UNIQUE,
  entity_code VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL,
  description TEXT,
  status_id INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_permissions_entity FOREIGN KEY (entity_code) REFERENCES entities(code),
  CONSTRAINT fk_permissions_status FOREIGN KEY (status_id) REFERENCES statuses(id)
);

-- Insert default permissions for CRUD operations on all entities
-- Format: entity.action (e.g., statuses.create, services.read, citizens.update, citizens.delete)
INSERT INTO permissions (id, label, code, entity_code, action, description) VALUES
  -- Statuses (1-4)
  (1, 'Create Status', 'statuses.create', 'entity.statuses', 'create', 'Permission to create statuses'),
  (2, 'Read Status', 'statuses.read', 'entity.statuses', 'read', 'Permission to read/view statuses'),
  (3, 'Update Status', 'statuses.update', 'entity.statuses', 'update', 'Permission to update statuses'),
  (4, 'Delete Status', 'statuses.delete', 'entity.statuses', 'delete', 'Permission to delete statuses'),
  
  -- Services (5-8)
  (5, 'Create Service', 'services.create', 'entity.services', 'create', 'Permission to create services'),
  (6, 'Read Service', 'services.read', 'entity.services', 'read', 'Permission to read/view services'),
  (7, 'Update Service', 'services.update', 'entity.services', 'update', 'Permission to update services'),
  (8, 'Delete Service', 'services.delete', 'entity.services', 'delete', 'Permission to delete services'),

  -- Locales (9-12)
  (9, 'Create Locale', 'locales.create', 'entity.locales', 'create', 'Permission to create locales'),
  (10, 'Read Locale', 'locales.read', 'entity.locales', 'read', 'Permission to read/view locales'),
  (11, 'Update Locale', 'locales.update', 'entity.locales', 'update', 'Permission to update locales'),
  (12, 'Delete Locale', 'locales.delete', 'entity.locales', 'delete', 'Permission to delete locales'),
  
  -- Citizens (13-17)
  (13, 'Create Citizen', 'citizens.create', 'entity.citizens', 'create', 'Permission to create citizens'),
  (14, 'Read Citizen', 'citizens.read', 'entity.citizens', 'read', 'Permission to read/view citizens'),
  (15, 'Update Citizen', 'citizens.update', 'entity.citizens', 'update', 'Permission to update citizens'),
  (16, 'Delete Citizen', 'citizens.delete', 'entity.citizens', 'delete', 'Permission to delete citizens'),
  (17, 'Disable Citizen', 'citizens.disable', 'entity.citizens', 'disable', 'Permission to disable citizens'),

  -- Roles (18-21)
  (18, 'Create Role', 'roles.create', 'entity.roles', 'create', 'Permission to create roles'),
  (19, 'Read Role', 'roles.read', 'entity.roles', 'read', 'Permission to read/view roles'),
  (20, 'Update Role', 'roles.update', 'entity.roles', 'update', 'Permission to update roles'),
  (21, 'Delete Role', 'roles.delete', 'entity.roles', 'delete', 'Permission to delete roles'),

  -- Permissions (22-25)
  (22, 'Create Permission', 'permissions.create', 'entity.permissions', 'create', 'Permission to create permissions'),
  (23, 'Read Permission', 'permissions.read', 'entity.permissions', 'read', 'Permission to read/view permissions'),
  (24, 'Update Permission', 'permissions.update', 'entity.permissions', 'update', 'Permission to update permissions'),
  (25, 'Delete Permission', 'permissions.delete', 'entity.permissions', 'delete', 'Permission to delete permissions'),

  -- Role Permissions (26-29)
  (26, 'Create Role Permission', 'roles_permissions.create', 'entity.roles_permissions', 'create', 'Permission to create role permissions'),
  (27, 'Read Role Permission', 'roles_permissions.read', 'entity.roles_permissions', 'read', 'Permission to read/view role permissions'),
  (28, 'Update Role Permission', 'roles_permissions.update', 'entity.roles_permissions', 'update', 'Permission to update role permissions'),
  (29, 'Delete Role Permission', 'roles_permissions.delete', 'entity.roles_permissions', 'delete', 'Permission to delete role permissions'),

  -- Admins (30-33)
  (30, 'Create Admin', 'admins.create', 'entity.admins', 'create', 'Permission to create admins'),
  (31, 'Read Admin', 'admins.read', 'entity.admins', 'read', 'Permission to read/view admins'),
  (32, 'Update Admin', 'admins.update', 'entity.admins', 'update', 'Permission to update admins'),
  (33, 'Delete Admin', 'admins.delete', 'entity.admins', 'delete', 'Permission to delete admins'),

  -- Requests (34-39)
  (34, 'Create Request', 'requests.create', 'entity.requests', 'create', 'Permission to create requests'),
  (35, 'Read Request', 'requests.read', 'entity.requests', 'read', 'Permission to read/view requests'),
  (36, 'Update Request', 'requests.update', 'entity.requests', 'update', 'Permission to update requests'),
  (37, 'Delete Request', 'requests.delete', 'entity.requests', 'delete', 'Permission to delete requests'),
  (38, 'Approve Request', 'requests.approve', 'entity.requests', 'approve', 'Permission to approve requests'),
  (39, 'Deny Request', 'requests.deny', 'entity.requests', 'deny', 'Permission to deny requests'),

  -- Ministries (40-43)
  (40, 'Create Ministry', 'ministries.create', 'entity.ministries', 'create', 'Permission to create ministries'),
  (41, 'Read Ministry', 'ministries.read', 'entity.ministries', 'read', 'Permission to read/view ministries'),
  (42, 'Update Ministry', 'ministries.update', 'entity.ministries', 'update', 'Permission to update ministries'),
  (43, 'Delete Ministry', 'ministries.delete', 'entity.ministries', 'delete', 'Permission to delete ministries'),

  -- Ministries Admins (44-47)
  (44, 'Create Ministry Admin', 'ministries_admins.create', 'entity.ministries_admins', 'create', 'Permission to create ministries admins'),
  (45, 'Read Ministry Admin', 'ministries_admins.read', 'entity.ministries_admins', 'read', 'Permission to read/view ministries admins'),
  (46, 'Update Ministry Admin', 'ministries_admins.update', 'entity.ministries_admins', 'update', 'Permission to update ministries admins'),
  (47, 'Delete Ministry Admin', 'ministries_admins.delete', 'entity.ministries_admins', 'delete', 'Permission to delete ministries admins')
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  code = EXCLUDED.code,
  entity_code = EXCLUDED.entity_code,
  action = EXCLUDED.action,
  description = EXCLUDED.description,
  modified_at = CURRENT_TIMESTAMP;

-- Reset the sequence to continue after the highest ID
SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);

-- Create index on entity_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_permissions_entity_code ON permissions(entity_code);

-- Create index on action for faster lookups
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);

-- Create index on status_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_permissions_status_id ON permissions(status_id);

-- Create trigger to update modified_at timestamp
CREATE TRIGGER update_permissions_modified_at
  BEFORE UPDATE ON permissions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_modified_at_column();
