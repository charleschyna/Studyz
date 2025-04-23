-- Function to get class performance statistics
CREATE OR REPLACE FUNCTION get_class_performance(p_class_id UUID DEFAULT NULL, p_months INT DEFAULT 6)
RETURNS TABLE (
    subject TEXT,
    averageScore DECIMAL,
    passRate DECIMAL,
    totalStudents INT
) AS $$
BEGIN
    RETURN QUERY
    WITH student_scores AS (
        SELECT 
            s.subject_name,
            g.score,
            CASE WHEN g.score >= 50 THEN 1 ELSE 0 END as passed
        FROM grades g
        JOIN subjects s ON g.subject_id = s.id
        JOIN students st ON g.student_id = st.id
        WHERE (p_class_id IS NULL OR st.class_id = p_class_id)
        AND g.created_at >= NOW() - (p_months || ' months')::INTERVAL
    )
    SELECT 
        subject_name,
        ROUND(AVG(score)::DECIMAL, 2) as average_score,
        ROUND((SUM(passed)::DECIMAL / COUNT(*) * 100), 2) as pass_rate,
        COUNT(DISTINCT g.student_id) as total_students
    FROM student_scores
    GROUP BY subject_name
    ORDER BY average_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get attendance statistics
CREATE OR REPLACE FUNCTION get_attendance_stats(p_class_id UUID DEFAULT NULL, p_months INT DEFAULT 6)
RETURNS TABLE (
    month TEXT,
    present INT,
    absent INT,
    late INT,
    attendanceRate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH monthly_stats AS (
        SELECT 
            TO_CHAR(date, 'Mon YYYY') as month,
            SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
            SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
            SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
            COUNT(*) as total_count
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE (p_class_id IS NULL OR s.class_id = p_class_id)
        AND date >= NOW() - (p_months || ' months')::INTERVAL
        GROUP BY TO_CHAR(date, 'Mon YYYY')
        ORDER BY MIN(date)
    )
    SELECT 
        month,
        present_count,
        absent_count,
        late_count,
        ROUND((present_count::DECIMAL / total_count * 100), 2) as attendance_rate
    FROM monthly_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to get fees collection statistics
CREATE OR REPLACE FUNCTION get_fees_collection_stats(p_class_id UUID DEFAULT NULL, p_months INT DEFAULT 6)
RETURNS TABLE (
    month TEXT,
    amountPaid DECIMAL,
    outstanding DECIMAL,
    collectionRate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH monthly_stats AS (
        SELECT 
            TO_CHAR(payment_date, 'Mon YYYY') as month,
            SUM(amount_paid) as collected,
            SUM(fs.amount) as total_due
        FROM fee_payments fp
        JOIN students s ON fp.student_id = s.id
        JOIN fee_structure fs ON s.class_id = fs.class_id
        WHERE (p_class_id IS NULL OR s.class_id = p_class_id)
        AND payment_date >= NOW() - (p_months || ' months')::INTERVAL
        GROUP BY TO_CHAR(payment_date, 'Mon YYYY')
        ORDER BY MIN(payment_date)
    )
    SELECT 
        month,
        collected,
        (total_due - collected) as outstanding,
        ROUND((collected::DECIMAL / total_due * 100), 2) as collection_rate
    FROM monthly_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to get enrollment statistics
CREATE OR REPLACE FUNCTION get_enrollment_stats(p_class_id UUID DEFAULT NULL)
RETURNS TABLE (
    class TEXT,
    students INT,
    capacity INT,
    fillRate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.name as class,
        COUNT(s.id) as student_count,
        c.capacity,
        ROUND((COUNT(s.id)::DECIMAL / c.capacity * 100), 2) as fill_rate
    FROM classes c
    LEFT JOIN students s ON c.id = s.class_id
    WHERE (p_class_id IS NULL OR c.id = p_class_id)
    GROUP BY c.id, c.name, c.capacity
    ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;
