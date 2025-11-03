-- Create ministries table
CREATE TABLE IF NOT EXISTS ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label VARCHAR(255) NOT NULL,
  code VARCHAR(64) NOT NULL UNIQUE,
  address TEXT,
  country_code VARCHAR(3) NOT NULL,
  creator_admin_id UUID,
  status_id INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ministries_country_code FOREIGN KEY (country_code) REFERENCES countries(code),
  CONSTRAINT fk_ministries_creator_admin_id FOREIGN KEY (creator_admin_id) REFERENCES admins(id),
  CONSTRAINT fk_ministries_status FOREIGN KEY (status_id) REFERENCES statuses(id)
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_ministries_code ON ministries(code);

-- Create index on country_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_ministries_country_code ON ministries(country_code);

-- Create index on creator_admin_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ministries_creator_admin_id ON ministries(creator_admin_id);

-- Create index on status_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ministries_status_id ON ministries(status_id);

-- Create trigger to update modified_at timestamp
CREATE TRIGGER update_ministries_modified_at
  BEFORE UPDATE ON ministries 
  FOR EACH ROW 
  EXECUTE FUNCTION update_modified_at_column();