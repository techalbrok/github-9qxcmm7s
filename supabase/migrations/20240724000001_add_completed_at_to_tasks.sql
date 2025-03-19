-- Add completed_at column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Update existing completed tasks to have a completed_at timestamp
UPDATE tasks SET completed_at = NOW() WHERE completed = true AND completed_at IS NULL;
