import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  GraduationCap, 
  Users, 
  Activity, 
  AlertTriangle, 
  UserPlus,
  Book,
  Loader2,
  RefreshCw,
  User,
  UserCircle,
  School
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

// Dashboard card component
interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  className,
  isLoading = false,
}) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : value}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

// Activity item component
interface ActivityItemProps {
  title: string;
  timestamp: string;
  actionType?: 'login' | 'update' | 'add' | 'delete';
}

const ActivityItem: React.FC<ActivityItemProps> = ({ title, timestamp, actionType = 'update' }) => {
  const getActionColor = () => {
    switch (actionType) {
      case 'login':
        return 'bg-blue-500';
      case 'update':
        return 'bg-green-500';
      case 'add':
        return 'bg-primary';
      case 'delete':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className="flex items-center py-2">
      <div className={`w-2 h-2 rounded-full mr-3 ${getActionColor()}`} />
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </div>
    </div>
  );
};

// Quick action button component
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
  >
    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
      {icon}
    </div>
    <span className="text-sm font-medium text-center">{label}</span>
  </button>
);

interface ActivityLog {
  id: string;
  title: string;
  timestamp: string;
  action_type: 'login' | 'update' | 'add' | 'delete';
}

interface Alert {
  id: string;
  title: string;
  priority: string;
  type: 'login' | 'update' | 'add' | 'delete';
}

interface ClassStats {
  grade_level: number;
  count: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // States for dashboard data
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [teacherCount, setTeacherCount] = useState<number>(0);
  const [classCount, setClassCount] = useState<number>(0);
  const [alertCount, setAlertCount] = useState<number>(0);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [maleCount, setMaleCount] = useState<number>(0);
  const [femaleCount, setFemaleCount] = useState<number>(0);
  const [classStats, setClassStats] = useState<ClassStats[]>([]);

  // Function to fetch dashboard data
  const fetchDashboardData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      // Fetch student count
      const { count: studentCount, error: studentError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
        
      if (studentError) throw studentError;
      setStudentCount(studentCount || 0);
      
      // Fetch gender counts
      const { data: maleData, error: maleError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('gender', 'male');
      
      const { data: femaleData, error: femaleError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('gender', 'female');
        
      if (maleError) throw maleError;
      if (femaleError) throw femaleError;
      
      setMaleCount(maleData?.length || 0);
      setFemaleCount(femaleData?.length || 0);
      
      // Fetch class statistics
      const { data: classData, error: classStatsError } = await supabase
        .from('students')
        .select('class_id, classes!inner(grade_level)')
        .not('class_id', 'is', null);
        
      if (classStatsError) throw classStatsError;
      
      // Process class statistics
      const stats = classData?.reduce((acc: { [key: number]: number }, curr) => {
        const gradeLevel = (curr.classes as any).grade_level;
        acc[gradeLevel] = (acc[gradeLevel] || 0) + 1;
        return acc;
      }, {});
      
      setClassStats(Object.entries(stats || {}).map(([grade, count]) => ({
        grade_level: parseInt(grade),
        count: count as number
      })));
      
      // Fetch teacher count
      const { data: teacherData, error: teacherError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher');
        
      if (teacherError) throw teacherError;
      setTeacherCount(teacherData?.length || 0);
      
      // Fetch class count
      const { count: classCount, error: classError } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true });
        
      if (classError) throw classError;
      setClassCount(classCount || 0);
      
      // Fetch recent activity logs
      const { data: activityData, error: activityError } = await supabase
        .from('activity_logs')
        .select('id, action_type, description, created_at, user_id, entity_type')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (activityError) {
        console.error('Error fetching activity logs:', activityError);
        // Mock data for activity logs
        const mockActivities: ActivityLog[] = [
          {
            id: '1',
            title: 'Mr. Otieno added grades for Form 3 Chemistry',
            timestamp: '2 hours ago',
            action_type: 'add'
          },
          {
            id: '2',
            title: 'Admin updated school term dates',
            timestamp: 'Yesterday',
            action_type: 'update'
          },
          {
            id: '3',
            title: 'Ms. Wanjiku marked Form 2B attendance',
            timestamp: 'Yesterday',
            action_type: 'update'
          },
          {
            id: '4',
            title: 'Mr. Omondi logged in',
            timestamp: '3 days ago',
            action_type: 'login'
          }
        ];
        setActivities(mockActivities);
      } else {
        setActivities(
          activityData?.map((log) => ({
            id: log.id,
            title: log.description,
            timestamp: formatDistanceToNow(new Date(log.created_at), { addSuffix: true }),
            action_type: log.action_type
          })) || []
        );
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const navigateToSection = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage school activities</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={studentCount}
          description="Currently enrolled"
          icon={<GraduationCap className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatsCard
          title="Male Students"
          value={maleCount}
          description={`${((maleCount / studentCount) * 100).toFixed(1)}% of total`}
          icon={<User className="h-5 w-5 text-blue-500" />}
          isLoading={isLoading}
        />
        <StatsCard
          title="Female Students"
          value={femaleCount}
          description={`${((femaleCount / studentCount) * 100).toFixed(1)}% of total`}
          icon={<UserCircle className="h-5 w-5 text-pink-500" />}
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Teachers"
          value={teacherCount}
          description="Active faculty members"
          icon={<Users className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Students per Form</CardTitle>
            <CardDescription>Distribution across grade levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                classStats
                  .sort((a, b) => a.grade_level - b.grade_level)
                  .map((stat) => (
                    <div key={stat.grade_level} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <School className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm font-medium">Form {stat.grade_level}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-bold">{stat.count}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({((stat.count / studentCount) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                activities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    title={activity.title}
                    timestamp={activity.timestamp}
                    actionType={activity.action_type}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            icon={<UserPlus className="h-5 w-5" />}
            label="Add Student"
            onClick={() => navigateToSection('/students/new')}
          />
          <QuickAction
            icon={<Users className="h-5 w-5" />}
            label="Add Teacher"
            onClick={() => navigateToSection('/teachers/new')}
          />
          <QuickAction
            icon={<Book className="h-5 w-5" />}
            label="Manage Classes"
            onClick={() => navigateToSection('/classes')}
          />
          <QuickAction
            icon={<Activity className="h-5 w-5" />}
            label="View Reports"
            onClick={() => navigateToSection('/reports')}
          />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
