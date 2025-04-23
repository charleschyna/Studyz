
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Calendar, User } from 'lucide-react';

const ClassManagement: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Class Management</h1>
        <p className="text-muted-foreground">Manage your classes, students, and academic activities.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Class and Subject</CardTitle>
          <CardDescription>Choose the class and subject to view students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form3b">Form 3B</SelectItem>
                  <SelectItem value="form2a">Form 2A</SelectItem>
                  <SelectItem value="form4c">Form 4C</SelectItem>
                  <SelectItem value="form1d">Form 1D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && selectedSubject && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedClass === 'form3b' ? 'Form 3B' : 
               selectedClass === 'form2a' ? 'Form 2A' : 
               selectedClass === 'form4c' ? 'Form 4C' : 'Form 1D'} - {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}
            </CardTitle>
            <CardDescription>List of students and performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Term Average</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>ADM001</TableCell>
                  <TableCell className="font-medium">John Doe</TableCell>
                  <TableCell>92%</TableCell>
                  <TableCell>B+ (76%)</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">View profile</span>
                        <User className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Enter grades</span>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Mark attendance</span>
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ADM002</TableCell>
                  <TableCell className="font-medium">Jane Smith</TableCell>
                  <TableCell>88%</TableCell>
                  <TableCell>A- (81%)</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">View profile</span>
                        <User className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Enter grades</span>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Mark attendance</span>
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ADM003</TableCell>
                  <TableCell className="font-medium">Michael Johnson</TableCell>
                  <TableCell className="text-red-500">68%</TableCell>
                  <TableCell className="text-amber-500">C (58%)</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">View profile</span>
                        <User className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Enter grades</span>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Mark attendance</span>
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClassManagement;
