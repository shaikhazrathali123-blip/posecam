import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Grid,
  Zap,
  ZapOff,
  Timer,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  FlipHorizontal,
  Sliders,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronUp,
  Contrast,
  Maximize2
} from 'lucide-react';
import { PoseItem, OverlayState } from '../types/pose';
import { useCamera, FacingMode } from '../hooks/useCamera';
import { ReferenceOverlay } from './ReferenceOverlay';

interface CameraScreenProps {
  pose: PoseItem;
  overlayState: OverlayState;
  onUpdateOverlayState: (patch: Partial<OverlayState>) => void;
  onCaptureComplete: (capturedDataUrl: string, capturedBlob: Blob) => void;
  onClose: () => void;
  onOpenGallery: () => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  pose,
  overlayState,
  onUpdateOverlayState,
  onCaptureComplete,
  onClose,
  onOpenGallery,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 360, height: 640 });

  // Camera hook
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
    setIsMirrored,
    captureFrame,
    playCountdownBeep,
  } = useCamera('user');

  // Camera screen UI states
  const [showGrid, setShowGrid] = useState(false);
  const [timerDuration, setTimerDuration] = useState<0 | 3 | 5 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showAdjustmentSheet, setShowAdjustmentSheet] = useState(false);

  // Measure camera viewport on mount & resize
  useEffect(() => {
    const updateDims = () => {
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  // Initialize camera when screen mounts
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Handle countdown timer & shutter execution
  const executeCapture = useCallback(() => {
    if (isCapturing) return;
    setIsCapturing(true);

    // Visual shutter flash animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    // Capture clean video frame from canvas (excluding overlay completely)
    setTimeout(() => {
      const result = captureFrame();
      setIsCapturing(false);
      if (result) {
        onCaptureComplete(result.dataUrl, result.blob);
      } else {
        alert('Failed to capture photo frame. Please try again.');
      }
    }, 80);
  }, [isCapturing, captureFrame, onCaptureComplete]);

  // Handle Shutter Button Press
  const handleShutterPress = () => {
    if (status !== 'ready' || isCapturing) return;

    if (timerDuration === 0) {
      executeCapture();
      return;
    }

    // Start countdown sequence
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

  // Quick reset alignment to default
  const handleResetAlignment = () => {
    onUpdateOverlayState({
      x: 0,
      y: 0,
      scale: 1.0,
      opacity: 0.45,
      isLocked: false,
      isVisible: true,
      blendMode: 'normal',
      fitMode: 'contain'
    });
  };

  // Toggle overlay fit mode between Fit to Screen (contain), Fill Screen (cover), and Free (custom manual)
  const cycleFitMode = () => {
    if (overlayState.fitMode === 'contain') {
      onUpdateOverlayState({ fitMode: 'cover', x: 0, y: 0, scale: 1.0 });
    } else if (overlayState.fitMode === 'cover') {
      onUpdateOverlayState({ fitMode: 'free', x: 0, y: 0, scale: 1.0 });
    } else {
      onUpdateOverlayState({ fitMode: 'contain', x: 0, y: 0, scale: 1.0 });
    }
  };

  // Zoom scale step
  const handleScaleDelta = (delta: number) => {
    const nextScale = Math.max(0.4, Math.min(2.5, overlayState.scale + delta));
    onUpdateOverlayState({ scale: Number(nextScale.toFixed(2)), fitMode: 'free' });
  };

  // Toggle timer interval (0 -> 3 -> 5 -> 10 -> 0)
  const cycleTimer = () => {
    if (timerDuration === 0) setTimerDuration(3);
    else if (timerDuration === 3) setTimerDuration(5);
    else if (timerDuration === 5) setTimerDuration(10);
    else setTimerDuration(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] max-h-[100dvh] bg-black text-white overflow-hidden flex flex-col justify-between select-none touch-none"
    >
      {/* Visual Shutter White Flash */}
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
            <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin mb-4" />
            <p className="text-sm font-semibold text-white">Opening Camera...</p>
            <p className="text-xs text-white/50 mt-1">Please allow camera permissions if prompted</p>
          </div>
        )}

        {/* Camera Permission / Error Screen */}
        {(status === 'denied' || status === 'error' || status === 'unsupported') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/95 p-6 z-30 text-center">
            <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Camera Access Required</h2>
            <p className="text-xs sm:text-sm text-white/60 max-w-sm mb-6 leading-relaxed">
              {errorMessage || 'PoseCam requires camera permissions to display live video and align poses.'}
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button
                onClick={() => startCamera()}
                className="w-full h-12 rounded-2xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <RefreshCw size={16} />
                <span>Retry Camera</span>
              </button>

              <button
                onClick={onClose}
                className="w-full h-11 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
              >
                Back to Reference Preview
              </button>
            </div>
          </div>
        )}

        {/* Rule of Thirds Grid Guides (Layer 1.5) */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-1/3 left-0 right-0 border-b border-white/25" />
            <div className="absolute top-2/3 left-0 right-0 border-b border-white/25" />
            <div className="absolute left-1/3 top-0 bottom-0 border-r border-white/25" />
            <div className="absolute left-2/3 top-0 bottom-0 border-r border-white/25" />
            
            {/* Center target crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none opacity-40">
              <div className="absolute top-1/2 left-0 right-0 border-b border-white" />
              <div className="absolute left-1/2 top-0 bottom-0 border-r border-white" />
            </div>
          </div>
        )}

        {/* Layer 2: Translucent Reference Overlay (Independent interactive layer) */}
        {status === 'ready' && (
          <ReferenceOverlay
            imageUrl={pose.imageUrl}
            poseName={pose.name}
            overlayState={overlayState}
            onUpdateState={onUpdateOverlayState}
            containerWidth={containerDimensions.width}
            containerHeight={containerDimensions.height}
          />
        )}

        {/* Shutter Countdown Display */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/30 backdrop-blur-xs pointer-events-none">
            <div className="w-32 h-32 rounded-full bg-black/70 border border-white/20 flex items-center justify-center animate-ping duration-1000">
              <span className="text-7xl font-extrabold text-white font-mono">{countdown}</span>
            </div>
          </div>
        )}
      </div>

      {/* TOP CONTROLS BAR */}
      <header className="relative z-30 px-4 pt-3 pb-2 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-safe">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/90 hover:text-white active:scale-95 transition-all cursor-pointer"
          aria-label="Exit Camera"
        >
          <X size={18} />
        </button>

        {/* Selected Pose Pill & Coaching Button */}
        <button
          onClick={() => setShowTipsModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-xs text-white/90 active:scale-95 transition-transform max-w-[200px]"
        >
          <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white/20">
            <img src={pose.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
          <span className="truncate font-medium">{pose.name}</span>
          <ChevronUp size={12} className="text-white/50" />
        </button>

        {/* Top Camera Utilities */}
        <div className="flex items-center gap-1.5">
          {/* Torch Toggle */}
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-95 ${
                isTorchOn
                  ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-400/20'
                  : 'bg-black/40 border-white/15 text-white/80'
              }`}
              title="Toggle Flashlight"
            >
              {isTorchOn ? <Zap size={16} /> : <ZapOff size={16} />}
            </button>
          )}

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-95 ${
              showGrid
                ? 'bg-white text-black border-white'
                : 'bg-black/40 border-white/15 text-white/80'
            }`}
            title="Rule of Thirds Grid"
          >
            <Grid size={16} />
          </button>

          {/* Timer Cycle */}
          <button
            onClick={cycleTimer}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-95 relative ${
              timerDuration > 0
                ? 'bg-amber-400 text-black border-amber-300 font-bold font-mono text-xs'
                : 'bg-black/40 border-white/15 text-white/80'
            }`}
            title="Shutter Timer"
          >
            {timerDuration > 0 ? (
              <span>{timerDuration}s</span>
            ) : (
              <Timer size={16} />
            )}
          </button>
        </div>
      </header>

      {/* BOTTOM CONTROLS SURFACE */}
      <footer className="relative z-30 flex flex-col justify-end bg-gradient-to-t from-black via-black/85 to-transparent pt-6 pb-6 px-4 pb-safe">
        {/* Floating Opacity & Quick Overlay Adjustment Bar */}
        <div className="max-w-md mx-auto w-full mb-3 px-2 flex flex-col gap-2">
          {/* Fit to Screen Quick Mode Pill Bar */}
          <div className="flex items-center justify-between text-[11px] px-1 text-white/70">
            <span className="font-semibold text-white/80 flex items-center gap-1">
              <Maximize2 size={12} className="text-sky-400" />
              <span>Overlay Framing</span>
            </span>
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-xl p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => onUpdateOverlayState({ fitMode: 'contain', x: 0, y: 0, scale: 1.0 })}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                  overlayState.fitMode === 'contain'
                    ? 'bg-sky-400 text-black shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
                title="Fit entire pose within screen"
              >
                Fit Screen
              </button>
              <button
                type="button"
                onClick={() => onUpdateOverlayState({ fitMode: 'cover', x: 0, y: 0, scale: 1.0 })}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                  overlayState.fitMode === 'cover'
                    ? 'bg-emerald-400 text-black shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
                title="Fill full screen edge to edge"
              >
                Fill Screen
              </button>
              <button
                type="button"
                onClick={() => onUpdateOverlayState({ fitMode: 'free' })}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                  overlayState.fitMode === 'free'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
                title="Free manual scale and position"
              >
                Free / Custom
              </button>
            </div>
          </div>

          {/* Opacity Slider Strip */}
          <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-2xl px-3.5 py-2 border border-white/10 shadow-xl">
            <span className="text-[11px] font-semibold text-white/60 shrink-0">Ghost Opacity</span>
            <input
              type="range"
              min="0.08"
              max="1.0"
              step="0.02"
              value={overlayState.opacity}
              onChange={(e) => onUpdateOverlayState({ opacity: parseFloat(e.target.value) })}
              className="flex-1 accent-white h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
              aria-label="Reference overlay opacity"
            />
            <span className="font-mono text-xs text-white font-bold w-9 text-right shrink-0">
              {Math.round(overlayState.opacity * 100)}%
            </span>
          </div>

          {/* Quick Adjustment Toolbar */}
          <div className="flex items-center justify-between gap-1.5 bg-black/50 backdrop-blur-md rounded-xl px-2.5 py-1.5 border border-white/[0.08]">
            {/* Fit to Screen Quick Toggle */}
            <button
              onClick={cycleFitMode}
              className={`px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 active:scale-95 transition-colors cursor-pointer ${
                overlayState.fitMode === 'contain'
                  ? 'bg-sky-400 text-black font-semibold'
                  : overlayState.fitMode === 'cover'
                  ? 'bg-emerald-400 text-black font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              title="Toggle Overlay Fit Mode (Fit Screen / Fill / Free)"
            >
              <Maximize2 size={12} />
              <span>{overlayState.fitMode === 'contain' ? 'Fit Screen' : overlayState.fitMode === 'cover' ? 'Fill' : 'Free'}</span>
            </button>

            {/* Reset Alignment */}
            <button
              onClick={handleResetAlignment}
              className="px-2 py-1 rounded-lg text-[11px] text-white/70 hover:text-white flex items-center gap-1 active:scale-95 hover:bg-white/5 transition-colors cursor-pointer"
              title="Reset overlay alignment to default fit"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>

            {/* Difference Blend Mode Toggle (Pro alignment feature) */}
            <button
              onClick={() =>
                onUpdateOverlayState({
                  blendMode: overlayState.blendMode === 'difference' ? 'normal' : 'difference',
                })
              }
              className={`px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 active:scale-95 transition-colors cursor-pointer ${
                overlayState.blendMode === 'difference'
                  ? 'bg-sky-400 text-black font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              title="Difference Blend Mode for Silhouette Matching"
            >
              <Contrast size={12} />
              <span>Match</span>
            </button>

            {/* Lock / Unlock Overlay */}
            <button
              onClick={() => onUpdateOverlayState({ isLocked: !overlayState.isLocked })}
              className={`px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 active:scale-95 transition-colors cursor-pointer ${
                overlayState.isLocked
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              title="Lock overlay position"
            >
              {overlayState.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
              <span>{overlayState.isLocked ? 'Locked' : 'Unlocked'}</span>
            </button>

            {/* Hide / Show Overlay */}
            <button
              onClick={() => onUpdateOverlayState({ isVisible: !overlayState.isVisible })}
              className={`px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 active:scale-95 transition-colors ${
                !overlayState.isVisible
                  ? 'bg-red-500/80 text-white font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              title="Toggle visibility"
            >
              {overlayState.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
              <span>{overlayState.isVisible ? 'Hide' : 'Show'}</span>
            </button>

            {/* Scale +/- buttons */}
            <div className="flex items-center gap-1 border-l border-white/10 pl-1.5">
              <button
                onClick={() => handleScaleDelta(-0.1)}
                disabled={overlayState.scale <= 0.4}
                className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30 active:scale-90"
                title="Scale smaller"
              >
                <ZoomOut size={13} />
              </button>
              <button
                onClick={() => handleScaleDelta(0.1)}
                disabled={overlayState.scale >= 2.5}
                className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30 active:scale-90"
                title="Scale larger"
              >
                <ZoomIn size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* MAIN SHUTTER ACTION ROW */}
        <div className="max-w-md mx-auto w-full flex items-center justify-around px-4 mt-1">
          {/* Left Slot: Selected Pose Thumbnail & Switcher */}
          <button
            onClick={onOpenGallery}
            className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/20 bg-neutral-900 active:scale-95 transition-transform flex items-center justify-center relative group"
            title="Switch Pose Reference"
          >
            <img src={pose.imageUrl} alt={pose.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
          </button>

          {/* Center Slot: Tactile Shutter Button */}
          <div className="relative flex items-center justify-center">
            <button
              onClick={handleShutterPress}
              disabled={status !== 'ready' || isCapturing}
              className={`w-20 h-20 rounded-full border-4 border-white/90 p-1.5 flex items-center justify-center transition-all duration-150 active:scale-90 shadow-2xl ${
                isCapturing ? 'opacity-50 cursor-not-allowed scale-95' : 'cursor-pointer hover:border-white'
              }`}
              aria-label="Take Photo"
            >
              <div
                className={`w-full h-full rounded-full bg-white transition-all duration-150 ${
                  isCapturing ? 'scale-75 bg-slate-300' : 'active:scale-90 hover:scale-95'
                }`}
              />
            </button>

            {timerDuration > 0 && (
              <span className="absolute -top-6 text-[10px] font-mono text-amber-300 bg-black/70 px-2 py-0.5 rounded-full border border-amber-400/30">
                {timerDuration}s Timer Active
              </span>
            )}
          </div>

          {/* Right Slot: Front / Rear Camera Switch */}
          <button
            onClick={switchCamera}
            className="w-12 h-12 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 flex items-center justify-center text-white/90 hover:text-white active:scale-95 transition-all cursor-pointer"
            aria-label="Switch Camera Facing Mode"
            title="Switch front/rear camera"
          >
            <RefreshCw size={19} className={facingMode === 'user' ? '' : 'rotate-180 transition-transform'} />
          </button>
        </div>
      </footer>

      {/* Tips & Pose Coaching Sheet/Modal */}
      {showTipsModal && (
        <div
          onClick={() => setShowTipsModal(false)}
          className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-white/15 p-5 text-white shadow-2xl flex flex-col gap-3 pb-safe"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-300" />
                <h3 className="font-bold text-sm">{pose.name}</h3>
              </div>
              <button
                onClick={() => setShowTipsModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              {pose.description}
            </p>

            <div className="bg-white/[0.04] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-[11px] font-semibold text-sky-400 block mb-1.5 uppercase tracking-wider">
                Recreation Checklist
              </span>
              <ul className="space-y-1">
                {pose.tips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-white/80 flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setShowTipsModal(false)}
              className="mt-2 w-full h-11 rounded-xl bg-white text-black font-semibold text-xs active:scale-95 transition-transform"
            >
              Got it, continue shooting
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
