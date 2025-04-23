import { faker } from '@faker-js/faker';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Common Kenyan first names and last names
const kenyanFirstNames = [
  'Aisha', 'Amani', 'Bahati', 'Baraka', 'Chioma', 'Dalila', 'Faraji', 'Furaha', 
  'Gathoni', 'Imani', 'Jabali', 'Jomo', 'Kamau', 'Kendi', 'Kimani', 'Kwame', 
  'Makena', 'Malaika', 'Mwangi', 'Njeri', 'Nyambura', 'Ochieng', 'Otieno', 'Ruto',
  'Samwel', 'Shani', 'Thabiti', 'Uhuru', 'Wambui', 'Wangari', 'Zuri', 'Zawadi',
  'John', 'Mary', 'Peter', 'Faith', 'Hope', 'Grace', 'Daniel', 'David', 'Sarah',
  'James', 'Joseph', 'Samuel', 'Ruth', 'Esther', 'Moses', 'Joshua', 'Elizabeth'
];

const kenyanLastNames = [
  'Kamau', 'Ochieng', 'Maina', 'Wanjiku', 'Otieno', 'Kimani', 'Njoroge', 'Omondi',
  'Kariuki', 'Ngugi', 'Mutua', 'Wambui', 'Kipchoge', 'Ruto', 'Kenyatta', 'Odinga',
  'Mwangi', 'Nyong\'o', 'Auma', 'Odhiambo', 'Kiprono', 'Cherono', 'Kiplagat',
  'Wekesa', 'Barasa', 'Njuguna', 'Gathoni', 'Mucheru', 'Githinji', 'Waweru'
];

// Kenyan counties for addresses
const kenyanCounties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Machakos', 'Kisii', 
  'Thika', 'Malindi', 'Kitale', 'Garissa', 'Nyeri', 'Kakamega', 'Meru'
];

type Student = Database['public']['Tables']['students']['Insert'];
type Parent = Database['public']['Tables']['parents']['Insert'];
type ParentStudent = Database['public']['Tables']['parent_students']['Insert'];

