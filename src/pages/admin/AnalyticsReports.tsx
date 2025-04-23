import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subMonths } from 'date-fns';
import { Download } from 'lucide-react';

interface PerformanceData {
  subject: string;
  averageScore: number;
  passRate: number;
  totalStudents: number;
}

interface AttendanceData {
  month: string;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
}

interface FeesData {
  month: string;
  amountPaid: number;
  outstanding: number;
  collectionRate: number;
}

interface EnrollmentData {
  class: string;
  students: number;
  capacity: number;
  fillRate: number;
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1'];

export default function AnalyticsReports() {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6');
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [feesData, setFeesData] = useState<FeesData[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[]>([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedPeriod) {
      fetchAnalyticsData();
    }
  }, [selectedClass, selectedPeriod]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (error) throw error;

      setClasses(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch classes',
        variant: 'destructive',
      });
    }
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch performance data
      const { data: performanceResults, error: performanceError } = await supabase
        .rpc('get_class_performance', {
          p_class_id: selectedClass === 'all' ? null : selectedClass,
          p_months: parseInt(selectedPeriod)
        });

      if (performanceError) throw performanceError;

      // Fetch attendance data
      const { data: attendanceResults, error: attendanceError } = await supabase
        .rpc('get_attendance_stats', {
          p_class_id: selectedClass === 'all' ? null : selectedClass,
          p_months: parseInt(selectedPeriod)
        });

      if (attendanceError) throw attendanceError;

      // Fetch fees data
      const { data: feesResults, error: feesError } = await supabase
        .rpc('get_fees_collection_stats', {
          p_class_id: selectedClass === 'all' ? null : selectedClass,
          p_months: parseInt(selectedPeriod)
        });

      if (feesError) throw feesError;

      // Fetch enrollment data
      const { data: enrollmentResults, error: enrollmentError } = await supabase
        .rpc('get_enrollment_stats', {
          p_class_id: selectedClass === 'all' ? null : selectedClass
        });

      if (enrollmentError) throw enrollmentError;

      setPerformanceData(performanceResults || []);
      setAttendanceData(attendanceResults || []);
      setFeesData(feesResults || []);
      setEnrollmentData(enrollmentResults || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        class: selectedClass === 'all' ? 'All Classes' : classes.find(c => c.id === selectedClass)?.name,
        period: `Last ${selectedPeriod} months`,
        performance: performanceData,
        attendance: attendanceData,
        fees: feesData,
        enrollment: enrollmentData
      };

      // Create a blob and download the report
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_report_${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Report downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Analytics & Reports</CardTitle>
            <Button onClick={generateReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex gap-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="performance">
            <TabsList>
              <TabsTrigger value="performance">Academic Performance</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="fees">Fees Collection</TabsTrigger>
              <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceData.length > 0
                        ? `${(performanceData.reduce((acc, curr) => acc + curr.averageScore, 0) / performanceData.length).toFixed(1)}%`
                        : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Overall Pass Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceData.length > 0
                        ? `${(performanceData.reduce((acc, curr) => acc + curr.passRate, 0) / performanceData.length).toFixed(1)}%`
                        : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceData.length > 0
                        ? performanceData[0].totalStudents
                        : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="averageScore" name="Average Score" fill="#6366f1" />
                        <Bar dataKey="passRate" name="Pass Rate" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Average Attendance Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {attendanceData.length > 0
                        ? `${(attendanceData.reduce((acc, curr) => acc + curr.attendanceRate, 0) / attendanceData.length).toFixed(1)}%`
                        : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {attendanceData.length > 0
                        ? attendanceData.reduce((acc, curr) => acc + curr.present, 0)
                        : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {attendanceData.length > 0
                        ? attendanceData.reduce((acc, curr) => acc + curr.absent, 0)
                        : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Attendance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={attendanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="present" name="Present" stroke="#10b981" />
                        <Line type="monotone" dataKey="absent" name="Absent" stroke="#ef4444" />
                        <Line type="monotone" dataKey="late" name="Late" stroke="#f59e0b" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {feesData.length > 0
                        ? `${(feesData.reduce((acc, curr) => acc + curr.collectionRate, 0) / feesData.length).toFixed(1)}%`
                        : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {feesData.length > 0
                        ? `KES ${feesData.reduce((acc, curr) => acc + curr.amountPaid, 0).toLocaleString()}`
                        : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {feesData.length > 0
                        ? `KES ${feesData.reduce((acc, curr) => acc + curr.outstanding, 0).toLocaleString()}`
                        : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Fees Collection Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={feesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="amountPaid" name="Amount Paid" stroke="#10b981" />
                        <Line type="monotone" dataKey="outstanding" name="Outstanding" stroke="#ef4444" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="enrollment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {enrollmentData.length > 0
                        ? enrollmentData.reduce((acc, curr) => acc + curr.students, 0)
                        : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {enrollmentData.length > 0
                        ? enrollmentData.reduce((acc, curr) => acc + curr.capacity, 0)
                        : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Average Fill Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {enrollmentData.length > 0
                        ? `${(enrollmentData.reduce((acc, curr) => acc + curr.fillRate, 0) / enrollmentData.length).toFixed(1)}%`
                        : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Class Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={enrollmentData}
                            dataKey="students"
                            nameKey="class"
                            cx="50%"
                            cy="50%"
                            outerRadius={150}
                            label
                          >
                            {enrollmentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Capacity Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={enrollmentData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="class" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="students" name="Current Students" fill="#6366f1" />
                          <Bar dataKey="capacity" name="Total Capacity" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
