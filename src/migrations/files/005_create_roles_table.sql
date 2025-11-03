-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  code VARCHAR(64) NOT NULL UNIQUE,
  description TEXT,
  status_id INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_roles_status FOREIGN KEY (status_id) REFERENCES statuses(id)
);

-- Insert default roles
INSERT INTO roles (id, label, code, description) VALUES
  (1, 'System Admin', 'system_admin', 'System administrator with full permissions'),
  (2, 'Regional Admin', 'regional_admin', 'Regional administrator with full permissions specific to a region (country)'),
  (3, 'Admin', 'admin', 'Admins to handle activities based on assigned region, under a regional admin'),
  (4, 'Senior Officer', 'senior_officer', 'Senior officer with advanced permissions'),
  (5, 'Officer Level 2', 'officer_level_2', 'Mid-level officer with extended permissions'),
  (6, 'Officer Level 1', 'officer_level_1', 'Entry-level officer with basic permissions')
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  code = EXCLUDED.code,
  description = EXCLUDED.description,
  status_id = EXCLUDED.status_id,
  modified_at = CURRENT_TIMESTAMP;

-- Reset the sequence to continue after the highest ID
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);

-- Create index on status_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_roles_status_id ON roles(status_id);

-- Create trigger to update modified_at timestamp
CREATE TRIGGER update_roles_modified_at
  BEFORE UPDATE ON roles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_modified_at_column();

