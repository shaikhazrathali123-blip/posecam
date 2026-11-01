import React from 'react';
import { ArrowLeft, Camera, FlipHorizontal, Sparkles, Check, Compass, Eye, Maximize2 } from 'lucide-react';
import { PoseItem, OverlayState } from '../types/pose';

interface PosePreviewProps {
  pose: PoseItem;
  overlayState: OverlayState;
  onUpdateOverlayState: (patch: Partial<OverlayState>) => void;
  onProceedToCamera: () => void;
  onBackToGallery: () => void;
}

export const PosePreview: React.FC<PosePreviewProps> = ({
  pose,
  overlayState,
  onUpdateOverlayState,
  onProceedToCamera,
  onBackToGallery,
}) => {
  const toggleMirror = () => {
    onUpdateOverlayState({ isMirrored: !overlayState.isMirrored });
  };

  const toggleFitMode = () => {
    const nextMode = overlayState.fitMode === 'contain' ? 'cover' : overlayState.fitMode === 'cover' ? 'free' : 'contain';
    onUpdateOverlayState({ fitMode: nextMode, x: 0, y: 0, scale: 1.0 });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white/20">
      {/* Top Bar */}
      <header className="px-5 py-4 border-b border-white/[0.08] backdrop-blur-md sticky top-0 z-30 bg-black/85 flex items-center justify-between">
        <button
          onClick={onBackToGallery}
          className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center text-white/80 hover:text-white transition-colors active:scale-95 cursor-pointer"
          aria-label="Back to Gallery"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">
            {pose.category}
          </span>
          <h1 className="text-sm font-bold text-white tracking-tight truncate max-w-[170px]">
            {pose.name}
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Fit to Screen Option */}
          <button
            onClick={toggleFitMode}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95 cursor-pointer ${
              overlayState.fitMode === 'contain'
                ? 'bg-sky-400 text-black shadow-lg shadow-sky-400/20'
                : overlayState.fitMode === 'cover'
                ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/20'
                : 'bg-white/[0.08] text-white/80 hover:bg-white/[0.15]'
            }`}
            title={`Overlay Mode: ${overlayState.fitMode === 'contain' ? 'Fit Screen' : overlayState.fitMode === 'cover' ? 'Fill Screen' : 'Center'}`}
          >
            <Maximize2 size={16} />
          </button>

          {/* Flip Horizontal */}
          <button
            onClick={toggleMirror}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95 cursor-pointer ${
              overlayState.isMirrored
                ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20'
                : 'bg-white/[0.08] text-white/80 hover:bg-white/[0.15]'
            }`}
            title="Flip pose horizontally"
          >
            <FlipHorizontal size={17} />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-lg w-full mx-auto px-5 py-5 flex flex-col justify-center">
        {/* Large Image Preview with Mirror State */}
        <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl flex items-center justify-center">
          <img
            src={pose.imageUrl}
            alt={pose.name}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-contain transition-transform duration-300 ${
              overlayState.isMirrored ? 'scale-x-[-1]' : ''
            }`}
          />

          {overlayState.isMirrored && (
            <div className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-sky-300 flex items-center gap-1">
              <FlipHorizontal size={12} />
              <span>Mirrored</span>
            </div>
          )}

          {pose.isCustomUpload && (
            <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/30 text-[11px] font-semibold text-amber-300 flex items-center gap-1">
              <Sparkles size={12} />
              <span>Custom Upload</span>
            </div>
          )}
        </div>

        {/* Pose Coaching Insights */}
        <div className="mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center gap-2 text-xs font-bold text-white/90 mb-2">
            <Compass size={14} className="text-sky-400" />
            <span>Pose Coaching & Alignment Cues</span>
          </div>
          <ul className="space-y-1.5">
            {pose.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-white/70">
                <Check size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* Sticky Bottom Action Buttons */}
      <footer className="p-5 border-t border-white/[0.08] bg-black/90 backdrop-blur-md sticky bottom-0 z-20 pb-safe">
        <div className="max-w-lg mx-auto flex flex-col gap-2.5">
          <button
            onClick={onProceedToCamera}
            className="w-full h-13 rounded-2xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-white/10 hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Camera size={18} className="stroke-[2.2]" />
            <span>Use This Pose (Open Camera)</span>
          </button>

          <button
            onClick={onBackToGallery}
            className="w-full h-11 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white font-medium text-xs flex items-center justify-center transition-colors cursor-pointer"
          >
            Choose Another Pose
          </button>
        </div>
      </footer>
    </div>
  );
};
