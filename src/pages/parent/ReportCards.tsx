
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Eye } from 'lucide-react';

const ReportCards: React.FC = () => {
  const [selectedChild, setSelectedChild] = useState<string>('John Doe');
  const [selectedYear, setSelectedYear] = useState<string>('2025');

  // Mock data - would be replaced with actual data from Supabase
  const reportCards = [
    {
      id: '1',
      term: 'Term 1',
      year: '2025',
      meanGrade: 'B+',
      position: '5/45',
      dateReleased: '2025-04-10',
      teacherRemarks: 'Good performance. Keep improving in Sciences.'
    },
    {
      id: '2',
      term: 'Term 2',
      year: '2025',
      meanGrade: 'B+',
      position: '3/45',
      dateReleased: '2025-08-15',
      teacherRemarks: 'Excellent improvement. Continue with the good work!'
    },
    {
      id: '3',
      term: 'Term 3',
      year: '2024',
      meanGrade: 'B',
      position: '7/45',
      dateReleased: '2024-12-05',
      teacherRemarks: 'Good effort. Work harder on Mathematics and Physics.'
    }
  ];

  // Sample report card details for a selected report
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  
  const reportDetails = {
    studentName: 'John Doe',
    admissionNo: 'ADM123456',
    class: 'Form 3',
    stream: 'North',
    term: 'Term 2, 2025',
    subjects: [
      { name: 'Mathematics', score: 75, grade: 'A-', remarks: 'Very good' },
      { name: 'English', score: 72, grade: 'B+', remarks: 'Good effort' },
      { name: 'Kiswahili', score: 68, grade: 'B', remarks: 'Satisfactory' },
      { name: 'Physics', score: 70, grade: 'B+', remarks: 'Good understanding' },
      { name: 'Chemistry', score: 58, grade: 'C+', remarks: 'Needs improvement' },
      { name: 'Biology', score: 77, grade: 'A-', remarks: 'Excellent' },
      { name: 'History', score: 65, grade: 'B', remarks: 'Good progress' },
      { name: 'Geography', score: 68, grade: 'B', remarks: 'Satisfactory' }
    ],
    average: 69.125,
    meanGrade: 'B+',
    position: '3/45',
    classTeacherRemarks: 'John has shown tremendous improvement this term. He needs to work on his Chemistry.',
    principalRemarks: 'Good performance. Keep up the hard work and aim higher.',
    closingDate: '2025-08-15',
    nextTermBegins: '2025-09-05'
  };

  const viewReportCard = (id: string) => {
    setSelectedReport(id);
  };

  const downloadReportCard = (id: string) => {
    // In a real app, this would trigger a download of a PDF or other report format
    alert(`Downloading report card ID: ${id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report Cards</h1>
        <p className="text-muted-foreground">View and download student report cards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="text-sm font-medium">Academic Year</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Report Cards</CardTitle>
          <CardDescription>
            Report cards for {selectedChild} in the year {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Term</TableHead>
                <TableHead>Mean Grade</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Date Released</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportCards
                .filter(report => report.year === selectedYear)
                .map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.term}, {report.year}</TableCell>
                    <TableCell>{report.meanGrade}</TableCell>
                    <TableCell>{report.position}</TableCell>
                    <TableCell>{new Date(report.dateReleased).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewReportCard(report.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReportCard(report.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle>Term Report Card</CardTitle>
            <CardDescription>
              {reportDetails.term} - {reportDetails.studentName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="font-medium">{reportDetails.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admission No.</p>
                  <p className="font-medium">{reportDetails.admissionNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">{reportDetails.class}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stream</p>
                  <p className="font-medium">{reportDetails.stream}</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportDetails.subjects.map((subject) => (
                    <TableRow key={subject.name}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.score}</TableCell>
                      <TableCell>{subject.grade}</TableCell>
                      <TableCell>{subject.remarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Mean Score</p>
                    <p className="font-medium">{reportDetails.average.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mean Grade</p>
                    <p className="font-medium">{reportDetails.meanGrade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Position</p>
                    <p className="font-medium">{reportDetails.position}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Class Teacher's Remarks</p>
                  <p className="text-sm">{reportDetails.classTeacherRemarks}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Principal's Remarks</p>
                  <p className="text-sm">{reportDetails.principalRemarks}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Term Closing Date</p>
                  <p className="font-medium">{new Date(reportDetails.closingDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Term Begins</p>
                  <p className="font-medium">{new Date(reportDetails.nextTermBegins).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Close
            </Button>
            <Button onClick={() => downloadReportCard(selectedReport)}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ReportCards;
