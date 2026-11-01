import { useState, useEffect, useRef, useCallback } from 'react';

export type FacingMode = 'user' | 'environment';
export type CameraStatus = 'idle' | 'requesting' | 'ready' | 'error' | 'denied' | 'unsupported';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  status: CameraStatus;
  errorMessage: string | null;
  facingMode: FacingMode;
  hasMultipleCameras: boolean;
  hasTorch: boolean;
  isTorchOn: boolean;
  isMirrored: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  switchCamera: () => Promise<void>;
  toggleTorch: () => Promise<void>;
  setIsMirrored: (mirrored: boolean) => void;
  captureFrame: (options?: { mirror?: boolean }) => { blob: Blob; dataUrl: string } | null;
  playShutterSound: () => void;
  playCountdownBeep: (isFinal?: boolean) => void;
}

export function useCamera(initialFacingMode: FacingMode = 'user'): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [status, setStatus] = useState<CameraStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>(initialFacingMode);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [isMirrored, setIsMirrored] = useState<boolean>(initialFacingMode === 'user');

  // Check camera support & device list
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('unsupported');
      setErrorMessage('Your browser does not support camera access or the connection is not secure (HTTPS required).');
      return;
    }

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);
    }).catch(() => {
      // Ignore enumeration error
    });
  }, []);

  // Web Audio shutter click synthesizer
  const playShutterSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Layer 1: High crisp mechanical click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);

      // Layer 2: Secondary mechanical shutter spring
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(320, ctx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.06);

          gain2.gain.setValueAtTime(0.3, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.06);
        } catch {
          // Ignore audio errors
        }
      }, 70);
    } catch {
      // Audio not permitted or supported
    }
  }, []);

  // Countdown timer audio beep
  const playCountdownBeep = useCallback((isFinal = false) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isFinal ? 880 : 440, ctx.currentTime);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isFinal ? 0.25 : 0.12));

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (isFinal ? 0.25 : 0.12));
    } catch {
      // Ignore audio errors
    }
  }, []);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTorchOn(false);
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('unsupported');
      setErrorMessage('Camera access is not supported on this browser or connection is unencrypted.');
      return;
    }

    setStatus('requesting');
    setErrorMessage(null);

    // Stop any existing tracks first
    stopCamera();

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      },
      audio: false
    };

    try {
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Fallback to basic video constraint if ideal fails
        console.warn('Initial camera constraints failed, trying basic video constraints', err);
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Wait for loadedmetadata to verify dimensions and readiness
        await new Promise<void>((resolve) => {
          if (!videoRef.current) return resolve();
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch((playErr) => {
              console.warn('Video play interrupted:', playErr);
            });
            resolve();
          };
        });
      }

      // Check torch capabilities
      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities?.() || {}) as { torch?: boolean };
        setHasTorch(Boolean(capabilities.torch));
      }

      setStatus('ready');
      setIsMirrored(facingMode === 'user');
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      const error = err as Error;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setStatus('denied');
        setErrorMessage('Camera permission was denied. Please allow camera access in your browser settings to recreate poses.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setStatus('error');
        setErrorMessage('No camera hardware was found on your device.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setStatus('error');
        setErrorMessage('Camera is currently in use by another application or tab.');
      } else {
        setStatus('error');
        setErrorMessage(`Unable to access camera (${error.message || 'Unknown error'}). Check browser permissions.`);
      }
    }
  }, [facingMode, stopCamera]);

  // Switch between front and rear cameras
  const switchCamera = useCallback(async () => {
    const nextMode: FacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    setIsMirrored(nextMode === 'user');
  }, [facingMode]);

  // Re-start camera whenever facingMode changes and we are not in an error state
  useEffect(() => {
    if (status === 'ready' || status === 'requesting') {
      startCamera();
    }
  }, [facingMode]);

  // Toggle torch / flash
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextState = !isTorchOn;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }]
      });
      setIsTorchOn(nextState);
    } catch (err) {
      console.warn('Failed to toggle torch:', err);
    }
  }, [isTorchOn]);

  // Capture current video frame to high-res canvas
  const captureFrame = useCallback((options?: { mirror?: boolean }) => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      console.warn('Cannot capture frame: video not ready');
      return null;
    }

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.save();
    // Check if should mirror (e.g. front camera mirror selfie)
    const shouldMirror = options?.mirror ?? isMirrored;
    if (shouldMirror) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    playShutterSound();

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      return {
        dataUrl,
        blob: dataURItoBlob(dataUrl)
      };
    } catch (err) {
      console.error('Frame capture export failed:', err);
      return null;
    }
  }, [isMirrored, playShutterSound]);

  // Cleanup stream on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    stream: streamRef.current,
    status,
    errorMessage,
    facingMode,
    hasMultipleCameras,
    hasTorch,
    isTorchOn,
    isMirrored,
    startCamera,
    stopCamera,
    switchCamera,
    toggleTorch,
    setIsMirrored,
    captureFrame,
    playShutterSound,
    playCountdownBeep,
  };
}

// Convert dataURL to Blob for sharing/download
function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}
