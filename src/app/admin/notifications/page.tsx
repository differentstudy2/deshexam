'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Clock, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminNotificationsPage() {
  const { userProfile, loading } = useAuth();

  const notifications = userProfile?.notifications
    ? [...userProfile.notifications].sort((a, b) => b.createdAt - a.createdAt)
    : [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            View all your system alerts, messages, and notifications here.
          </p>
        </div>
      </div>

      <div className="space-y-4 mt-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Info className="h-12 w-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-600">No Notifications</p>
              <p className="text-sm">You are all caught up! There are no new notifications.</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notif, index) => (
            <Card key={index} className="transition-all hover:shadow-md border-l-4 border-l-blue-500">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-slate-100 p-2 rounded-full mt-1">
                  <Bell className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{notif.title || 'System Notification'}</h3>
                  <p className="text-slate-600 mt-1 whitespace-pre-wrap">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                      {new Date(notif.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
