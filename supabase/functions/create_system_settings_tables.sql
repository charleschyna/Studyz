-- Create system_configs table
CREATE TABLE IF NOT EXISTS system_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    variables TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system configurations
INSERT INTO system_configs (key, value, category, description)
VALUES
    -- General Settings
    ('school_name', 'My School', 'general', 'School Name'),
    ('school_address', '123 Education St', 'general', 'School Address'),
    ('contact_email', 'admin@school.com', 'general', 'Contact Email'),
    ('contact_phone', '+1234567890', 'general', 'Contact Phone'),
    ('academic_year', '2025', 'general', 'Current Academic Year'),
    ('term', '1', 'general', 'Current Term'),
    
    -- Security Settings
    ('password_expiry_days', '90', 'security', 'Password Expiry Period (Days)'),
    ('max_login_attempts', '5', 'security', 'Maximum Login Attempts'),
    ('2fa_enabled', 'false', 'security', 'Enable Two-Factor Authentication'),
    ('session_timeout', '30', 'security', 'Session Timeout (Minutes)'),
    ('password_min_length', '8', 'security', 'Minimum Password Length'),
    
    -- Backup Settings
    ('backup_schedule', 'daily', 'backup', 'Backup Schedule'),
    ('backup_retention_days', '30', 'backup', 'Backup Retention Period (Days)'),
    ('maintenance_mode', 'false', 'backup', 'Maintenance Mode')
ON CONFLICT (key) DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates (name, subject, body, variables)
VALUES
    ('Welcome Email', 
     'Welcome to {school_name}', 
     'Dear {user_name},\n\nWelcome to {school_name}! Your account has been successfully created.\n\nBest regards,\nThe {school_name} Team', 
     ARRAY['school_name', 'user_name']),
    
    ('Password Reset', 
     'Password Reset Request', 
     'Dear {user_name},\n\nA password reset has been requested for your account. Click the link below to reset your password:\n\n{reset_link}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe {school_name} Team', 
     ARRAY['school_name', 'user_name', 'reset_link']),
    
    ('Fee Payment Reminder', 
     'Fee Payment Reminder for {term_name}', 
     'Dear {parent_name},\n\nThis is a reminder that the fee payment for {student_name} for {term_name} is due on {due_date}. The outstanding amount is {amount}.\n\nPlease ensure timely payment.\n\nBest regards,\nThe {school_name} Team', 
     ARRAY['school_name', 'parent_name', 'student_name', 'term_name', 'due_date', 'amount']),
    
    ('Attendance Alert', 
     'Attendance Alert for {student_name}', 
     'Dear {parent_name},\n\nThis is to inform you that {student_name} was marked as {status} on {date}.\n\nBest regards,\nThe {school_name} Team', 
     ARRAY['school_name', 'parent_name', 'student_name', 'status', 'date'])
ON CONFLICT (name) DO NOTHING;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_system_configs_updated_at
    BEFORE UPDATE ON system_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
