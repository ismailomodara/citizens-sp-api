-- Create statuses table
CREATE TABLE IF NOT EXISTS statuses (
  id SERIAL PRIMARY KEY,
  label VARCHAR(65) NOT NULL UNIQUE,
  code VARCHAR(65) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(16),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial statuses based on Statuses enum
-- Ids map to Statuses Enum in Types
INSERT INTO statuses (id, label, code, description, color) VALUES
  (1, 'Active', 'active', 'Status for active items', 'green'),
  (2, 'Inactive', 'inactive', 'Status for inactive items', 'gray'),
  (3, 'Pending', 'pending', 'Status for pending items', 'yellow'),
  (4, 'In Progress', 'in_progress',  'Status for in progress items', 'yellow'),
  (5, 'Deleted', 'deleted', 'Status for deleted items', 'red'),
  (6, 'Approved', 'approved', 'Status for approved items', 'green'),
  (7, 'Rejected', 'rejected', 'Status for rejected items', 'red'),
  (8, 'Error', 'error', 'Status for items with errors', 'red'),
  (9, 'Enabled', 'enabled', 'Status for enabled items', 'green'),
  (10, 'Disabled', 'disabled', 'Status for disabled items', 'red'),
  (11, 'Confirmed', 'confirmed', 'Status for approved items', 'yello'),
  (12, 'Invited', 'invited', 'Status for invited items', 'green')
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  code = EXCLUDED.code,
  description = EXCLUDED.description,
  modified_at = CURRENT_TIMESTAMP;

-- Reset the sequence to continue after the highest ID
SELECT setval('statuses_id_seq', (SELECT MAX(id) FROM statuses));

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_statuses_code ON statuses(code);

-- Create trigger to update modified_at timestamp
CREATE OR REPLACE FUNCTION update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modified_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_statuses_modified_at
  BEFORE UPDATE ON statuses 
  FOR EACH ROW 
  EXECUTE FUNCTION update_modified_at_column();
