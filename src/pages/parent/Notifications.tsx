
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, Calendar, FileText, Info } from 'lucide-react';

const Notifications: React.FC = () => {
  // Mock data - would be replaced with actual data from Supabase
  const notifications = [
    {
      id: '1',
      type: 'alert',
      title: 'Low Performance Alert',
      message: "John's performance in Chemistry has dropped below average. Please schedule a meeting with the teacher.",
      date: '2025-05-15T14:30:00',
      isRead: false,
      isImportant: true
    },
    {
      id: '2',
      type: 'event',
      title: 'End Term Exams Schedule',
      message: 'End Term Exams will begin on June 10th, 2025. Please ensure your child is prepared.',
      date: '2025-05-10T09:15:00',
      isRead: true,
      isImportant: true
    },
    {
      id: '3',
      type: 'general',
      title: 'PTA Meeting',
      message: 'There will be a PTA meeting on May 25th, 2025 at 2:00 PM. Your attendance is highly encouraged.',
      date: '2025-05-08T11:45:00',
      isRead: false,
      isImportant: false
    },
    {
      id: '4',
      type: 'report',
      title: 'Term 1 Report Card Available',
      message: 'The Term 1 report card for John Doe is now available. You can view and download it from the Report Cards section.',
      date: '2025-05-05T16:20:00',
      isRead: true,
      isImportant: false
    },
    {
      id: '5',
      type: 'attendance',
      title: 'Absence Notification',
      message: 'John was absent from school on May 2nd, 2025. Please provide an explanation or medical certificate if applicable.',
      date: '2025-05-03T08:10:00',
      isRead: false,
      isImportant: true
    }
  ];

  const [activeTab, setActiveTab] = useState('all');
  const [notificationList, setNotificationList] = useState(notifications);

  const filterNotifications = (tab: string) => {
    setActiveTab(tab);
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notificationList.filter(notification => !notification.isRead);
      case 'important':
        return notificationList.filter(notification => notification.isImportant);
      default:
        return notificationList;
    }
  };

  const markAsRead = (id: string) => {
    setNotificationList(
      notificationList.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotificationList(
      notificationList.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Helper function to get the icon for a notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'report':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'attendance':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today, ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday, ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' }) + ', ' +
             date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' +
             date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with important messages and alerts</p>
        </div>
        <Button variant="outline" onClick={markAllAsRead}>
          Mark All as Read
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={filterNotifications}>
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
              {notificationList.filter(n => !n.isRead).length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="important">Important</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {getFilteredNotifications().length === 0 ? (
              <li className="p-6 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No notifications to display</p>
              </li>
            ) : (
              getFilteredNotifications().map((notification) => (
                <li 
                  key={notification.id} 
                  className={`p-4 hover:bg-muted/50 transition-colors ${!notification.isRead ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                          {notification.title}
                          {notification.isImportant && (
                            <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                              Important
                            </span>
                          )}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.date)}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{notification.message}</p>
                      <div className="mt-2 flex justify-end">
                        {!notification.isRead && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
