
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
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>(undefined);


  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
  }, []);

  const getDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !currentDeviceId) {
        // Prefer environment (back) camera first
        const backCamera = videoDevices.find(d => d.label.toLowerCase().includes('back'));
        setCurrentDeviceId(backCamera?.deviceId || videoDevices[0].deviceId);
      }
      if(videoDevices.length === 0){
        setHasCameraPermission(false);
      }
    } catch (error) {
       console.error('Error enumerating devices:', error);
       setHasCameraPermission(false);
    }
  }, [currentDeviceId]);


  const startVideoStream = useCallback(async (deviceId: string) => {
    if (hasCameraPermission === false || typeof window === 'undefined' || !navigator.mediaDevices) return;
    cleanupStream();
    try {
        const constraints = {
            video: {
                deviceId: { exact: deviceId }
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
         // Request devices again to get labels
        await getDevices();

    } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
    }
  }, [cleanupStream, toast, hasCameraPermission, getDevices]);

  useEffect(() => {
    const video = videoRef.current;
    const handleCanPlay = () => { setHasCameraPermission(true); };
    if (video) { video.addEventListener('loadedmetadata', handleCanPlay); }
    return () => { if (video) { video.removeEventListener('loadedmetadata', handleCanPlay); }};
  }, []);

  useEffect(() => {
    if (!capturedImage) {
        // Initial permission request
        if(hasCameraPermission === null) {
            navigator.mediaDevices.getUserMedia({video: true})
            .then(stream => {
                cleanupStream(); // Stop the initial temporary stream
                getDevices();
            })
            .catch(() => setHasCameraPermission(false));
        } else if (currentDeviceId) {
            startVideoStream(currentDeviceId);
        }
    }
    return () => {
      cleanupStream();
    };
  }, [capturedImage, currentDeviceId, getDevices, startVideoStream, hasCameraPermission, cleanupStream]);

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
        cleanupStream(); 
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
    setHasCameraPermission(null);
    setCurrentDeviceId(undefined); // Reset to re-trigger device fetching
  };

  const handleSwitchCamera = () => {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex(d => d.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setCurrentDeviceId(devices[nextIndex].deviceId);
  }


  if (hasCameraPermission === false) {
    return (
      <Alert variant="destructive">
        <VideoOff className="h-4 w-4" />
        <AlertTitle>No Camera Access</AlertTitle>
        <AlertDescription>
          Camera access is required. Please grant permission in your browser settings and refresh the page.
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
             <video ref={videoRef} className={cn("w-full h-full object-cover", hasCameraPermission ? 'opacity-100' : 'opacity-0')} autoPlay playsInline muted />
             {hasCameraPermission === null && (
                 <div className="absolute flex flex-col items-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="mt-2">Starting camera...</p>
                 </div>
             )}
             {hasCameraPermission === false && (
                <div className="absolute flex flex-col items-center text-white">
                    <VideoOff className="h-10 w-10" />
                    <p className="mt-2">Camera permission denied</p>
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
                <Button onClick={handleSwitchCamera} variant="outline" size="icon" className="h-16 w-16 rounded-full" aria-label="Switch Camera">
                    <SwitchCamera className="h-8 w-8" />
                </Button>
            )}
            <Button onClick={handleCapture} disabled={isProcessing || !hasCameraPermission} size="lg" className="rounded-full h-16 w-16">
              <Camera className="h-8 w-8" />
              <span className="sr-only">Capture</span>
            </Button>
             {/* Placeholder for alignment */}
            {devices.length > 1 && <div className="w-16"></div>}
          </>
        )}
      </div>
    </div>
  );
}
