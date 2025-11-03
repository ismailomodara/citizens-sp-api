-- Create citizens table
CREATE TABLE IF NOT EXISTS citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  firstname VARCHAR(255),
  lastname VARCHAR(255),
  country VARCHAR(3) NOT NULL,
  status_id INTEGER NOT NULL DEFAULT 9,
  locale_id INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_citizens_status FOREIGN KEY (status_id) REFERENCES statuses(id),
  CONSTRAINT fk_citizens_locale FOREIGN KEY (locale_id) REFERENCES locales(id),
  CONSTRAINT chk_citizens_country_length CHECK (char_length(country) = 3)
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_citizens_email ON citizens(email);

-- Create index on status_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_citizens_status_id ON citizens(status_id);

-- Create index on locale_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_citizens_locale_id ON citizens(locale_id);

-- Create index on country for faster lookups
CREATE INDEX IF NOT EXISTS idx_citizens_country ON citizens(country);

-- Create trigger to update modified_at timestamp
CREATE TRIGGER update_citizens_modified_at
  BEFORE UPDATE ON citizens 
  FOR EACH ROW 
  EXECUTE FUNCTION update_modified_at_column();

