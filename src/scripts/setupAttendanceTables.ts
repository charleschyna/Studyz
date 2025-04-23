import { supabase } from '../integrations/supabase/client';
import { addDays, format, subDays } from 'date-fns';

interface Student {
  id: string;
}

async function setupAttendanceTables() {
  try {
    console.log('Generating sample attendance data...');

    // Get all students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id');

    if (studentsError) {
      throw studentsError;
    }

    if (!students || students.length === 0) {
      throw new Error('No students found');
    }

    // Type check each student
    const validStudents = students.filter((student): student is Student => {
      return student && typeof student === 'object' && 'id' in student;
    });

    if (validStudents.length === 0) {
      throw new Error('No valid student records found');
    }

    // Get admin user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw userError || new Error('No authenticated user');
    }

    // Generate attendance records for the last 30 days
    const attendanceRecords = [];
    const startDate = subDays(new Date(), 30);
    const endDate = new Date();

    for (const student of validStudents) {
      let currentDate = startDate;
      while (currentDate <= endDate) {
        // Skip weekends
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          // Generate random status with higher probability for 'present'
          let status: 'present' | 'absent' | 'late';
          const rand = Math.random();
          if (rand < 0.8) {
            status = 'present';
          } else if (rand < 0.9) {
            status = 'absent';
          } else {
            status = 'late';
          }

          attendanceRecords.push({
            student_id: student.id,
            date: format(currentDate, 'yyyy-MM-dd'),
            status,
            marked_by: user.id,
          });
        }
        currentDate = addDays(currentDate, 1);
      }
    }

    // Insert attendance records in batches of 100
    const batchSize = 100;
    for (let i = 0; i < attendanceRecords.length; i += batchSize) {
      const batch = attendanceRecords.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('attendance')
        .upsert(batch, { onConflict: 'student_id,date' });

      if (insertError) {
        console.error('Error inserting batch:', insertError);
      }
    }

    console.log(`Successfully generated ${attendanceRecords.length} attendance records!`);
  } catch (error) {
    console.error('Error generating attendance data:', error);
  }
}

setupAttendanceTables();
