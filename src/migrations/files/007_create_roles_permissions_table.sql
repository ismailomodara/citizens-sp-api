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
-- Role IDs: 1=System Admin, 2=Senior Officer, 3=Officer Level 1, 4=Officer Level 2
-- Permission IDs reference (in order of appearance in permissions migration):
-- Statuses: 1-4, Services: 5-8, Locales: 9-12, Citizens: 13-17 (includes disable),
-- Roles: 18-21, Permissions: 22-25, Role Permissions: 26-29, Admins: 30-33,
-- Requests: 34-39 (includes approve/deny), Ministries: 40-43, Ministries Admins: 44-47

-- System Admin (role_id: 1): Full access to everything
INSERT INTO roles_permissions (role_id, permission_id)
SELECT 1, id FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Senior Officer (role_id: 2): Advanced permissions (no system admin tasks)
INSERT INTO roles_permissions (role_id, permission_id) VALUES
  -- Statuses read
  (2, 2),
  -- Services read
  (2, 6),
  -- Locales read
  (2, 10),
  -- Citizens full CRUD + disable
  (2, 13), (2, 14), (2, 15), (2, 16), (2, 17),
  -- Admins (create, read, update)
  (2, 30), (2, 31), (2, 32),
  -- Requests full CRUD + approve/deny
  (2, 34), (2, 35), (2, 36), (2, 37), (2, 38), (2, 39),
  -- Ministries full CRUD
  (2, 40), (2, 41), (2, 42), (2, 43),
  -- Ministries Admins full CRUD
  (2, 44), (2, 45), (2, 46), (2, 47)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Officer Level 2 (role_id: 3): Extended permissions from Officer Level 1
INSERT INTO roles_permissions (role_id, permission_id) VALUES
  -- Statuses read
  (3, 2),
  -- Services read
  (3, 6),
  -- Locales read
  (3, 10),
  -- Citizens create, read, update, disable
  (3, 13), (3, 14), (3, 15), (3, 17),
  -- Requests full CRUD + approve/deny
  (3, 34), (3, 35), (3, 36), (3, 37), (3, 38), (3, 39)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Officer Level 1 (role_id: 4): Read-only access to most entities + basic CRUD on citizens/requests
INSERT INTO roles_permissions (role_id, permission_id) VALUES
  -- Statuses read
  (4, 2),
  -- Services read
  (4, 6),
  -- Locales read
  (4, 10),
  -- Citizens create, read, update
  (4, 13), (4, 14), (4, 15),
  -- Requests create, read, update
  (4, 34), (4, 35), (4, 36)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create trigger to update modified_at timestamp
CREATE TRIGGER update_roles_permissions_modified_at
    BEFORE UPDATE ON roles_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_at_column();
