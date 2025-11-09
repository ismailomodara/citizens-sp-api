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
  (1, 'Active', 'status.active', 'Status for active items', 'success'),
  (2, 'Inactive', 'status.inactive', 'Status for inactive items', 'info'),
  (3, 'Pending', 'status.pending', 'Status for pending items', 'warning'),
  (4, 'In Progress', 'status.in_progress',  'Status for in progress items', 'warning'),
  (5, 'Deleted', 'status.deleted', 'Status for deleted items', 'danger'),
  (6, 'Approved', 'status.approved', 'Status for approved items', 'success'),
  (7, 'Rejected', 'status.rejected', 'Status for rejected items', 'danger'),
  (8, 'Error', 'status.error', 'Status for items with errors', 'danger'),
  (9, 'Enabled', 'status.enabled', 'Status for enabled items', 'success'),
  (10, 'Disabled', 'status.disabled', 'Status for disabled items', 'danger'),
  (11, 'Confirmed', 'status.confirmed', 'Status for approved items', 'success'),
  (12, 'Invited', 'status.invited', 'Status for invited items', 'warning'),
  (13, 'Logged', 'status.logged', 'Status for logged items', 'warning'),
  (14, 'Submitted', 'status.submitted', 'Status for submitted items', 'warning')
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
