-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(10) CHECK (status IN ('present', 'absent', 'late')) NOT NULL,
    marked_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, date)
);

-- Create attendance_summary materialized view for faster queries
CREATE MATERIALIZED VIEW IF NOT EXISTS attendance_summary AS
SELECT 
    student_id,
    COUNT(*) as total_days,
    SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
    SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
    SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
    ROUND(
        (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)::DECIMAL) * 100,
        2
    ) as attendance_rate,
    MIN(date) as first_day,
    MAX(date) as last_day
FROM attendance
GROUP BY student_id;

-- Create function to refresh attendance_summary
CREATE OR REPLACE FUNCTION refresh_attendance_summary()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW attendance_summary;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh attendance_summary
DROP TRIGGER IF EXISTS refresh_attendance_summary ON attendance;
CREATE TRIGGER refresh_attendance_summary
    AFTER INSERT OR UPDATE OR DELETE ON attendance
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_attendance_summary();

-- Create RLS policies
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Allow teachers and admins to view all attendance records
CREATE POLICY "View attendance for teachers and admins"
    ON attendance
    FOR SELECT
    TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('teacher', 'admin')
    );

-- Allow teachers and admins to insert attendance records
CREATE POLICY "Insert attendance for teachers and admins"
    ON attendance
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'role' IN ('teacher', 'admin')
    );

-- Allow teachers and admins to update attendance records
CREATE POLICY "Update attendance for teachers and admins"
    ON attendance
    FOR UPDATE
    TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('teacher', 'admin')
    )
    WITH CHECK (
        auth.jwt() ->> 'role' IN ('teacher', 'admin')
    );

-- Create function to generate sample attendance data
CREATE OR REPLACE FUNCTION generate_sample_attendance()
RETURNS void AS $$
DECLARE
    student record;
    current_date date;
    status_options varchar[] := ARRAY['present', 'absent', 'late'];
    random_status varchar;
    admin_id uuid;
BEGIN
    -- Get the first admin user's ID
    SELECT id INTO admin_id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin' LIMIT 1;
    
    -- Generate attendance for the last 30 days
    FOR student IN SELECT id FROM students LOOP
        current_date := CURRENT_DATE - INTERVAL '30 days';
        WHILE current_date <= CURRENT_DATE LOOP
            -- Skip weekends
            IF EXTRACT(DOW FROM current_date) NOT IN (0, 6) THEN
                -- Generate random status with higher probability for 'present'
                IF random() < 0.8 THEN
                    random_status := 'present';
                ELSIF random() < 0.5 THEN
                    random_status := 'absent';
                ELSE
                    random_status := 'late';
                END IF;

                -- Insert attendance record
                INSERT INTO attendance (student_id, date, status, marked_by)
                VALUES (student.id, current_date, random_status, admin_id)
                ON CONFLICT (student_id, date) DO NOTHING;
            END IF;
            
            current_date := current_date + INTERVAL '1 day';
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate sample data
SELECT generate_sample_attendance();
