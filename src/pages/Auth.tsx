import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, AlertCircle, ArrowLeft, User, Users } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Extract role from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam && ['admin', 'teacher', 'parent'].includes(roleParam)) {
      setSelectedRole(roleParam);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { user, role } = await signIn(email, password);
      
      // Redirect based on user role
      switch (role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'teacher':
          navigate('/class-management');
          break;
        case 'parent':
          navigate('/performance');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid email or password. Please contact your administrator if you need assistance.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get role-specific information
  const getRoleInfo = () => {
    switch (selectedRole) {
      case 'teacher':
        return {
          title: 'Teacher Portal',
          description: 'Access your classes, record grades, and track student attendance',
          icon: <GraduationCap className="h-12 w-12 text-blue-600" />
        };
      case 'parent':
        return {
          title: 'Parent Portal',
          description: 'Monitor your child\'s performance, attendance, and school fees',
          icon: <Users className="h-12 w-12 text-blue-600" />
        };
      case 'admin':
        return {
          title: 'Admin Portal',
          description: 'Manage the entire school system and user accounts',
          icon: <User className="h-12 w-12 text-blue-600" />
        };
      default:
        return {
          title: 'Sign in to STUDIZ',
          description: 'Student Performance Tracking System',
          icon: <GraduationCap className="h-12 w-12 text-blue-600" />
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex flex-col items-center justify-center p-4">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Link to="/">
          <Button variant="ghost" size="sm" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            {roleInfo.icon}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{roleInfo.title}</h1>
          <p className="text-slate-600 mt-2">
            {roleInfo.description}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
