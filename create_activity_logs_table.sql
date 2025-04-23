-- Create activity_logs table to track system activities
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('login', 'update', 'add', 'delete')),
  description TEXT NOT NULL,
  entity_type TEXT, -- e.g., 'student', 'teacher', 'class', 'grade'
  entity_id TEXT,   -- ID of the affected entity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB    -- Additional information specific to the action
);

-- Add comment to the table
COMMENT ON TABLE public.activity_logs IS 'System activity logs for auditing and dashboard display';

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for access
CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (get_user_role() = 'admin');

CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_action_type ON public.activity_logs(action_type);

-- Create function to add log automatically
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.activity_logs (
        user_id, 
        action_type, 
        description, 
        entity_type, 
        entity_id,
        metadata
    ) VALUES (
        auth.uid(), 
        TG_ARGV[0], 
        TG_ARGV[1], 
        TG_ARGV[2], 
        NEW.id,
        jsonb_build_object('table', TG_TABLE_NAME, 'record', row_to_json(NEW))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 