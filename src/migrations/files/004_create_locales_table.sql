-- Create locales table
CREATE TABLE IF NOT EXISTS locales (
    id SERIAL PRIMARY KEY,
    label VARCHAR(32) NOT NULL UNIQUE,
    code VARCHAR(2) NOT NULL UNIQUE,
    description TEXT,
    status_id INTEGER NOT NULL DEFAULT 9,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_locales_status FOREIGN KEY (status_id) REFERENCES statuses(id)
);

-- Insert initial statuses based on Statuses enum
-- Ids map to Statuses Enum in Types
INSERT INTO locales (id, label, code, description) VALUES
(1, 'English', 'EN', 'The English locale'),
(2, 'Arabic', 'AR', 'The Arabic locale')
    ON CONFLICT (id) DO UPDATE SET
    label = EXCLUDED.label,
    code = EXCLUDED.code,
    description = EXCLUDED.description,
    modified_at = CURRENT_TIMESTAMP;

-- Create trigger to update modified_at timestamp
CREATE TRIGGER update_locales_modified_at
    BEFORE UPDATE ON locales
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_at_column();

