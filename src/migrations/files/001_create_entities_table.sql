-- Create entities table
CREATE TABLE IF NOT EXISTS entities (
  id SERIAL PRIMARY KEY,
  label VARCHAR(65) NOT NULL UNIQUE,
  code VARCHAR(65) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO entities (label, code, description) VALUES
  ('Statuses', 'entity.statuses', 'The statuses entity'),
  ('Services', 'entity.services', 'The services entity'),
  ('Locales', 'entity.locales', 'The locales entity'),
  ('Roles', 'entity.roles', 'The roles entity'),
  ('Permissions', 'entity.permissions', 'The permissions entity'),
  ('Roles Permissions', 'entity.roles_permissions', 'The role permissions entity'),
  ('Admins', 'entity.admins', 'The admins entity'),
  ('Countries', 'entity.countries', 'The countries entity'),
  ('Ministries', 'entity.ministries', 'The ministries entity'),
  ('Ministries Admins', 'entity.ministries_admins', 'The ministries admins entity'),
  ('Citizens', 'entity.citizens', 'The citizens entity'),
  ('Requests', 'entity.requests', 'The requests entity')
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  code = EXCLUDED.code,
  description = EXCLUDED.description,
  modified_at = CURRENT_TIMESTAMP;

-- Reset the sequence to continue after the highest ID
SELECT setval('entities_id_seq', (SELECT MAX(id) FROM entities));

-- Create trigger to update modified_at timestamp
CREATE OR REPLACE FUNCTION update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modified_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_entities_modified_at
  BEFORE UPDATE ON entities
  FOR EACH ROW 
  EXECUTE FUNCTION update_modified_at_column();
