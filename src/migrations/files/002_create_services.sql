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
INSERT INTO services (id, label, code, description) VALUES
   (1, 'Education', 'education', 'The education sector'),
   (2, 'Housing', 'housing', 'The housing sector'),
   (3, 'Electricity', 'electricity', 'The electricity sector'),
   (4, 'Food', 'food', 'The food sector'),
   (5, 'Healthcare', 'healthcare', 'The healthcare sector'),
   (6, 'Transportation', 'transportation',  'The transportation sector'),
   (7, 'Utilities', 'utilities', 'The utilities sector'),
   (8, 'Police', 'police', 'The police sector'),
   (9, 'Legal', 'legal', 'The legal sector'),
   (10, 'Social Services', 'social_services', 'The social services sector'),
   (11, 'Military', 'military', 'The military sector'),
   (12, 'Tax', 'tax', 'The tax sector'),
   (13, 'Others', 'others', 'The others sector')
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

