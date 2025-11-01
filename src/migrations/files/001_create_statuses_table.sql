-- Create statuses table
CREATE TABLE IF NOT EXISTS statuses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial statuses based on Statuses enum
-- Enum values: ACTIVE=1, INACTIVE=2, PENDING=3, DELETED=4, APPROVED=5, REJECTED=6, ERROR=7, ENABLED=8, DISABLED=9
INSERT INTO statuses (id, name, description, color) VALUES
  (1, 'ACTIVE', 'Status for active items', 'green'),
  (2, 'INACTIVE', 'Status for inactive items', 'gray'),
  (3, 'PENDING', 'Status for pending items', 'yellow'),
  (4, 'DELETED', 'Status for deleted items', 'red'),
  (5, 'APPROVED', 'Status for approved items', 'blue'),
  (6, 'REJECTED', 'Status for rejected items', 'red'),
  (7, 'ERROR', 'Status for items with errors', 'red'),
  (8, 'ENABLED', 'Status for enabled items', 'green'),
  (9, 'DISABLED', 'Status for disabled items', 'orange')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  updated_at = CURRENT_TIMESTAMP;

-- Reset the sequence to continue after the highest ID
SELECT setval('statuses_id_seq', (SELECT MAX(id) FROM statuses));

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_statuses_name ON statuses(name);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_statuses_updated_at 
  BEFORE UPDATE ON statuses 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
