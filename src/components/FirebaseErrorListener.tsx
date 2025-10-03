
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { useToast } from '@/hooks/use-toast';

// This is an invisible component that listens for permission errors
// and displays them as toasts during development. This is a temporary
// measure to make debugging security rules easier. In a production
// environment, you would likely want to log these errors to a monitoring
// service instead of showing them to the user.
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error("Caught a Firestore Permission Error:", error);

      // In a real app, you might want to log this to a service like Sentry
      // For this prototype, we'll just show a toast.
       toast({
        variant: "destructive",
        title: "Firestore Permission Error",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{error.message}</code>
          </pre>
        ),
        duration: 20000, // Show for longer for debugging
      });

      // We re-throw the error here so that Next.js's development overlay will
      // also pick it up. This gives us the best of both worlds: a toast for
      // quick feedback and the overlay for a more detailed stack trace.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null; // This component doesn't render anything
}
