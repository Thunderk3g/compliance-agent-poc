-- Add project_id to agent_executions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'agent_executions'
        AND column_name = 'project_id'
    ) THEN
        ALTER TABLE agent_executions ADD COLUMN project_id uuid;
        -- Assuming there is a projects or collections table, but since I haven't confirmed its name 100%, 
        -- I will leave the FK constraint commented out or loosely typed for now to avoid errors.
        -- If confident, uncomment: 
        -- ALTER TABLE agent_executions ADD CONSTRAINT fk_agent_executions_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
        
        create index ix_agent_executions_project_id on agent_executions (project_id);
    END IF;
END $$;
