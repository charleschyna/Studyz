-- Create function to create streams table
create or replace function create_streams_table()
returns void
language plpgsql
security definer
as $$
begin
  create table if not exists streams (
    id uuid primary key default uuid_generate_v4(),
    name varchar(255) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- Insert initial streams if table was just created
  insert into streams (name)
  select name from (values ('A'), ('B'), ('C')) as s(name)
  where not exists (select 1 from streams);
end;
$$;

-- Create function to create classes table
create or replace function create_classes_table()
returns void
language plpgsql
security definer
as $$
begin
  create table if not exists classes (
    id uuid primary key default uuid_generate_v4(),
    name varchar(255) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- Insert initial classes if table was just created
  insert into classes (name)
  select name from (values ('Form 1'), ('Form 2'), ('Form 3'), ('Form 4')) as c(name)
  where not exists (select 1 from classes);
end;
$$;

-- Create function to create students table
create or replace function create_students_table()
returns void
language plpgsql
security definer
as $$
begin
  create table if not exists students (
    id uuid primary key default uuid_generate_v4(),
    full_name varchar(255) not null,
    date_of_birth date not null,
    admission_no varchar(50) unique not null,
    gender varchar(10) not null check (gender in ('male', 'female')),
    class_id uuid references classes(id) not null,
    stream_id uuid references streams(id) not null,
    year_of_admission integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );
end;
$$;

-- Create function to create parents table
create or replace function create_parents_table()
returns void
language plpgsql
security definer
as $$
begin
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
end;
$$;

-- Create function to create parent_student_relationships table
create or replace function create_parent_student_relationships_table()
returns void
language plpgsql
security definer
as $$
begin
  create table if not exists parent_student_relationships (
    id uuid primary key default uuid_generate_v4(),
    student_id uuid references students(id) not null,
    parent_id uuid references parents(id) not null,
    relationship_type varchar(20) not null check (relationship_type in ('father', 'mother', 'guardian')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(student_id, parent_id)
  );
end;
$$;
