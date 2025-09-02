
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
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);


  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
  }, []);

  const startVideoStream = useCallback(async () => {
    if (hasCameraPermission === false || !navigator.mediaDevices) return;
    cleanupStream();
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setHasCameraPermission(true);
        }
    } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
    }
  }, [cleanupStream, toast, hasCameraPermission]);


  useEffect(() => {
    // This effect now only requests permission and starts the stream
    // when the component mounts or when retaking a photo.
    if (!capturedImage) {
        startVideoStream();
    }

    return () => {
      cleanupStream();
    };
  }, [capturedImage, startVideoStream, cleanupStream]);

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
    setHasCameraPermission(null); // Reset to trigger the useEffect to get the stream again
  };


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
           </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex justify-center gap-4">
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
          <Button onClick={handleCapture} disabled={isProcessing || !hasCameraPermission} size="lg" className="rounded-full h-16 w-16">
            <Camera className="h-8 w-8" />
            <span className="sr-only">Capture</span>
          </Button>
        )}
      </div>
    </div>
  );
}
