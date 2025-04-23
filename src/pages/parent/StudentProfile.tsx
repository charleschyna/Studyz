
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GraduationCap, Calendar, Book, Users, Phone } from 'lucide-react';

const StudentProfile: React.FC = () => {
  // Mock data - would be replaced with actual data from Supabase
  const studentInfo = {
    id: '1',
    full_name: 'John Doe',
    admission_no: 'ADM123456',
    class: 'Form 3',
    stream: 'North',
    year_of_admission: 2023,
    dateOfBirth: '2008-05-15',
    gender: 'Male'
  };

  const academicInfo = {
    stream: 'North',
    class_teacher: 'Mr. Charles Omondi',
    subjects: [
      'Mathematics', 'English', 'Kiswahili', 'Physics', 
      'Chemistry', 'Biology', 'History', 'Geography'
    ]
  };

  const parentInfo = {
    father: {
      name: 'Robert Doe',
      phone: '+254712345678',
      email: 'robert.doe@example.com',
      occupation: 'Engineer'
    },
    mother: {
      name: 'Mary Doe',
      phone: '+254798765432',
      email: 'mary.doe@example.com',
      occupation: 'Doctor'
    },
    guardian: {
      name: 'N/A',
      phone: 'N/A',
      email: 'N/A',
      occupation: 'N/A'
    }
  };

  const emergencyContacts = [
    {
      name: 'Robert Doe',
      relationship: 'Father',
      phone: '+254712345678'
    },
    {
      name: 'Mary Doe',
      relationship: 'Mother',
      phone: '+254798765432'
    },
    {
      name: 'Janet Doe',
      relationship: 'Aunt',
      phone: '+254723456789'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Profile</h1>
        <p className="text-muted-foreground">View detailed information about your child</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6 flex flex-col items-center">
            <Avatar className="h-32 w-32">
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                {studentInfo.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-semibold">{studentInfo.full_name}</h2>
            <p className="text-muted-foreground">{studentInfo.admission_no}</p>
            <div className="mt-6 w-full space-y-3">
              <div className="flex items-center">
                <GraduationCap className="h-5 w-5 text-muted-foreground mr-2" />
                <span>
                  <strong>Class:</strong> {studentInfo.class}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-muted-foreground mr-2" />
                <span>
                  <strong>Stream:</strong> {studentInfo.stream}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                <span>
                  <strong>Admitted:</strong> {studentInfo.year_of_admission}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Personal and academic details</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{studentInfo.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Admission Number</p>
                    <p className="font-medium">{studentInfo.admission_no}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{new Date(studentInfo.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{studentInfo.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Class</p>
                    <p className="font-medium">{studentInfo.class}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stream</p>
                    <p className="font-medium">{studentInfo.stream}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year of Admission</p>
                    <p className="font-medium">{studentInfo.year_of_admission}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="academic" className="pt-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Stream</p>
                      <p className="font-medium">{academicInfo.stream}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Class Teacher</p>
                      <p className="font-medium">{academicInfo.class_teacher}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Registered Subjects</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {academicInfo.subjects.map((subject, index) => (
                        <div key={index} className="flex items-center">
                          <Book className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-sm">{subject}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contacts" className="pt-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Parent Information</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Relationship</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Occupation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Father</TableCell>
                          <TableCell>{parentInfo.father.name}</TableCell>
                          <TableCell>{parentInfo.father.phone}</TableCell>
                          <TableCell>{parentInfo.father.email}</TableCell>
                          <TableCell>{parentInfo.father.occupation}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Mother</TableCell>
                          <TableCell>{parentInfo.mother.name}</TableCell>
                          <TableCell>{parentInfo.mother.phone}</TableCell>
                          <TableCell>{parentInfo.mother.email}</TableCell>
                          <TableCell>{parentInfo.mother.occupation}</TableCell>
                        </TableRow>
                        {parentInfo.guardian.name !== 'N/A' && (
                          <TableRow>
                            <TableCell className="font-medium">Guardian</TableCell>
                            <TableCell>{parentInfo.guardian.name}</TableCell>
                            <TableCell>{parentInfo.guardian.phone}</TableCell>
                            <TableCell>{parentInfo.guardian.email}</TableCell>
                            <TableCell>{parentInfo.guardian.occupation}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Emergency Contacts</h3>
                    <div className="space-y-3">
                      {emergencyContacts.map((contact, index) => (
                        <div key={index} className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <Phone className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">{contact.relationship}: {contact.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfile;
