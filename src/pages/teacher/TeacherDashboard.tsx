
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BookOpen, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle
} from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your teaching portal.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Classes Assigned"
          value="5"
          description="Subjects & forms"
          icon={<BookOpen className="h-5 w-5 text-primary" />}
        />
        <DashboardCard
          title="Recent Grades"
          value="42"
          description="Entries this week"
          icon={<FileText className="h-5 w-5 text-primary" />}
        />
        <DashboardCard
          title="Attendance"
          value="95%"
          description="Average this week"
          icon={<Calendar className="h-5 w-5 text-primary" />}
        />
        <DashboardCard
          title="Pending Alerts"
          value="3"
          description="Low performance"
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assigned Classes</CardTitle>
            <CardDescription>Current term subjects and forms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AssignedClassItem 
                className="Form 3B"
                subject="Chemistry"
                students={32}
              />
              <AssignedClassItem 
                className="Form 2A"
                subject="Chemistry"
                students={36}
              />
              <AssignedClassItem 
                className="Form 4C"
                subject="Physics"
                students={28}
              />
              <AssignedClassItem 
                className="Form 1D"
                subject="Science"
                students={40}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Alerts</CardTitle>
            <CardDescription>Students requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Issue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">John Doe</TableCell>
                  <TableCell>Form 3B</TableCell>
                  <TableCell className="text-red-500">Failed CAT 2</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Sarah Smith</TableCell>
                  <TableCell>Form 2A</TableCell>
                  <TableCell className="text-amber-500">Declining grades</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Michael Johnson</TableCell>
                  <TableCell>Form 3B</TableCell>
                  <TableCell className="text-red-500">Poor attendance</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Today, 9:30 AM</TableCell>
                <TableCell>Form 3B</TableCell>
                <TableCell>Marked attendance</TableCell>
                <TableCell className="text-green-500 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" /> Complete
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Yesterday</TableCell>
                <TableCell>Form 2A</TableCell>
                <TableCell>Graded CAT 2</TableCell>
                <TableCell className="text-green-500 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" /> Complete
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jun 5, 2023</TableCell>
                <TableCell>Form 4C</TableCell>
                <TableCell>Created lesson plan</TableCell>
                <TableCell className="text-amber-500 flex items-center">
                  <XCircle className="h-4 w-4 mr-1" /> Pending review
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, description, icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

interface AssignedClassItemProps {
  className: string;
  subject: string;
  students: number;
}

const AssignedClassItem: React.FC<AssignedClassItemProps> = ({ className, subject, students }) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-primary mr-3" />
        <div>
          <p className="text-sm font-medium">{className} - {subject}</p>
          <p className="text-xs text-muted-foreground">{students} students</p>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">Current Term</div>
    </div>
  );
};

export default TeacherDashboard;
