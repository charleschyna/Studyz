import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

async function generateSampleData() {
    try {
        // 1. First, let's ensure we have some subjects
        const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography'];
        for (const subject of subjects) {
            const { data: existingSubject } = await supabase
                .from('subjects')
                .select('id')
                .eq('subject_name', subject)
                .single();

            if (!existingSubject) {
                await supabase
                    .from('subjects')
                    .insert({ subject_name: subject });
            }
        }

        // 2. Get all students
        const { data: students } = await supabase
            .from('students')
            .select('id, class_id');

        if (!students || students.length === 0) {
            console.error('No students found. Please run student generation script first.');
            return;
        }

        // 3. Generate grades for each student
        for (const student of students) {
            const { data: subjects } = await supabase
                .from('subjects')
                .select('id, subject_name');

            if (!subjects) continue;

            // Generate grades for last 6 months
            for (const subject of subjects) {
                const score = Math.floor(Math.random() * 51) + 50; // Random score between 50-100
                await supabase
                    .from('grades')
                    .insert({
                        student_id: student.id,
                        subject_id: subject.id,
                        score,
                        term: '1',
                        academic_year: '2025'
                    });
            }
        }

        // 4. Generate attendance records
        for (const student of students) {
            // Generate attendance for last 30 days
            for (let i = 0; i < 30; i++) {
                const date = subDays(new Date(), i);
                const status = Math.random() > 0.9 
                    ? 'absent' 
                    : Math.random() > 0.8 
                        ? 'late' 
                        : 'present';

                await supabase
                    .from('attendance')
                    .insert({
                        student_id: student.id,
                        date: format(date, 'yyyy-MM-dd'),
                        status
                    });
            }
        }

        // 5. Generate fee payments
        for (const student of students) {
            // Get fee structure for student's class
            const { data: feeStructure } = await supabase
                .from('fee_structure')
                .select('amount')
                .eq('class_id', student.class_id)
                .eq('term', '1')
                .single();

            if (!feeStructure) continue;

            const totalFees = feeStructure.amount;
            const amountPaid = Math.random() > 0.3 
                ? totalFees  // 70% chance of full payment
                : totalFees * (Math.random() * 0.8 + 0.1); // 10-90% of total fees

            await supabase
                .from('fee_payments')
                .insert({
                    student_id: student.id,
                    term: '1',
                    amount_paid: amountPaid,
                    payment_date: new Date().toISOString(),
                    payment_method: Math.random() > 0.5 ? 'M-Pesa' : 'Bank',
                    status: 'success'
                });
        }

        console.log('Sample analytics data generated successfully!');

    } catch (error) {
        console.error('Error generating sample data:', error);
    }
}

generateSampleData();
