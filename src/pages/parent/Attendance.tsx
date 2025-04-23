
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';

const Attendance: React.FC = () => {
  const [selectedChild, setSelectedChild] = useState<string>('John Doe');
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 2, 2025');
  const [selectedMonth, setSelectedMonth] = useState<string>('All Months');

  // Mock data - would be replaced with actual data from Supabase
  const attendanceSummary = {
    totalDays: 62,
    present: 57,
    absent: 5,
    attendance: Math.round((57 / 62) * 100)
  };

  const monthlyData = [
    { name: 'January', attendance: 95 },
    { name: 'February', attendance: 98 },
    { name: 'March', attendance: 92 },
    { name: 'April', attendance: 90 },
    { name: 'May', attendance: 94 }
  ];

  const config = {
    attendance: { theme: { light: '#4285F4', dark: '#4285F4' } }
  };

  const dailyAttendance = [
    { date: '2025-05-02', status: 'Present', notes: '' },
    { date: '2025-05-03', status: 'Present', notes: '' },
    { date: '2025-05-04', status: 'Absent', notes: 'Sick leave (Medical certificate provided)' },
    { date: '2025-05-05', status: 'Present', notes: '' },
    { date: '2025-05-06', status: 'Present', notes: '' },
    { date: '2025-05-09', status: 'Present', notes: '' },
    { date: '2025-05-10', status: 'Present', notes: '' },
    { date: '2025-05-11', status: 'Present', notes: '' },
    { date: '2025-05-12', status: 'Absent', notes: 'Family emergency' },
    { date: '2025-05-13', status: 'Present', notes: '' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Records</h1>
        <p className="text-muted-foreground">Track student attendance throughout the term</p>
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
          <label className="text-sm font-medium">Select Month</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Months">All Months</SelectItem>
              <SelectItem value="January">January</SelectItem>
              <SelectItem value="February">February</SelectItem>
              <SelectItem value="March">March</SelectItem>
              <SelectItem value="April">April</SelectItem>
              <SelectItem value="May">May</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total School Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceSummary.totalDays}</div>
            <p className="text-xs text-muted-foreground">Days in {selectedTerm}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Days Present</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceSummary.present}</div>
            <p className="text-xs text-muted-foreground">Days attended</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Days Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceSummary.absent}</div>
            <p className="text-xs text-muted-foreground">Days missed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Rate</CardTitle>
          <CardDescription>
            {attendanceSummary.attendance}% attendance for {selectedChild} during {selectedTerm}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={config}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[80, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    name="Attendance %" 
                    stroke="#4285F4" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance Records</CardTitle>
          <CardDescription>
            Detailed attendance for {selectedMonth === 'All Months' ? selectedTerm : selectedMonth}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyAttendance.map((day) => (
                <TableRow key={day.date}>
                  <TableCell className="font-medium">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      day.status === 'Present' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {day.status}
                    </span>
                  </TableCell>
                  <TableCell>{day.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
