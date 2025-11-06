-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(3) NOT NULL UNIQUE,
  description TEXT,
  status_id INTEGER NOT NULL DEFAULT 9,
  creator_admin_id UUID NOT NULL,
  assigned_admin_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_countries_status FOREIGN KEY (status_id) REFERENCES statuses(id),
  CONSTRAINT fk_countries_creator_admin FOREIGN KEY (creator_admin_id) REFERENCES admins(id),
  CONSTRAINT fk_countries_assigned_admin FOREIGN KEY (assigned_admin_id) REFERENCES admins(id),
  CONSTRAINT chk_countries_code_length CHECK (char_length(code) = 3)
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);

-- Create index on status_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_countries_status_id ON countries(status_id);

-- Create index on creator_admin_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_countries_creator_admin_id ON countries(creator_admin_id);

-- Create index on assigned_admin_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_countries_assigned_admin_id ON countries(assigned_admin_id);

-- Create trigger to update modified_at timestamp
CREATE TRIGGER update_countries_modified_at
  BEFORE UPDATE ON countries 
  FOR EACH ROW 
  EXECUTE FUNCTION update_modified_at_column();

