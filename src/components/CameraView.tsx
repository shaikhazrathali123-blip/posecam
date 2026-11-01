import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCcw,
  Zap,
  ZapOff,
  Grid,
  Timer,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Contrast,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Sliders,
  X,
  Compass,
  Upload,
  AlertCircle
} from 'lucide-react';
import { PoseItem, OverlayState } from '../types/pose';
import { useCamera } from '../hooks/useCamera';
import { ReferenceOverlay } from './ReferenceOverlay';
import { PWAInstallButton } from './PWAInstallButton';

interface CameraViewProps {
  activePose: PoseItem;
  allPoses: PoseItem[];
  overlayState: OverlayState;
  onSelectPose: (pose: PoseItem) => void;
  onUpdateOverlayState: (patch: Partial<OverlayState>) => void;
  onCaptureComplete: (capturedDataUrl: string, capturedBlob: Blob) => void;
  onOpenUpload: () => void;
  onOpenPoseLibrary: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  activePose,
  allPoses,
  overlayState,
  onSelectPose,
  onUpdateOverlayState,
  onCaptureComplete,
  onOpenUpload,
  onOpenPoseLibrary,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 360, height: 640 });

  const {
    videoRef,
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
    captureFrame,
    playCountdownBeep,
  } = useCamera('user');

  // UI state
  const [showGrid, setShowGrid] = useState(false);
  const [timerDuration, setTimerDuration] = useState<0 | 3 | 5 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showPoseDrawer, setShowPoseDrawer] = useState(false);
  const [showOptions, setShowOptions] = useState(true);

  // Measure container for overlay clamping with ResizeObserver
  useEffect(() => {
    const updateDims = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setContainerDimensions({
            width: clientWidth,
            height: clientHeight,
          });
        }
      }
    };
    updateDims();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => {
        updateDims();
      });
      ro.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDims);
    window.addEventListener('orientationchange', updateDims);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', updateDims);
      window.removeEventListener('orientationchange', updateDims);
    };
  }, []);

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Execute shutter capture
  const executeCapture = useCallback(() => {
    if (isCapturing) return;
    setIsCapturing(true);

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    setTimeout(() => {
      const result = captureFrame();
      setIsCapturing(false);
      if (result) {
        onCaptureComplete(result.dataUrl, result.blob);
      } else {
        alert('Failed to capture frame. Please try again.');
      }
    }, 80);
  }, [isCapturing, captureFrame, onCaptureComplete]);

  // Handle Shutter Press
  const handleShutterPress = () => {
    if (status !== 'ready' || isCapturing) return;

    if (timerDuration === 0) {
      executeCapture();
      return;
    }

    let current = timerDuration;
    setCountdown(current);
    playCountdownBeep(false);

    const intervalId = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountdown(current);
        playCountdownBeep(false);
      } else {
        clearInterval(intervalId);
        setCountdown(null);
        playCountdownBeep(true);
        executeCapture();
      }
    }, 1000);
  };

  const handleResetAlignment = () => {
    onUpdateOverlayState({
      x: 0,
      y: 0,
      scale: 1.0,
      opacity: 0.45,
      isLocked: false,
      isVisible: true,
      blendMode: 'normal',
      fitMode: 'contain',
    });
  };

  const cycleFitMode = () => {
    if (overlayState.fitMode === 'contain') {
      onUpdateOverlayState({ fitMode: 'cover', x: 0, y: 0, scale: 1.0 });
    } else if (overlayState.fitMode === 'cover') {
      onUpdateOverlayState({ fitMode: 'free', x: 0, y: 0, scale: 1.0 });
    } else {
      onUpdateOverlayState({ fitMode: 'contain', x: 0, y: 0, scale: 1.0 });
    }
  };

  const cycleTimer = () => {
    if (timerDuration === 0) setTimerDuration(3);
    else if (timerDuration === 3) setTimerDuration(5);
    else if (timerDuration === 5) setTimerDuration(10);
    else setTimerDuration(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex-1 bg-black text-white overflow-hidden flex flex-col justify-between select-none touch-none"
    >
      {/* Shutter White Flash */}
      <div
        className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-200 ${
          isFlashing ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Layer 1: Live Video Feed */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-neutral-950">
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`w-full h-full object-cover select-none pointer-events-none ${
            isMirrored ? 'scale-x-[-1]' : ''
          }`}
        />

        {/* Loading Spinner */}
        {status === 'requesting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin mb-3" />
            <p className="text-xs font-semibold text-white tracking-wide uppercase">Starting Camera</p>
          </div>
        )}

        {/* Camera Permission / Error Screen */}
        {(status === 'denied' || status === 'error' || status === 'unsupported') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/95 p-6 z-30 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-3">
              <AlertCircle size={28} />
            </div>
            <h2 className="text-base font-bold text-white mb-1.5">Camera Access Needed</h2>
            <p className="text-xs text-white/60 max-w-xs mb-5 leading-relaxed">
              {errorMessage || 'Allow camera permissions to view live preview and align with reference poses.'}
            </p>
            <button
              onClick={() => startCamera()}
              className="w-full max-w-xs h-12 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw size={15} />
              <span>Retry Camera</span>
            </button>
          </div>
        )}

        {/* Rule of Thirds Grid Guides */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-1/3 left-0 right-0 border-b border-white/20" />
            <div className="absolute top-2/3 left-0 right-0 border-b border-white/20" />
            <div className="absolute left-1/3 top-0 bottom-0 border-r border-white/20" />
            <div className="absolute left-2/3 top-0 bottom-0 border-r border-white/20" />
            {/* Center crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none opacity-30">
              <div className="absolute top-1/2 left-0 right-0 border-b border-white" />
              <div className="absolute left-1/2 top-0 bottom-0 border-r border-white" />
            </div>
          </div>
        )}

        {/* Layer 2: Translucent Reference Overlay */}
        {status === 'ready' && (
          <ReferenceOverlay
            imageUrl={activePose.imageUrl}
            poseName={activePose.name}
            overlayState={overlayState}
            onUpdateState={onUpdateOverlayState}
            containerWidth={containerDimensions.width}
            containerHeight={containerDimensions.height}
          />
        )}

        {/* Shutter Countdown Display */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-xs pointer-events-none">
            <div className="w-28 h-28 rounded-full bg-black/80 border border-white/20 flex items-center justify-center animate-ping duration-1000">
              <span className="text-6xl font-extrabold text-white font-mono">{countdown}</span>
            </div>
          </div>
        )}
      </div>

      {/* TOP STATUS & CAMERA CONTROLS BAR (Mobile Native Header) */}
      <header className="relative z-30 px-2.5 sm:px-3 pt-2.5 sm:pt-3 pb-2 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent pt-safe">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Active Pose Pill (Tap to view tips) */}
          {/* <button
            type="button"
            onClick={() => setShowPoseDrawer(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs text-white active:scale-95 transition-all max-w-[110px] xs:max-w-[140px] sm:max-w-[170px] min-w-0 cursor-pointer shadow-sm"
            title="Pose Coaching & Details"
          >
            <div className="w-4.5 h-4.5 rounded-full overflow-hidden shrink-0 border border-white/30 bg-neutral-900">
              <img src={activePose.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="truncate font-semibold text-[11px]">{activePose.name}</span>
            <ChevronUp size={12} className="text-white/60 shrink-0" />
          </button> */}

          {/* In-App PWA Install Button */}
          <div className="shrink-0">
            <PWAInstallButton variant="compact" />
          </div>
        </div>

        {/* Camera Tools Icons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-1">
          {hasTorch && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-95 cursor-pointer ${
                isTorchOn ? 'bg-amber-400 text-black border-amber-300' : 'bg-black/50 border-white/15 text-white/80'
              }`}
              title="Flashlight"
            >
              {isTorchOn ? <Zap size={14} /> : <ZapOff size={14} />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-95 cursor-pointer ${
              showGrid ? 'bg-white text-black border-white' : 'bg-black/50 border-white/15 text-white/80'
            }`}
            title="Grid"
          >
            <Grid size={14} />
          </button>

          <button
            type="button"
            onClick={cycleTimer}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-95 cursor-pointer ${
              timerDuration > 0
                ? 'bg-amber-400 text-black border-amber-300 font-bold font-mono text-[10px] sm:text-[11px]'
                : 'bg-black/50 border-white/15 text-white/80'
            }`}
            title="Timer"
          >
            {timerDuration > 0 ? <span>{timerDuration}s</span> : <Timer size={14} />}
          </button>

          <button
            type="button"
            onClick={switchCamera}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 border border-white/15 text-white/80 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            title="Switch front/rear"
          >
            <RefreshCw size={14} className={facingMode === 'user' ? '' : 'rotate-180 transition-transform'} />
          </button>
        </div>
      </header>

      {/* BOTTOM CAMERA SURFACE: Quick Shelf + Shutter with Open/Close Toggle */}
      <footer className="relative z-30 flex flex-col justify-end bg-gradient-to-t from-black via-black/90 to-transparent pt-1.5 pb-2 px-2.5 sm:px-3">
        {/* If options are OPEN: show tiered options panel */}
        {showOptions ? (
          <div className="max-w-md mx-auto w-full flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Header: Title + Done button */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-white/90 flex items-center gap-1.5">
                <Sliders size={12} className="text-sky-400" />
                <span>Overlay & Alignment</span>
              </span>
              <button
                type="button"
                onClick={() => setShowOptions(false)}
                className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-sm"
                title="Hide options"
              >
                <span>Close</span>
                <ChevronDown size={13} />
              </button>
            </div>

            {/* Row 1: Fit Mode Segmented Switcher + Overlay Quick Toggles */}
            <div className="flex items-center justify-between gap-1.5 bg-black/75 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 shadow-lg">
              {/* Segmented Framing Switcher: Fit / Fill / Free */}
              <div className="flex items-center bg-white/[0.08] p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => onUpdateOverlayState({ fitMode: 'contain', x: 0, y: 0, scale: 1.0 })}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    overlayState.fitMode === 'contain'
                      ? 'bg-sky-400 text-black shadow-sm'
                      : 'text-white/70 hover:text-white'
                  }`}
                  title="Fit entire pose inside screen"
                >
                  Fit
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateOverlayState({ fitMode: 'cover', x: 0, y: 0, scale: 1.0 })}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    overlayState.fitMode === 'cover'
                      ? 'bg-emerald-400 text-black shadow-sm'
                      : 'text-white/70 hover:text-white'
                  }`}
                  title="Fill screen with pose"
                >
                  Fill
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateOverlayState({ fitMode: 'free' })}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    overlayState.fitMode === 'free'
                      ? 'bg-amber-400 text-black shadow-sm'
                      : 'text-white/70 hover:text-white'
                  }`}
                  title="Free drag and pinch to zoom"
                >
                  Free
                </button>
              </div>

              {/* Quick utility toggles */}
              <div className="flex items-center gap-1">
                {/* Mirror / Flip Pose */}
                <button
                  type="button"
                  onClick={() => onUpdateOverlayState({ isMirrored: !overlayState.isMirrored })}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    overlayState.isMirrored
                      ? 'bg-sky-400 text-black'
                      : 'bg-white/10 text-white/70 hover:text-white'
                  }`}
                  title="Flip pose horizontally"
                >
                  <RefreshCw size={12} className="rotate-90" />
                </button>

                {/* Lock Overlay Position */}
                <button
                  type="button"
                  onClick={() => onUpdateOverlayState({ isLocked: !overlayState.isLocked })}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    overlayState.isLocked
                      ? 'bg-amber-400 text-black'
                      : 'bg-white/10 text-white/70 hover:text-white'
                  }`}
                  title={overlayState.isLocked ? 'Overlay locked' : 'Lock overlay'}
                >
                  {overlayState.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>

                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => onUpdateOverlayState({ isVisible: !overlayState.isVisible })}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    !overlayState.isVisible
                      ? 'bg-red-500 text-white'
                      : 'bg-white/10 text-white/70 hover:text-white'
                  }`}
                  title={overlayState.isVisible ? 'Hide overlay' : 'Show overlay'}
                >
                  {overlayState.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
              </div>
            </div>

            {/* Row 2: Opacity Slider & Difference Match */}
            <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md rounded-2xl px-3 py-1.5 border border-white/10 shadow-lg">
              <span className="text-[10px] font-semibold text-white/60 shrink-0 uppercase tracking-wider">
                Opacity
              </span>
              <input
                type="range"
                min="0.08"
                max="1.0"
                step="0.02"
                value={overlayState.opacity}
                onChange={(e) => onUpdateOverlayState({ opacity: parseFloat(e.target.value) })}
                className="flex-1 accent-white h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                aria-label="Overlay opacity"
              />
              <span className="font-mono text-[11px] text-white/90 font-bold w-7 text-right shrink-0">
                {Math.round(overlayState.opacity * 100)}%
              </span>

              {/* Silhouette Difference Match Toggle */}
              <button
                type="button"
                onClick={() =>
                  onUpdateOverlayState({
                    blendMode: overlayState.blendMode === 'difference' ? 'normal' : 'difference',
                  })
                }
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                  overlayState.blendMode === 'difference'
                    ? 'bg-sky-400 text-black shadow-sm'
                    : 'bg-white/10 text-white/70 hover:text-white'
                }`}
                title="Silhouette Difference Match Mode"
              >
                <Contrast size={11} />
                <span>Match</span>
              </button>
            </div>

            {/* Row 3: Pose Quick Carousel Shelf */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none select-none px-0.5">
              <button
                type="button"
                onClick={onOpenUpload}
                className="flex flex-col items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-dashed border-white/20 active:scale-95 transition-all text-white/80 cursor-pointer"
                title="Upload Custom Pose"
              >
                <Upload size={14} />
                <span className="text-[8px] mt-0.5 text-white/50">Custom</span>
              </button>

              {allPoses.map((pose) => {
                const isSelected = activePose.id === pose.id;
                return (
                  <button
                    key={pose.id}
                    type="button"
                    onClick={() => onSelectPose(pose)}
                    className={`relative shrink-0 w-11 h-11 rounded-xl overflow-hidden transition-all active:scale-90 cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black scale-105 shadow-lg'
                        : 'opacity-65 hover:opacity-100 border border-white/10'
                    }`}
                    title={pose.name}
                  >
                    <img src={pose.thumbnailUrl || pose.imageUrl} alt={pose.name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-sky-400/10 pointer-events-none" />
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={onOpenPoseLibrary}
                className="flex flex-col items-center justify-center shrink-0 px-2 h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 active:scale-95 transition-all text-white/70 text-[9px] font-semibold whitespace-nowrap cursor-pointer"
              >
                <Compass size={14} className="mb-0.5 text-sky-400" />
                <span>All 20+</span>
              </button>
            </div>

            {/* Row 4: Shutter + Alignment Controls */}
            <div className="flex items-center justify-between px-6 pt-0.5 pb-1">
              <button
                type="button"
                onClick={handleResetAlignment}
                className="w-10 h-10 rounded-full bg-white/[0.08] active:scale-90 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
                title="Reset overlay scale and position"
              >
                <RotateCcw size={15} />
              </button>

              {/* Central Click (Shutter) Button */}
              <div className="relative flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleShutterPress}
                  disabled={status !== 'ready' || isCapturing}
                  className={`w-18 h-18 rounded-full border-[3.5px] border-white p-1 flex items-center justify-center transition-all duration-150 active:scale-90 shadow-2xl ${
                    isCapturing ? 'opacity-50 cursor-not-allowed scale-95' : 'cursor-pointer hover:border-white'
                  }`}
                  aria-label="Capture Photo"
                >
                  <div
                    className={`w-full h-full rounded-full bg-white transition-all duration-150 ${
                      isCapturing ? 'scale-75 bg-slate-300' : 'active:scale-90 hover:scale-95'
                    }`}
                  />
                </button>
                {timerDuration > 0 && (
                  <span className="absolute -top-5 text-[9px] font-mono text-amber-300 bg-black/80 px-2 py-0.5 rounded-full border border-amber-400/30">
                    {timerDuration}s Timer
                  </span>
                )}
              </div>

              {/* Pose Guidance Bottom Sheet Trigger */}
              <button
                type="button"
                onClick={() => setShowPoseDrawer(true)}
                className="w-10 h-10 rounded-full bg-white/[0.08] active:scale-90 flex items-center justify-center text-sky-400 hover:text-sky-300 transition-all cursor-pointer"
                title="View Pose Guidance"
              >
                <Sparkles size={15} />
              </button>
            </div>
          </div>
        ) : (
          /* When options are CLOSED: Minimalist Viewfinder with only Options pill & Shutter */
          <div className="max-w-md mx-auto w-full flex flex-col items-center justify-center pb-2">
            {/* Open Options Pill */}
            <button
              type="button"
              onClick={() => setShowOptions(true)}
              className="mb-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/90 hover:text-white flex items-center gap-1.5 text-xs font-semibold shadow-xl active:scale-95 transition-all cursor-pointer"
              title="Open all alignment features & options"
            >
              <Sliders size={13} className="text-sky-400" />
              <span>Options</span>
              <ChevronUp size={13} />
            </button>

            {/* ONLY THE CLICK (SHUTTER) BUTTON */}
            <div className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={handleShutterPress}
                disabled={status !== 'ready' || isCapturing}
                className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full border-[4px] border-white p-1 flex items-center justify-center transition-all duration-150 active:scale-90 shadow-2xl ${
                  isCapturing ? 'opacity-50 cursor-not-allowed scale-95' : 'cursor-pointer hover:border-white'
                }`}
                aria-label="Capture Photo"
              >
                <div
                  className={`w-full h-full rounded-full bg-white transition-all duration-150 ${
                    isCapturing ? 'scale-75 bg-slate-300' : 'active:scale-90 hover:scale-95'
                  }`}
                />
              </button>
              {timerDuration > 0 && (
                <span className="absolute -top-5 text-[9px] font-mono text-amber-300 bg-black/80 px-2 py-0.5 rounded-full border border-amber-400/30">
                  {timerDuration}s Timer
                </span>
              )}
            </div>
          </div>
        )}
      </footer>

      {/* NATIVE BOTTOM SHEET: Pose Coaching & Checklist */}
      {showPoseDrawer && (
        <div
          onClick={() => setShowPoseDrawer(false)}
          className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-neutral-900 border-t border-white/15 p-5 text-white shadow-2xl flex flex-col gap-3 pb-safe"
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-1" />

            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider px-2 py-0.5 rounded bg-sky-950/60 border border-sky-400/20">
                  {activePose.category}
                </span>
                <h3 className="font-bold text-sm text-white">{activePose.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPoseDrawer(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              {activePose.description}
            </p>

            <div className="bg-white/[0.04] p-3 rounded-2xl border border-white/[0.08]">
              <span className="text-[11px] font-semibold text-white/90 block mb-1.5">
                Alignment Tips:
              </span>
              <ul className="space-y-1.5">
                {activePose.tips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-white/80 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowPoseDrawer(false)}
              className="mt-1 w-full h-11 rounded-xl bg-white text-black font-semibold text-xs active:scale-95 transition-transform cursor-pointer"
            >
              Back to Camera
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
