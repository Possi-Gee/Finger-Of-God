
'use client';

import { useState, useEffect } from 'react';
import { requestNotificationPermission } from '@/lib/firebase-messaging';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, AlertTriangle } from 'lucide-react';

export function NotificationPrompt() {
  const { toast } = useToast();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if ('Notification' in window) {
        setPermissionStatus(Notification.permission);
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
        toast({
            title: "Unsupported Browser",
            description: "This browser does not support desktop notifications.",
            variant: "destructive"
        });
        return;
    }

    // Check permission status again in case it changed in another tab
    const currentPermission = Notification.permission;
    setPermissionStatus(currentPermission);

    if (currentPermission === 'granted') {
        toast({
            title: "Already Enabled",
            description: "You have already enabled notifications.",
        });
        return;
    }

    if (currentPermission === 'denied') {
        toast({
            title: "Permission Required",
            description: "Notifications are blocked. Please enable them in your browser settings to receive updates.",
            variant: "destructive",
            duration: 5000,
        });
        return;
    }
    
    // This will now only run if permission is 'default'
    const receivedToken = await requestNotificationPermission();
    setPermissionStatus(Notification.permission); // Update status after request
    
    if (receivedToken) {
        setToken(receivedToken);
        toast({
          title: 'Notifications Enabled!',
          description: 'You will now receive updates about your order.',
        });
    } else {
        toast({
            title: 'Permission Denied',
            description: "You have denied permission for notifications. You can enable them later in your browser settings.",
            variant: 'destructive',
        });
    }
  };

  if (!isClient) {
    return null; // Don't render on the server
  }

  if (permissionStatus === 'granted') {
    return (
        <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <CheckCircle className="h-4 w-4 !text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-300">Notifications are Active</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
                You're all set to receive updates about your order.
            </AlertDescription>
        </Alert>
    );
  }

  if (permissionStatus === 'denied') {
     return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Enable Notifications for Order Updates</AlertTitle>
            <AlertDescription>
                You've previously blocked notifications. To get order updates, please enable notifications for this site in your browser settings.
            </AlertDescription>
        </Alert>
     )
  }

  return (
    <Alert>
      <Bell className="h-4 w-4" />
      <AlertTitle>Get Order Updates</AlertTitle>
      <AlertDescription className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <span>Want to know when your order has shipped or is out for delivery?</span>
        <Button onClick={handleEnableNotifications} className="w-full md:w-auto">Enable Notifications</Button>
      </AlertDescription>
    </Alert>
  );
}