const generateKenyanPhoneNumber = () => {
  const prefixes = ['0700', '0701', '0702', '0703', '0710', '0711', '0712', '0720', '0721', '0722', '0723', '0724'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return prefix + suffix;
};

const generateKenyanName = () => {
  const firstName = kenyanFirstNames[Math.floor(Math.random() * kenyanFirstNames.length)];
  const lastName = kenyanLastNames[Math.floor(Math.random() * kenyanLastNames.length)];
  const middleName = kenyanFirstNames[Math.floor(Math.random() * kenyanFirstNames.length)];
  return `${firstName} ${middleName} ${lastName}`;
};

const generateAdmissionNumber = (year: number, index: number) => {
  return `${year}/${index.toString().padStart(3, '0')}`;
};

const createTables = async () => {
  console.log('Creating tables...');

  try {
    // Create streams table
    console.log('Creating streams table...');
    const { error: streamsError } = await supabase.rpc('create_streams_table');
    if (streamsError) {
      console.error('Error creating streams table:', streamsError);
      throw streamsError;
    }

    // Create classes table
    console.log('Creating classes table...');
    const { error: classesError } = await supabase.rpc('create_classes_table');
    if (classesError) {
      console.error('Error creating classes table:', classesError);
      throw classesError;
    }

    // Create students table
    console.log('Creating students table...');
    const { error: studentsError } = await supabase.rpc('create_students_table');
    if (studentsError) {
      console.error('Error creating students table:', studentsError);
      throw studentsError;
    }

    // Create parents table
    console.log('Creating parents table...');
    const { error: parentsError } = await supabase.rpc('create_parents_table');
    if (parentsError) {
      console.error('Error creating parents table:', parentsError);
      throw parentsError;
    }

    // Create parent_student_relationships table
    console.log('Creating parent_student_relationships table...');
    const { error: relationshipsError } = await supabase.rpc('create_parent_student_relationships_table');
    if (relationshipsError) {
      console.error('Error creating parent_student_relationships table:', relationshipsError);
      throw relationshipsError;
    }

    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

const initializeData = async () => {
  console.log('Initializing data...');

  try {
    // Check if streams exist
    console.log('Checking streams...');
    const { data: streams, error: streamsError } = await supabase
      .from('streams')
      .select('id, name');
    
    if (streamsError) {
      console.error('Error checking streams:', streamsError);
      throw streamsError;
    }

    // Insert initial streams if none exist
    if (!streams || streams.length === 0) {
      console.log('Creating initial streams...');
      const { error } = await supabase
        .from('streams')
        .insert([
          { name: 'A' },
          { name: 'B' },
          { name: 'C' }
        ]);
      
      if (error) {
        console.error('Error creating streams:', error);
        throw error;
      }
    }

    // Check if classes exist
    console.log('Checking classes...');
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('id, name');
    
    if (classesError) {
      console.error('Error checking classes:', classesError);
      throw classesError;
    }

    // Insert initial classes if none exist
    if (!classes || classes.length === 0) {
      console.log('Creating initial classes...');
      const { error } = await supabase
        .from('classes')
        .insert([
          { name: 'Form 1' },
          { name: 'Form 2' },
          { name: 'Form 3' },
          { name: 'Form 4' }
        ]);
      
      if (error) {
        console.error('Error creating classes:', error);
        throw error;
      }
    }

    console.log('Initial data setup completed');
    return true;
  } catch (error) {
    console.error('Error initializing data:', error);
    throw error;
  }
};

const generateData = async () => {
  try {
    console.log('Connecting to Supabase...');
    
    // Initialize data first
    await initializeData();
    
    // First, fetch all classes and streams
    console.log('Fetching classes...');
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('id, name');
    
    if (classesError) {
      console.error('Error checking classes:', classesError);
      throw classesError;
    }

    console.log('Fetching streams...');
    const { data: streams, error: streamsError } = await supabase
      .from('streams')
      .select('id, name');
    
    if (streamsError) {
      console.error('Error checking streams:', streamsError);
      throw streamsError;
    }

    if (!classes || !streams) {
      throw new Error('No classes or streams found');
    }

    console.log(`Found ${classes.length} classes and ${streams.length} streams`);

    const students: Student[] = [];
    const parents: Parent[] = [];
    const relationships: ParentStudent[] = [];

    // Get class and stream IDs once at the start
    const { data: classData } = await supabase
      .from('classes')
      .select('id, name')
      .single();

    if (!classData || !('id' in classData)) {
      throw new Error('No class found or invalid response');
    }

    const { data: streamData } = await supabase
      .from('streams')
      .select('id, name')
      .single();

    if (!streamData || !('id' in streamData)) {
      throw new Error('No stream found or invalid response');
    }

    const classId = classData.id;
    const streamId = streamData.id;

    // Generate 700 students
    for (let i = 0; i < 700; i++) {
      const yearOfAdmission = 2021 + Math.floor(Math.random() * 4);
      const classIndex = 2025 - yearOfAdmission;
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const timestamp = new Date().toISOString();

      const student: Student = {
        full_name: generateKenyanName(),
        date_of_birth: faker.date.between({ 
          from: new Date(2006, 0, 1), 
          to: new Date(2009, 11, 31) 
        }).toISOString().split('T')[0],
        admission_no: generateAdmissionNumber(yearOfAdmission, i + 1),
        gender,
        class_id: classId,
        stream_id: streamId,
        year_of_admission: yearOfAdmission,
        created_at: timestamp,
        updated_at: timestamp
      };

      const { data: insertedStudent, error: studentError } = await supabase
        .from('students')
        .insert(student)
        .select()
        .single();

      if (studentError) {
        console.error('Error inserting student:', studentError);
        throw studentError;
      }

      if (!insertedStudent) {
        throw new Error('Failed to insert student');
      }

      // Generate 1-2 parents for each student
      const numParents = Math.random() > 0.3 ? 2 : 1;
      for (let j = 0; j < numParents; j++) {
        const parentFirstName = faker.person.firstName();
        const parentLastName = faker.person.lastName();
        const parentFullName = `${parentFirstName} ${parentLastName}`;
        const relationship = j === 0 ? 'Father' : 'Mother';
        const phoneNumber = generateKenyanPhoneNumber();
        
        const parent: Parent = {
          full_name: parentFullName,
          email: faker.internet.email({ firstName: parentFirstName, lastName: parentLastName }).toLowerCase(),
          phone_number: phoneNumber,
          relationship,
          occupation: faker.person.jobTitle(),
          address: `${faker.location.streetAddress()}, ${kenyanCounties[Math.floor(Math.random() * kenyanCounties.length)]}`,
          created_at: timestamp,
          updated_at: timestamp
        };
        
        const { data: insertedParent, error: parentError } = await supabase
          .from('parents')
          .insert(parent)
          .select()
          .single();

        if (parentError) {
          console.error('Error inserting parent:', parentError);
          throw parentError;
        }

        if (!insertedParent) {
          throw new Error('Failed to insert parent');
        }

        const parentStudent: ParentStudent = {
          student_id: insertedStudent.id,
          parent_id: insertedParent.id,
          created_at: timestamp
        };
        
        const { error: relationshipError } = await supabase
          .from('parent_students')
          .insert(parentStudent);

        if (relationshipError) {
          console.error('Error inserting relationship:', relationshipError);
          throw relationshipError;
        }

        console.log(`Created student ${i + 1}/700 with parent ${j + 1}/${numParents}`);
      }
    }

    console.log('Data generation completed successfully!');
    console.log(`Generated:
    - 700 students
    - ${parents.length} parents
    - ${relationships.length} parent-student relationships`);

  } catch (error) {
    console.error('Error inserting data:', error);
    throw error;
  }
};

export const runDataGeneration = () => {
  console.log('Starting data generation...');
  generateData()
    .then(() => {
      console.log('Data generation completed successfully');
      process.exit(0);
    })
    .catch(error => {
      if (error.error?.message) {
        console.error('Supabase Error:', error.error.message);
        if (error.error?.details) {
          console.error('Details:', error.error.details);
        }
      } else if (error.message) {
        console.error('Error:', error.message);
      } else {
        console.error('Unknown error:', error);
      }
      process.exit(1);
    });
};

// Run the data generation when this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Initializing script...');
  runDataGeneration();
}
