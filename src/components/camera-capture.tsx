
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, SwitchCamera, VideoOff, Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

interface CameraCaptureProps {
  onCapture: (imageDataUri: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState<number>(0);
  const [isStarting, setIsStarting] = useState(true);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async (deviceId?: string) => {
    stopStream();
    setIsStarting(true);
    setHasPermission(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported on this browser.');
      }
      
      const videoDevices = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);

      if (videoDevices.length === 0) {
        throw new Error("No video input devices found.");
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // The `play()` call is crucial for some browsers.
        await videoRef.current.play();
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
    } finally {
        setIsStarting(false);
    }
  }, [stopStream, toast]);

  useEffect(() => {
    // Only start the stream when the component mounts.
    startStream();
    // Stop the stream when the component unmounts.
    return () => {
      stopStream();
    };
  }, [startStream, stopStream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && hasPermission) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        setCapturedImage(canvas.toDataURL('image/jpeg'));
        stopStream(); // Stop the stream after capturing
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
    // Restart the stream with the currently selected device.
    if(devices.length > 0) {
        startStream(devices[currentDeviceIndex].deviceId);
    } else {
        startStream();
    }
  };

  const handleSwitchCamera = () => {
    if (devices.length < 2) return;
    const nextIndex = (currentDeviceIndex + 1) % devices.length;
    setCurrentDeviceIndex(nextIndex);
    startStream(devices[nextIndex].deviceId);
  };

  const renderContent = () => {
    if (capturedImage) {
      return <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />;
    }
    
    if (isStarting) {
       return (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-2">Starting camera...</p>
        </div>
      );
    }

    if (hasPermission === false) {
      return (
         <div className="absolute inset-0 flex items-center justify-center text-white bg-black p-4">
            <Alert variant="destructive">
                <VideoOff className="h-4 w-4" />
                <AlertTitle>No Camera Access</AlertTitle>
                <AlertDescription>
                 Please grant permission in your browser settings and refresh the page.
                </AlertDescription>
            </Alert>
        </div>
      );
    }
    
    // Always render the video element to avoid issues with refs
    return <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />;
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
              <Button onClick={handleSwitchCamera} variant="outline" size="icon" className="h-16 w-16 rounded-full" aria-label="Switch Camera" disabled={!hasPermission || isStarting}>
                <SwitchCamera className="h-8 w-8" />
              </Button>
            )}
            <Button onClick={handleCapture} disabled={!hasPermission || isStarting} size="lg" className="rounded-full h-16 w-16">
              <Camera className="h-8 w-8" />
              <span className="sr-only">Capture</span>
            </Button>
            {/* Placeholder to keep capture button centered */}
            {devices.length > 1 && <div className="w-16"></div>} 
          </>
        )}
      </div>
    </div>
  );
}
