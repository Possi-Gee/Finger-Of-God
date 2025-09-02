
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, SwitchCamera, VideoOff, Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (imageDataUri: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'loading'>('loading');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async (deviceId?: string) => {
    stopStream();
    setPermissionState('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      });
      streamRef.current = stream;

      const videoDevices = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);
      
      if (!deviceId && videoDevices.length > 0) {
        const backCam = videoDevices.find(d => d.label.toLowerCase().includes('back'));
        setCurrentDeviceId(backCam?.deviceId || videoDevices[0].deviceId);
      } else {
         setCurrentDeviceId(deviceId);
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPermissionState('granted');
    } catch (error) {
      console.error('Error starting video stream:', error);
      setPermissionState('denied');
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
    }
  }, [stopStream, toast]);
  
  useEffect(() => {
    // This effect runs when the component mounts inside the dialog
    startStream(currentDeviceId);

    // This is the cleanup function that runs when the dialog closes
    return () => {
      stopStream();
    };
  }, []); // Run only once on mount

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        setCapturedImage(canvas.toDataURL('image/jpeg'));
        stopStream();
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startStream(currentDeviceId);
  };

  const handleSwitchCamera = () => {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex(d => d.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDeviceId = devices[nextIndex].deviceId;
    setCurrentDeviceId(nextDeviceId);
    startStream(nextDeviceId); // Restart stream with the new device
  };

  const renderContent = () => {
    if (permissionState === 'loading') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-2">Starting camera...</p>
        </div>
      );
    }

    if (permissionState === 'denied') {
      return (
         <div className="absolute inset-0 flex items-center justify-center text-white bg-black">
            <Alert variant="destructive">
                <VideoOff className="h-4 w-4" />
                <AlertTitle>No Camera Access</AlertTitle>
                <AlertDescription>
                Could not access the camera. Please grant permission in your browser settings and ensure a camera is connected.
                </AlertDescription>
            </Alert>
        </div>
      );
    }

    return (
      <>
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
        ) : (
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
        )}
      </>
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black flex items-center justify-center">
        {renderContent()}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex justify-center items-center gap-4">
        {capturedImage ? (
          <>
            <Button onClick={handleRetake} variant="outline">
              <SwitchCamera className="mr-2" /> Retake
            </Button>
            <Button onClick={handleConfirm}>
              Use this Image
            </Button>
          </>
        ) : (
          <>
            {devices.length > 1 && (
              <Button onClick={handleSwitchCamera} variant="outline" size="icon" className="h-16 w-16 rounded-full" aria-label="Switch Camera" disabled={permissionState !== 'granted'}>
                <SwitchCamera className="h-8 w-8" />
              </Button>
            )}
            <Button onClick={handleCapture} disabled={permissionState !== 'granted'} size="lg" className="rounded-full h-16 w-16">
              <Camera className="h-8 w-8" />
              <span className="sr-only">Capture</span>
            </Button>
            {/* Placeholder to keep layout consistent */}
            {devices.length > 1 && <div className="w-16"></div>} 
          </>
        )}
      </div>
    </div>
  );
}
