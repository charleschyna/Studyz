-- Create streams table
create table if not exists streams (
  id uuid primary key default uuid_generate_v4(),
  name varchar(255) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create classes table
create table if not exists classes (
  id uuid primary key default uuid_generate_v4(),
  name varchar(255) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create students table
create table if not exists students (
  id uuid primary key default uuid_generate_v4(),
  full_name varchar(255) not null,
  date_of_birth date not null,
  admission_number varchar(50) unique not null,
  gender varchar(10) not null check (gender in ('male', 'female')),
  class_id uuid references classes(id) not null,
  stream_id uuid references streams(id) not null,
  year_of_admission integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create parents table
create table if not exists parents (
  id uuid primary key default uuid_generate_v4(),
  full_name varchar(255) not null,
  email varchar(255),
  phone_number varchar(20) not null,
  relationship varchar(20) not null check (relationship in ('father', 'mother', 'guardian')),
  occupation varchar(255),
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create parent_student_relationships table
create table if not exists parent_student_relationships (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) not null,
  parent_id uuid references parents(id) not null,
  relationship_type varchar(20) not null check (relationship_type in ('father', 'mother', 'guardian')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, parent_id)
);

-- Insert initial streams
insert into streams (name) values
  ('A'),
  ('B'),
  ('C')
on conflict do nothing;

-- Insert initial classes
insert into classes (name) values
  ('Form 1'),
  ('Form 2'),
  ('Form 3'),
  ('Form 4')
on conflict do nothing;

-- Create RLS policies
alter table students enable row level security;
alter table parents enable row level security;
alter table parent_student_relationships enable row level security;

-- Admin can do everything
create policy "Admins have full access to students"
  on students for all
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins have full access to parents"
  on parents for all
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins have full access to parent_student_relationships"
  on parent_student_relationships for all
  using (auth.jwt() ->> 'role' = 'admin');

-- Teachers can read students
create policy "Teachers can view students"
  on students for select
  using (auth.jwt() ->> 'role' = 'teacher');

-- Parents can only view their linked students
create policy "Parents can view their linked students"
  on students for select
  using (
    exists (
      select 1 from parent_student_relationships psr
      where psr.student_id = students.id
      and psr.parent_id = auth.uid()
    )
  );
