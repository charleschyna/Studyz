
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartTooltip } from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const Performance: React.FC = () => {
  const [selectedChild, setSelectedChild] = useState<string>('John Doe');
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 2, 2025');
  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');

  // Mock data - would be replaced with actual data from Supabase
  const performanceData = [
    { subject: 'Mathematics', cat1: 70, cat2: 75, midterm: 78, final: 80 },
    { subject: 'English', cat1: 82, cat2: 78, midterm: 75, final: 80 },
    { subject: 'Kiswahili', cat1: 65, cat2: 70, midterm: 72, final: 75 },
    { subject: 'Physics', cat1: 60, cat2: 65, midterm: 70, final: 72 },
    { subject: 'Chemistry', cat1: 55, cat2: 58, midterm: 60, final: 58 },
    { subject: 'Biology', cat1: 78, cat2: 80, midterm: 76, final: 82 },
  ];

  const chartData = [
    { name: 'CAT 1', Mathematics: 70, English: 82, Kiswahili: 65, Physics: 60, Chemistry: 55, Biology: 78 },
    { name: 'CAT 2', Mathematics: 75, English: 78, Kiswahili: 70, Physics: 65, Chemistry: 58, Biology: 80 },
    { name: 'Midterm', Mathematics: 78, English: 75, Kiswahili: 72, Physics: 70, Chemistry: 60, Biology: 76 },
    { name: 'Final', Mathematics: 80, English: 80, Kiswahili: 75, Physics: 72, Chemistry: 58, Biology: 82 },
  ];

  const examTypes = ['CAT 1', 'CAT 2', 'Midterm', 'Final'];

  const config = {
    Mathematics: { theme: { light: '#4285F4', dark: '#4285F4' } },
    English: { theme: { light: '#34A853', dark: '#34A853' } },
    Kiswahili: { theme: { light: '#FBBC05', dark: '#FBBC05' } },
    Physics: { theme: { light: '#EA4335', dark: '#EA4335' } },
    Chemistry: { theme: { light: '#8F00FF', dark: '#8F00FF' } },
    Biology: { theme: { light: '#00A8E8', dark: '#00A8E8' } },
  };

  // Function to convert score to grade
  const getGrade = (score: number) => {
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
        <h1 className="text-3xl font-bold tracking-tight">Academic Performance</h1>
        <p className="text-muted-foreground">View and analyze student performance data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Select Student</label>
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="John Doe">John Doe</SelectItem>
              <SelectItem value="Jane Doe">Jane Doe</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Select Term</label>
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Term 1, 2025">Term 1, 2025</SelectItem>
              <SelectItem value="Term 2, 2025">Term 2, 2025</SelectItem>
              <SelectItem value="Term 3, 2024">Term 3, 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Select Subject</label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Subjects">All Subjects</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Kiswahili">Kiswahili</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
              <SelectItem value="Chemistry">Chemistry</SelectItem>
              <SelectItem value="Biology">Biology</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Chart</CardTitle>
          <CardDescription>
            Showing exam scores for {selectedChild} during {selectedTerm}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={config}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend />
                  {Object.keys(config).map((subject) => (
                    <Bar 
                      key={subject} 
                      dataKey={subject} 
                      name={subject} 
                      fill={`var(--color-${subject})`} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance</CardTitle>
          <CardDescription>
            Scores and grades breakdown by subject and exam type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                {examTypes.map(type => (
                  <TableHead key={type}>{type}</TableHead>
                ))}
                <TableHead>Average</TableHead>
                <TableHead>Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceData.map((subject) => {
                const average = Math.round(
                  (subject.cat1 + subject.cat2 + subject.midterm + subject.final) / 4
                );
                return (
                  <TableRow key={subject.subject}>
                    <TableCell className="font-medium">{subject.subject}</TableCell>
                    <TableCell>{subject.cat1}</TableCell>
                    <TableCell>{subject.cat2}</TableCell>
                    <TableCell>{subject.midterm}</TableCell>
                    <TableCell>{subject.final}</TableCell>
                    <TableCell>{average}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${average < 60 ? 'text-red-500' : 'text-green-600'}`}>
                        {getGrade(average)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Performance;
