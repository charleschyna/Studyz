-- Drop existing functions
DROP FUNCTION IF EXISTS log_activity() CASCADE;
DROP FUNCTION IF EXISTS log_student_changes() CASCADE;
DROP FUNCTION IF EXISTS log_teacher_changes() CASCADE;
DROP FUNCTION IF EXISTS log_class_changes() CASCADE;
DROP FUNCTION IF EXISTS handle_auth_events() CASCADE;

-- Drop existing table
DROP TABLE IF EXISTS activity_logs CASCADE;

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('login', 'add', 'update', 'delete')),
    description TEXT NOT NULL,
    entity_type TEXT CHECK (entity_type IN ('student', 'teacher', 'class', 'subject', 'grade', 'attendance', 'fee', 'system', 'auth')),
    entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Create a function to automatically log activities
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action_type TEXT,
    p_description TEXT,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO activity_logs (
        user_id,
        action_type,
        description,
        entity_type,
        entity_id,
        ip_address,
        user_agent
    ) VALUES (
        p_user_id,
        p_action_type,
        p_description,
        p_entity_type,
        p_entity_id,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger functions for automatic logging
CREATE OR REPLACE FUNCTION log_student_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_activity(
            auth.uid(),
            'add',
            'Added new student: ' || NEW.first_name || ' ' || NEW.last_name || ' (Admission: ' || NEW.admission_number || ')',
            'student',
            NEW.id
        );
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_activity(
            auth.uid(),
            'update',
            'Updated student: ' || NEW.first_name || ' ' || NEW.last_name || ' (Admission: ' || NEW.admission_number || ')',
            'student',
            NEW.id
        );
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_activity(
            auth.uid(),
            'delete',
            'Deleted student: ' || OLD.first_name || ' ' || OLD.last_name || ' (Admission: ' || OLD.admission_number || ')',
            'student',
            OLD.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger functions for teacher changes
CREATE OR REPLACE FUNCTION log_teacher_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_activity(
            auth.uid(),
            'add',
            'Added new teacher: ' || NEW.first_name || ' ' || NEW.last_name || ' (Email: ' || NEW.email || ')',
            'teacher',
            NEW.id
        );
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_activity(
            auth.uid(),
            'update',
            'Updated teacher: ' || NEW.first_name || ' ' || NEW.last_name || ' (Email: ' || NEW.email || ')',
            'teacher',
            NEW.id
        );
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_activity(
            auth.uid(),
            'delete',
            'Deleted teacher: ' || OLD.first_name || ' ' || OLD.last_name || ' (Email: ' || OLD.email || ')',
            'teacher',
            OLD.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger functions for class changes
CREATE OR REPLACE FUNCTION log_class_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_activity(
            auth.uid(),
            'add',
            'Added new class: ' || NEW.name || ' (Grade ' || NEW.grade_level || ', Section ' || NEW.section || ')',
            'class',
            NEW.id
        );
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_activity(
            auth.uid(),
            'update',
            'Updated class: ' || NEW.name || ' (Grade ' || NEW.grade_level || ', Section ' || NEW.section || ')',
            'class',
            NEW.id
        );
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_activity(
            auth.uid(),
            'delete',
            'Deleted class: ' || OLD.name || ' (Grade ' || OLD.grade_level || ', Section ' || OLD.section || ')',
            'class',
            OLD.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for students table
CREATE TRIGGER log_student_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON students
    FOR EACH ROW
    EXECUTE FUNCTION log_student_changes();

-- Create triggers for teachers table
CREATE TRIGGER log_teacher_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON teachers
    FOR EACH ROW
    EXECUTE FUNCTION log_teacher_changes();

-- Create triggers for classes table
CREATE TRIGGER log_class_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION log_class_changes();

-- Create a function to log authentication events
CREATE OR REPLACE FUNCTION handle_auth_events()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_logs (
        user_id,
        action_type,
        description,
        entity_type
    ) VALUES (
        NEW.id,
        'login',
        'User logged in successfully',
        'auth'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auth events
CREATE TRIGGER log_auth_events_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_auth_events();

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
