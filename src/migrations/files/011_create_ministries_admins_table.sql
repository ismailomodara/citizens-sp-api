-- Create ministries_admins junction table
CREATE TABLE IF NOT EXISTS ministries_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id UUID NOT NULL,
  admin_id UUID NOT NULL,
  status_id INTEGER NOT NULL DEFAULT 9,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ministries_admins_ministry FOREIGN KEY (ministry_id) REFERENCES ministries(id) ON DELETE CASCADE,
  CONSTRAINT fk_ministries_admins_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
  CONSTRAINT fk_ministries_admins_status FOREIGN KEY (status_id) REFERENCES statuses(id),
  CONSTRAINT uk_ministries_admins UNIQUE (ministry_id, admin_id)
);

-- Create index on ministry_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ministries_admins_ministry_id ON ministries_admins(ministry_id);

-- Create index on admin_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ministries_admins_admin_id ON ministries_admins(admin_id);

-- Create index on status_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ministries_admins_status_id ON ministries_admins(status_id);

-- Create trigger to update modified_at timestamp
CREATE TRIGGER update_ministries_admins_modified_at
  BEFORE UPDATE ON ministries_admins 
  FOR EACH ROW 
  EXECUTE FUNCTION update_modified_at_column();

