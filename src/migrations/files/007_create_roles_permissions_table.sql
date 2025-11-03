-- Create roles_permissions junction table
CREATE TABLE IF NOT EXISTS roles_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_roles_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_roles_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  CONSTRAINT uk_roles_permissions UNIQUE (role_id, permission_id)
);

-- Create index on role_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_roles_permissions_role_id ON roles_permissions(role_id);

-- Create index on permission_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_roles_permissions_permission_id ON roles_permissions(permission_id);

-- Assign default permissions to roles
-- Role IDs: 1=System Admin, 2=Regional Admin, 3=Admin, 4=Senior Officer, 5=Officer Level 2, 6=Officer Level 1
-- Permission IDs reference (in order of appearance in permissions migration):
-- Statuses: 1-3, Services: 4-7, Locales: 8-11, Roles: 12-15, Permissions: 16-21,
-- Role Permissions: 22-27, Admins: 28-33, Countries: 34-39, Ministries: 40-45,
-- Ministries Admins: 46-51, Citizens: 52-57, Requests: 58-63

-- System Admin (role_id: 1): Full access to everything
INSERT INTO roles_permissions (role_id, permission_id)
SELECT 1, id FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Regional Admin (role_id: 2): Can only modify roles, permissions, role permissions and entities that come after
-- Entities: Roles (12-15), Permissions (16-21), Role Permissions (22-27), Admins (28-33), 
--           Countries (34-39), Ministries (40-45), Ministries Admins (46-51), Citizens (52-57), Requests (58-63)
INSERT INTO roles_permissions (role_id, permission_id) VALUES
  -- Roles full CRUD
  (2, 12), (2, 13), (2, 14), (2, 15),
  -- Permissions full CRUD + enable/disable
  (2, 16), (2, 17), (2, 18), (2, 19), (2, 20), (2, 21),
  -- Role Permissions full CRUD + enable/disable
  (2, 22), (2, 23), (2, 24), (2, 25), (2, 26), (2, 27),
  -- Admins full CRUD + enable/disable
  (2, 28), (2, 29), (2, 30), (2, 31), (2, 32), (2, 33),
  -- Countries full CRUD + enable/disable
  (2, 34), (2, 35), (2, 36), (2, 37), (2, 38), (2, 39),
  -- Ministries full CRUD + enable/disable
  (2, 40), (2, 41), (2, 42), (2, 43), (2, 44), (2, 45),
  -- Ministries Admins full CRUD + enable/disable
  (2, 46), (2, 47), (2, 48), (2, 49), (2, 50), (2, 51),
  -- Citizens full CRUD + enable/disable
  (2, 52), (2, 53), (2, 54), (2, 55), (2, 56), (2, 57),
  -- Requests full CRUD + approve/deny
  (2, 58), (2, 59), (2, 60), (2, 61), (2, 62), (2, 63)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Admin (role_id: 3): Can only modify ministries and entities that come after
-- Entities: Ministries (40-45), Ministries Admins (46-51), Citizens (52-57), Requests (58-63)
INSERT INTO roles_permissions (role_id, permission_id) VALUES
  -- Ministries full CRUD + enable/disable
  (3, 40), (3, 41), (3, 42), (3, 43), (3, 44), (3, 45),
  -- Ministries Admins full CRUD + enable/disable
  (3, 46), (3, 47), (3, 48), (3, 49), (3, 50), (3, 51),
  -- Citizens full CRUD + enable/disable
  (3, 52), (3, 53), (3, 54), (3, 55), (3, 56), (3, 57),
  -- Requests full CRUD + approve/deny
  (3, 58), (3, 59), (3, 60), (3, 61), (3, 62), (3, 63)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Senior Officer (role_id: 4): Can modify citizens and requests
-- Entities: Citizens (52-57), Requests (58-63)
INSERT INTO roles_permissions (role_id, permission_id) VALUES
  -- Citizens full CRUD + enable/disable
  (4, 52), (4, 53), (4, 54), (4, 55), (4, 56), (4, 57),
  -- Requests full CRUD + approve/deny
  (4, 58), (4, 59), (4, 60), (4, 61), (4, 62), (4, 63)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Officer Level 2 (role_id: 5): Can approve/deny requests
-- Entities: Requests (approve/deny only - 62-63, but also need read to see requests)
INSERT INTO roles_permissions (role_id, permission_id) VALUES
  -- Requests read, approve, deny
  (5, 59), (5, 62), (5, 63)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Officer Level 1 (role_id: 6): Can update requests
-- Entities: Requests (update only - 60, but also need read to see requests)
INSERT INTO roles_permissions (role_id, permission_id) VALUES
  -- Requests read, update
  (6, 59), (6, 60)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create trigger to update modified_at timestamp
CREATE TRIGGER update_roles_permissions_modified_at
  BEFORE UPDATE ON roles_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_at_column();
