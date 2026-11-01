import React, { useRef, useState, useCallback } from 'react';
import { OverlayState } from '../types/pose';
import { Lock, EyeOff, Maximize2 } from 'lucide-react';

interface ReferenceOverlayProps {
  imageUrl: string;
  poseName: string;
  overlayState: OverlayState;
  onUpdateState: (patch: Partial<OverlayState>) => void;
  containerWidth: number;
  containerHeight: number;
}

export const ReferenceOverlay: React.FC<ReferenceOverlayProps> = ({
  imageUrl,
  poseName,
  overlayState,
  onUpdateState,
  containerWidth,
  containerHeight,
}) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Active touch / pointer tracking for drag and pinch-to-zoom
  const isDraggingRef = useRef(false);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const initialOffsetRef = useRef({ x: 0, y: 0 });

  // Multi-touch pinch tracking
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialPinchDistRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);

  const [isInteracting, setIsInteracting] = useState(false);

  // Helper to calculate distance between two pointer points
  const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (overlayState.isLocked || !overlayState.isVisible) return;

      overlayRef.current?.setPointerCapture(e.pointerId);
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointersRef.current.size === 1) {
        // Single pointer drag
        isDraggingRef.current = true;
        startPointerRef.current = { x: e.clientX, y: e.clientY };
        initialOffsetRef.current = { x: overlayState.x, y: overlayState.y };
        setIsInteracting(true);
      } else if (activePointersRef.current.size === 2) {
        // Two-pointer pinch to zoom
        isDraggingRef.current = false;
        const points = Array.from(activePointersRef.current.values());
        initialPinchDistRef.current = getDistance(points[0], points[1]);
        initialScaleRef.current = overlayState.scale;
        setIsInteracting(true);
      }
    },
    [overlayState.isLocked, overlayState.isVisible, overlayState.x, overlayState.y, overlayState.scale]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (overlayState.isLocked || !overlayState.isVisible) return;
      if (!activePointersRef.current.has(e.pointerId)) return;

      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointersRef.current.size === 1 && isDraggingRef.current) {
        // Handle drag
        const dx = e.clientX - startPointerRef.current.x;
        const dy = e.clientY - startPointerRef.current.y;

        // Soft boundary clamping so overlay doesn't disappear completely
        const maxX = (containerWidth || 360) * 0.85;
        const maxY = (containerHeight || 640) * 0.85;

        const newX = Math.max(-maxX, Math.min(maxX, initialOffsetRef.current.x + dx));
        const newY = Math.max(-maxY, Math.min(maxY, initialOffsetRef.current.y + dy));

        onUpdateState({ x: newX, y: newY, fitMode: 'free' });
      } else if (activePointersRef.current.size === 2 && initialPinchDistRef.current !== null) {
        // Handle pinch zoom
        const points = Array.from(activePointersRef.current.values());
        const currentDist = getDistance(points[0], points[1]);
        const factor = currentDist / initialPinchDistRef.current;
        const newScale = Math.max(0.35, Math.min(2.8, initialScaleRef.current * factor));

        onUpdateState({ scale: Number(newScale.toFixed(2)), fitMode: 'free' });
      }
    },
    [overlayState.isLocked, overlayState.isVisible, containerWidth, containerHeight, onUpdateState]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (activePointersRef.current.has(e.pointerId)) {
        activePointersRef.current.delete(e.pointerId);
      }

      if (activePointersRef.current.size === 0) {
        isDraggingRef.current = false;
        initialPinchDistRef.current = null;
        setIsInteracting(false);
      } else if (activePointersRef.current.size === 1) {
        // Re-anchor single finger drag if coming off a pinch
        const remainingPointer = activePointersRef.current.values().next().value;
        if (remainingPointer) {
          startPointerRef.current = { x: remainingPointer.x, y: remainingPointer.y };
          initialOffsetRef.current = { x: overlayState.x, y: overlayState.y };
          isDraggingRef.current = true;
        }
      }
    },
    [overlayState.x, overlayState.y]
  );

  // Mouse wheel zoom support on desktop
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (overlayState.isLocked || !overlayState.isVisible) return;
      e.preventDefault();
      const zoomDelta = e.deltaY * -0.0015;
      const newScale = Math.max(0.35, Math.min(2.8, overlayState.scale + zoomDelta));
      onUpdateState({ scale: Number(newScale.toFixed(2)), fitMode: 'free' });
    },
    [overlayState.isLocked, overlayState.isVisible, overlayState.scale, onUpdateState]
  );

  if (!overlayState.isVisible) {
    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/60 text-xs flex items-center gap-1.5">
          <EyeOff size={13} />
          <span>Overlay Hidden</span>
        </div>
      </div>
    );
  }

  // Base styling for overlay layer
  const transformStyle = `translate3d(${overlayState.x}px, ${overlayState.y}px, 0) scale(${overlayState.scale}) ${
    overlayState.isMirrored ? 'scaleX(-1)' : ''
  }`;

  const isFitScreen = overlayState.fitMode === 'contain';
  const isFillScreen = overlayState.fitMode === 'cover';

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none"
      style={{ touchAction: 'none' }}
    >
      <div
        ref={overlayRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className={`relative transition-shadow cursor-grab active:cursor-grabbing ${
          isFitScreen || isFillScreen
            ? 'w-full h-full flex items-center justify-center'
            : 'max-w-[85%] max-h-[85%]'
        } ${overlayState.isLocked ? 'pointer-events-none cursor-default' : 'pointer-events-auto'} ${
          isInteracting ? 'ring-2 ring-sky-400/50 rounded-xl shadow-2xl' : ''
        }`}
        style={{
          transform: transformStyle,
          opacity: overlayState.opacity,
          mixBlendMode: overlayState.blendMode === 'difference' ? 'difference' : 'normal',
          willChange: 'transform, opacity',
          touchAction: 'none',
        }}
        title={`${poseName} Reference Overlay`}
      >
        <img
          src={imageUrl}
          alt={`Pose reference: ${poseName}`}
          referrerPolicy="no-referrer"
          className={`select-none pointer-events-none shadow-lg ${
            isFitScreen
              ? 'w-full h-full object-contain'
              : isFillScreen
              ? 'w-full h-full object-cover'
              : 'w-auto h-auto max-h-[75vh] max-w-[85vw] object-contain rounded-lg'
          }`}
          draggable={false}
        />

        {/* Status badges when locked or interacting */}
        {overlayState.isLocked && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white/80 p-1.5 rounded-md border border-white/15 pointer-events-none">
            <Lock size={14} className="text-amber-400" />
          </div>
        )}

        {isInteracting && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded text-[11px] text-sky-300 font-mono pointer-events-none whitespace-nowrap border border-sky-400/30 flex items-center gap-1">
            {isFitScreen && <Maximize2 size={11} className="text-sky-400" />}
            <span>
              {isFitScreen ? 'Fit to Screen' : isFillScreen ? 'Fill Screen' : `${Math.round(overlayState.scale * 100)}%`}
            </span>
            <span className="text-white/40">·</span>
            <span>({Math.round(overlayState.x)}, {Math.round(overlayState.y)})</span>
          </div>
        )}
      </div>
    </div>
  );
};
