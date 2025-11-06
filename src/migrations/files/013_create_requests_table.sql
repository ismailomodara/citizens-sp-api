-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  citizen_id UUID NOT NULL,
  assigned_admin_id UUID,
  status_id INTEGER NOT NULL DEFAULT 13,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_requests_citizen FOREIGN KEY (citizen_id) REFERENCES citizens(id),
  CONSTRAINT fk_requests_assigned_admin FOREIGN KEY (assigned_admin_id) REFERENCES admins(id),
  CONSTRAINT fk_requests_status FOREIGN KEY (status_id) REFERENCES statuses(id)
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_requests_citizen_id ON requests(citizen_id);

-- Create index on status_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_requests_status_id ON requests(status_id);

-- Create trigger to update modified_at timestamp
CREATE TRIGGER update_requests_modified_at
  BEFORE UPDATE ON requests
  FOR EACH ROW 
  EXECUTE FUNCTION update_modified_at_column();

