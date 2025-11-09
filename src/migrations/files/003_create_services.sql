-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  label VARCHAR(64) NOT NULL,
  code VARCHAR(64) NOT NULL UNIQUE,
  description TEXT,
  status_id INTEGER NOT NULL DEFAULT 9,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_services_status FOREIGN KEY (status_id) REFERENCES statuses(id)
);

-- Insert initial statuses based on Statuses enum
-- Ids map to Statuses Enum in Types
INSERT INTO services (label, code, description) VALUES
   ('Education', 'services.education', 'The education sector'),
   ('Housing', 'services.housing', 'The housing sector'),
   ('Electricity', 'services.electricity', 'The electricity sector'),
   ('Food', 'services.food', 'The food sector'),
   ('Healthcare', 'services.healthcare', 'The healthcare sector'),
   ('Transportation', 'services.transportation',  'The transportation sector'),
   ('Utilities', 'services.utilities', 'The utilities sector'),
   ('Police', 'services.police', 'The police sector'),
   ('Legal', 'services.legal', 'The legal sector'),
   ('Social Services', 'services.social_services', 'The social services sector'),
   ('Military', 'services.military', 'The military sector'),
   ('Tax', 'services.tax', 'The tax sector'),
   ('Others', 'services.others', 'The others sector')
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

