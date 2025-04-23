import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

type Student = {
  id: string;
  full_name: string;
  admission_no: string;
  class_id: string;
  stream_id: string;
};

type AttendanceRecord = {
  id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  marked_by: string;
  created_at: string;
  updated_at: string;
};

type AttendanceStats = {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
  monthlyAttendance: {
    month: string;
    present: number;
    absent: number;
    late: number;
  }[];
};

export default function AttendanceRecords() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchAttendanceRecords();
    }
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentStats();
    }
  }, [selectedStudent]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (classesError) throw classesError;

      setClasses(classesData || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch initial data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', selectedClass)
        .order('full_name');

      if (error) throw error;

      setStudents(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    if (!selectedClass || !selectedDate) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', format(selectedDate, 'yyyy-MM-dd'));

      if (error) throw error;

      const recordsMap: Record<string, AttendanceRecord> = {};
      (data || []).forEach(record => {
        recordsMap[record.student_id] = record;
      });

      setAttendanceRecords(recordsMap);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch attendance records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentStats = async () => {
    if (!selectedStudent) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', selectedStudent)
        .order('date');

      if (error) throw error;

      if (!data) return;

      // Calculate attendance statistics
      const totalDays = data.length;
      const presentDays = data.filter(r => r.status === 'present').length;
      const absentDays = data.filter(r => r.status === 'absent').length;
      const lateDays = data.filter(r => r.status === 'late').length;
      const attendanceRate = (presentDays / totalDays) * 100;

      // Calculate monthly attendance
      const monthlyMap: Record<string, { present: number; absent: number; late: number }> = {};
      data.forEach(record => {
        const month = format(new Date(record.date), 'MMM yyyy');
        if (!monthlyMap[month]) {
          monthlyMap[month] = { present: 0, absent: 0, late: 0 };
        }
        monthlyMap[month][record.status]++;
      });

      const monthlyAttendance = Object.entries(monthlyMap).map(([month, stats]) => ({
        month,
        ...stats,
      }));

      setStats({
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendanceRate,
        monthlyAttendance,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch student statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    try {
      setLoading(true);
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const record = attendanceRecords[studentId];
      const date = format(selectedDate, 'yyyy-MM-dd');

      if (record) {
        // Update existing record
        const { error } = await supabase
          .from('attendance')
          .update({
            status,
            marked_by: userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', record.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('attendance')
          .insert({
            student_id: studentId,
            date,
            status,
            marked_by: userId,
          });

        if (error) throw error;
      }

      // Refresh attendance records
      await fetchAttendanceRecords();

      toast({
        title: 'Success',
        description: 'Attendance marked successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark attendance',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.admission_no.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mark">
            <TabsList>
              <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
              <TabsTrigger value="view">View Records</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="mark" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">1. Select Class & Date</h3>
                    <div className="space-y-4">
                      <Select value={selectedClass} onValueChange={(value) => {
                        setSelectedClass(value);
                        fetchStudents();
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        className="rounded-md border"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">2. Mark Attendance</h3>
                    <div className="space-y-4">
                      <Input
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <div className="h-[400px] overflow-y-auto border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Admission No</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredStudents.map((student) => {
                              const record = attendanceRecords[student.id];
                              return (
                                <TableRow key={student.id}>
                                  <TableCell>{student.full_name}</TableCell>
                                  <TableCell>{student.admission_no}</TableCell>
                                  <TableCell>
                                    {record?.status || 'Not marked'}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button
                                        variant={record?.status === 'present' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => markAttendance(student.id, 'present')}
                                      >
                                        Present
                                      </Button>
                                      <Button
                                        variant={record?.status === 'absent' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => markAttendance(student.id, 'absent')}
                                      >
                                        Absent
                                      </Button>
                                      <Button
                                        variant={record?.status === 'late' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => markAttendance(student.id, 'late')}
                                      >
                                        Late
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="view" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Select value={selectedClass} onValueChange={(value) => {
                        setSelectedClass(value);
                        fetchStudents();
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />

                      <div className="h-[400px] overflow-y-auto border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Admission No</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredStudents.map((student) => (
                              <TableRow 
                                key={student.id}
                                className={selectedStudent === student.id ? 'bg-muted' : ''}
                              >
                                <TableCell>{student.full_name}</TableCell>
                                <TableCell>{student.admission_no}</TableCell>
                                <TableCell>
                                  <Button
                                    variant={selectedStudent === student.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedStudent(student.id)}
                                  >
                                    {selectedStudent === student.id ? 'Selected' : 'View Records'}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent && stats ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Total Days</p>
                            <p className="text-2xl font-bold">{stats.totalDays}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Attendance Rate</p>
                            <p className="text-2xl font-bold">{stats.attendanceRate.toFixed(1)}%</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Present Days</p>
                            <p className="text-2xl font-bold text-green-600">{stats.presentDays}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Absent Days</p>
                            <p className="text-2xl font-bold text-red-600">{stats.absentDays}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-4">Monthly Attendance</h4>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={stats.monthlyAttendance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="present"
                                  stroke="#10b981"
                                  name="Present"
                                />
                                <Line
                                  type="monotone"
                                  dataKey="absent"
                                  stroke="#ef4444"
                                  name="Absent"
                                />
                                <Line
                                  type="monotone"
                                  dataKey="late"
                                  stroke="#f59e0b"
                                  name="Late"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Select a student to view attendance statistics
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Class Attendance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Select value={selectedClass} onValueChange={(value) => {
                      setSelectedClass(value);
                      fetchStudents();
                    }}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">Loading analysis data...</div>
                  ) : (
                    <div className="space-y-8">
                      {/* Overview Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium">Average Attendance Rate</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {stats?.attendanceRate.toFixed(1)}%
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {students.length}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {Object.values(attendanceRecords).filter(r => r.status === 'present').length}/{students.length}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Attendance Trend Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Attendance Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            {stats?.monthlyAttendance && (
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.monthlyAttendance}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="month" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Line
                                    type="monotone"
                                    dataKey="present"
                                    stroke="#10b981"
                                    name="Present"
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="absent"
                                    stroke="#ef4444"
                                    name="Absent"
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="late"
                                    stroke="#f59e0b"
                                    name="Late"
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
