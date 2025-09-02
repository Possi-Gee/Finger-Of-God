
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
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>(undefined);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async (deviceId: string) => {
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (error) {
      console.error('Error starting video stream:', error);
      setHasPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
    }
  }, [stopStream, toast]);

  useEffect(() => {
    const initializeCamera = async () => {
      if (capturedImage) return;

      try {
        // First, just get permission and list devices
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
        setDevices(videoDevices);

        if (videoDevices.length > 0) {
           const backCamera = videoDevices.find(d => d.label.toLowerCase().includes('back'));
           const initialDeviceId = backCamera?.deviceId || videoDevices[0].deviceId;
           setCurrentDeviceId(initialDeviceId);
        } else {
           setHasPermission(false); // No video devices found
        }
        
        // Stop the temporary stream used for permission
        tempStream.getTracks().forEach(track => track.stop());

      } catch (error) {
        console.error('Error initializing camera:', error);
        setHasPermission(false);
      }
    };
    
    initializeCamera();

    return () => {
      stopStream();
    };
  }, [capturedImage]);
  
  useEffect(() => {
      if (currentDeviceId && !capturedImage) {
          startStream(currentDeviceId);
      }
  }, [currentDeviceId, startStream, capturedImage]);


  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      setIsProcessing(true);
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
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    // Let the useEffect hook re-initialize the camera
  };

  const handleSwitchCamera = () => {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex(d => d.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setCurrentDeviceId(devices[nextIndex].deviceId);
  }

  if (hasPermission === false) {
    return (
      <Alert variant="destructive">
        <VideoOff className="h-4 w-4" />
        <AlertTitle>No Camera Access</AlertTitle>
        <AlertDescription>
          Could not access the camera. Please grant permission in your browser settings and ensure a camera is connected.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black flex items-center justify-center">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
        ) : (
           <>
             <video ref={videoRef} className={cn("w-full h-full object-cover", hasPermission ? 'opacity-100' : 'opacity-0')} autoPlay playsInline muted />
             {hasPermission === null && (
                 <div className="absolute flex flex-col items-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="mt-2">Starting camera...</p>
                 </div>
             )}
           </>
        )}
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
                <Button onClick={handleSwitchCamera} variant="outline" size="icon" className="h-16 w-16 rounded-full" aria-label="Switch Camera" disabled={isProcessing || !hasPermission}>
                    <SwitchCamera className="h-8 w-8" />
                </Button>
            )}
            <Button onClick={handleCapture} disabled={isProcessing || !hasPermission} size="lg" className="rounded-full h-16 w-16">
              <Camera className="h-8 w-8" />
              <span className="sr-only">Capture</span>
            </Button>
            {devices.length > 1 && <div className="w-16"></div>}
          </>
        )}
      </div>
    </div>
  );
}
