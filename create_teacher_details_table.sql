-- Create a teacher_details table to store additional teacher information
CREATE TABLE IF NOT EXISTS public.teacher_details (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id TEXT,
  subjects TEXT,
  classes TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to the table
COMMENT ON TABLE public.teacher_details IS 'Stores additional information for teachers';

-- Enable Row Level Security
ALTER TABLE public.teacher_details ENABLE ROW LEVEL SECURITY;

-- Create policy for select
CREATE POLICY "Anyone can select teacher_details"
  ON public.teacher_details
  FOR SELECT
  USING (true);

-- Create policy for insert (admin only)
CREATE POLICY "Only admins can insert teacher_details"
  ON public.teacher_details
  FOR INSERT
  WITH CHECK (get_user_role() = 'admin');

-- Create policy for update (admin only)
CREATE POLICY "Only admins can update teacher_details"
  ON public.teacher_details
  FOR UPDATE
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Add foreign key constraint
ALTER TABLE public.teacher_details
  ADD CONSTRAINT teacher_details_id_fkey
  FOREIGN KEY (id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE; 