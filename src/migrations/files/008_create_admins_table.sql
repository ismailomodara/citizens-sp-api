-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(64) NOT NULL,
  firstname VARCHAR(128),
  lastname VARCHAR(128),
  country VARCHAR(3) NOT NULL,
  role_id INTEGER NOT NULL,
  locale_id INTEGER NOT NULL DEFAULT 1,
  status_id INTEGER NOT NULL DEFAULT 12,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admins_role FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_admins_locale FOREIGN KEY (locale_id) REFERENCES locales(id),
  CONSTRAINT fk_admins_status FOREIGN KEY (status_id) REFERENCES statuses(id),
  CONSTRAINT chk_admins_country_length CHECK (char_length(country) = 3)
);

-- Insert default roles
INSERT INTO admins (email, password, firstname, lastname, country, role_id) VALUES
  ('system@admin.com', 'qwer1234', 'System', 'Admin', 'QAT', 1);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Create index on status_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_status_id ON admins(status_id);

-- Create index on locale_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_locale_id ON admins(locale_id);

-- Create index on country for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_country ON admins(country);

-- Create trigger to update modified_at timestamp
CREATE TRIGGER update_admins_modified_at
  BEFORE UPDATE ON admins
  FOR EACH ROW 
  EXECUTE FUNCTION update_modified_at_column();

