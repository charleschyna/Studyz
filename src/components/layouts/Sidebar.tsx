import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  BookOpen, 
  Calendar, 
  FileText, 
  Home, 
  Settings, 
  Users, 
  BookOpenCheck, 
  GraduationCap,
  User,
  Bell,
  MessageSquare,
  Check,
  Upload,
  UserPlus,
  School,
  AlertTriangle,
  Activity,
  ClipboardList,
  Wrench,
  LogIn,
  Wallet,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { userRole, user } = useAuth();

  // Define routes based on user role
  const getRoutes = () => {
    const routes = [];
    
    // If user is not logged in, show login options
    if (!user) {
      routes.push(
        { name: 'Home', path: '/', icon: <Home className="h-5 w-5" />, allowedRoles: ['guest'] },
        { name: 'Admin Login', path: '/auth?role=admin', icon: <LogIn className="h-5 w-5" />, allowedRoles: ['guest'] },
        { name: 'Teacher Login', path: '/auth?role=teacher', icon: <LogIn className="h-5 w-5" />, allowedRoles: ['guest'] },
        { name: 'Parent Login', path: '/auth?role=parent', icon: <LogIn className="h-5 w-5" />, allowedRoles: ['guest'] }
      );
      return routes;
    }
    
    if (userRole === 'admin') {
      routes.push(
        { name: 'Dashboard', path: '/dashboard', icon: <Home className="h-5 w-5" />, allowedRoles: ['admin'] },
        { name: 'Manage Students', path: '/manage-students', icon: <GraduationCap className="h-5 w-5" />, allowedRoles: ['admin'] },
        { name: 'Manage Teachers', path: '/manage-teachers', icon: <UserPlus className="h-5 w-5" />, allowedRoles: ['admin'] },
        { name: 'Manage Parents', path: '/manage-parents', icon: <Users className="h-5 w-5" />, allowedRoles: ['admin'] },
        { name: 'Classes & Subjects', path: '/manage-classes', icon: <ClipboardList className="h-5 w-5" />, allowedRoles: ['admin'] },
        { name: 'Fees & Payments', path: '/fees-management', icon: <Wallet className="h-5 w-5" />, allowedRoles: ['admin'] },
        { name: 'Academic Records', path: '/academic-records', icon: <FileText className="h-5 w-5" />, allowedRoles: ['admin'] },
        { name: 'Attendance Records', path: '/attendance-records', icon: <Calendar className="h-5 w-5" />, allowedRoles: ['admin'] },
        { name: 'Analytics & Reports', path: '/analytics-reports', icon: <BarChart className="h-5 w-5" />, allowedRoles: ['admin'] },
        { name: 'System Settings', path: '/system-settings', icon: <Wrench className="h-5 w-5" />, allowedRoles: ['admin'] },
        { name: 'Activity Logs', path: '/activity-logs', icon: <Activity className="h-5 w-5" />, allowedRoles: ['admin'] }
      );
    }
    
    if (userRole === 'teacher') {
      routes.push(
        { name: 'Class Management', path: '/class-management', icon: <BookOpen className="h-5 w-5" />, allowedRoles: ['teacher'] },
        { name: 'Grade Entry', path: '/grade-entry', icon: <FileText className="h-5 w-5" />, allowedRoles: ['teacher'] },
        { name: 'Attendance', path: '/attendance', icon: <Calendar className="h-5 w-5" />, allowedRoles: ['teacher'] },
        { name: 'Performance Analytics', path: '/performance-analytics', icon: <BarChart className="h-5 w-5" />, allowedRoles: ['teacher'] },
        { name: 'Student Profiles', path: '/student-profiles', icon: <User className="h-5 w-5" />, allowedRoles: ['teacher'] },
        { name: 'Messages', path: '/messages', icon: <MessageSquare className="h-5 w-5" />, allowedRoles: ['teacher'] },
        { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" />, allowedRoles: ['teacher'] }
      );
    }
    
    if (userRole === 'parent') {
      routes.push(
        { name: 'Performance', path: '/performance', icon: <BarChart className="h-5 w-5" />, allowedRoles: ['parent'] },
        { name: 'Attendance', path: '/attendance', icon: <Calendar className="h-5 w-5" />, allowedRoles: ['parent'] },
        { name: 'Report Cards', path: '/report-cards', icon: <FileText className="h-5 w-5" />, allowedRoles: ['parent'] },
        { name: 'School Fees', path: '/student-fees', icon: <Wallet className="h-5 w-5" />, allowedRoles: ['parent'] },
        { name: 'Notifications', path: '/notifications', icon: <Bell className="h-5 w-5" />, allowedRoles: ['parent'] },
        { name: 'Student Profile', path: '/student-profile', icon: <User className="h-5 w-5" />, allowedRoles: ['parent'] },
        { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" />, allowedRoles: ['parent'] }
      );
    }
    
    return routes.filter(route => route.allowedRoles.includes(userRole || 'guest'));
  };

  return (
    <div className={cn(
      "fixed md:relative md:flex flex-col w-64 bg-gradient-to-b from-sky-50 to-blue-100 text-slate-800 shadow-lg transition-transform duration-300 ease-in-out transform h-full z-50",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      <div className="flex items-center justify-between p-6 border-b border-blue-200">
        <div>
          <h2 className="text-2xl font-bold text-blue-800">STUDIZ</h2>
          <p className="text-sm text-blue-600">Student Performance Tracking</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-blue-600 hover:bg-blue-100 md:hidden"
          onClick={onToggle}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 px-3 py-2">
          {getRoutes().map((route) => (
            <li key={route.path}>
              <NavLink 
                to={route.path} 
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-200/80 text-blue-800' 
                      : 'text-slate-600 hover:bg-blue-100 hover:text-blue-800'
                  }`
                }
              >
                {route.icon}
                <span className="ml-3">{route.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {!user && (
        <div className="p-4 border-t border-blue-200">
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
            <h3 className="font-semibold mb-1">Login Options</h3>
            <p className="text-xs text-blue-600 mb-2">Select your role to access the appropriate portal</p>
            <div className="space-y-2">
              <NavLink 
                to="/auth?role=teacher" 
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors bg-blue-100 hover:bg-blue-200 text-blue-800"
              >
                <GraduationCap className="h-4 w-4" />
                <span className="ml-2">Teacher Portal</span>
              </NavLink>
              <NavLink 
                to="/auth?role=parent" 
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors bg-blue-100 hover:bg-blue-200 text-blue-800"
              >
                <Users className="h-4 w-4" />
                <span className="ml-2">Parent Portal</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
