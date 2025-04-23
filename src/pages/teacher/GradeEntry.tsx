
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Save, Upload, Lock } from 'lucide-react';

const GradeEntry: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [grades, setGrades] = useState<Record<string, number>>({});

  const handleGradeChange = (studentId: string, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    
    setGrades({
      ...grades,
      [studentId]: Math.min(100, Math.max(0, numValue)) // Ensure value is between 0 and 100
    });
  };

  const getLetterGrade = (score: number) => {
    if (score >= 80) return 'A';
    if (score >= 75) return 'A-';
    if (score >= 70) return 'B+';
    if (score >= 65) return 'B';
    if (score >= 60) return 'B-';
    if (score >= 55) return 'C+';
    if (score >= 50) return 'C';
    if (score >= 45) return 'C-';
    if (score >= 40) return 'D+';
    if (score >= 35) return 'D';
    if (score >= 30) return 'D-';
    return 'E';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grade Entry</h1>
        <p className="text-muted-foreground">Record and manage student grades for exams and assessments.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Class, Subject and Exam</CardTitle>
          <CardDescription>Choose the class, subject, and exam type to enter grades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Exam Type</label>
              <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cat1">CAT 1</SelectItem>
                  <SelectItem value="cat2">CAT 2</SelectItem>
                  <SelectItem value="midterm">Mid-Term</SelectItem>
                  <SelectItem value="endterm">End-Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && selectedSubject && selectedExamType && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedClass === 'form3b' ? 'Form 3B' : 
               selectedClass === 'form2a' ? 'Form 2A' : 
               selectedClass === 'form4c' ? 'Form 4C' : 'Form 1D'} - {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)} - {selectedExamType.toUpperCase()}
            </CardTitle>
            <CardDescription>Enter student scores (0-100)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button variant="outline" className="mr-2">
                <Upload className="h-4 w-4 mr-2" /> Import CSV
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Adm No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="w-[120px]">Score (0-100)</TableHead>
                  <TableHead className="w-[100px]">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {['s1', 's2', 's3', 's4', 's5'].map((studentId, index) => (
                  <TableRow key={studentId}>
                    <TableCell>ADM00{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {['John Doe', 'Jane Smith', 'Michael Johnson', 'Sarah Williams', 'Robert Brown'][index]}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={grades[studentId] || ''}
                        onChange={(e) => handleGradeChange(studentId, e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      {grades[studentId] ? getLetterGrade(grades[studentId]) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              Average: {Object.values(grades).length > 0 
                ? (Object.values(grades).reduce((sum, val) => sum + val, 0) / Object.values(grades).length).toFixed(2) 
                : '-'}
            </p>
            <div className="space-x-2">
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" /> Save Draft
              </Button>
              <Button>
                <Lock className="h-4 w-4 mr-2" /> Submit & Lock
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default GradeEntry;
