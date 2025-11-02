-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  label VARCHAR(64) NOT NULL,
  code VARCHAR(64) NOT NULL UNIQUE,
  description TEXT,
  status_id INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_services_status FOREIGN KEY (status_id) REFERENCES statuses(id)
);

-- Insert initial statuses based on Statuses enum
-- Ids map to Statuses Enum in Types
INSERT INTO services (label, code, description) VALUES
   ('Education', 'education', 'The education sector'),
   ('Housing', 'housing', 'The housing sector'),
   ('Electricity', 'electricity', 'The electricity sector'),
   ('Food', 'food', 'The food sector'),
   ('Healthcare', 'healthcare', 'The healthcare sector'),
   ('Transportation', 'transportation',  'The transportation sector'),
   ('Utilities', 'utilities', 'The utilities sector'),
   ('Police', 'police', 'The police sector'),
   ('Legal', 'legal', 'The legal sector'),
   ('Social Services', 'social_services', 'The social services sector'),
   ('Military', 'military', 'The military sector'),
   ('Tax', 'tax', 'The tax sector'),
   ('Others', 'others', 'The others sector')
ON CONFLICT (id) DO UPDATE SET
    label = EXCLUDED.label,
    code = EXCLUDED.code,
    description = EXCLUDED.description,
    modified_at = CURRENT_TIMESTAMP;

-- Create trigger to update modified_at timestamp
CREATE TRIGGER update_services_modified_at
  BEFORE UPDATE ON services
  FOR EACH ROW 
  EXECUTE FUNCTION update_modified_at_column();

