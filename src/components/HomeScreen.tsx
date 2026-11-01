import React, { useState } from 'react';
import { Camera, Sparkles, Sliders, ShieldCheck, ChevronRight, Layers, ArrowRight } from 'lucide-react';
import { PoseItem } from '../types/pose';
import { ImageUploader } from './ImageUploader';

interface HomeScreenProps {
  onOpenGallery: () => void;
  onSelectPose: (pose: PoseItem) => void;
  featuredPoses: PoseItem[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenGallery,
  onSelectPose,
  featuredPoses,
}) => {
  // Interactive mini demo slider state
  const [demoOpacity, setDemoOpacity] = useState(0.48);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between overflow-x-hidden selection:bg-white/20">
      {/* Top Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/[0.08] backdrop-blur-md sticky top-0 z-20 bg-black/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-white via-slate-200 to-slate-400 flex items-center justify-center shadow-lg shadow-white/5">
            <Camera size={17} className="text-black stroke-[2.2]" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
            PoseCam
          </span>
        </div>

        <button
          onClick={onOpenGallery}
          className="text-xs font-medium text-white/70 hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] active:scale-95"
        >
          <span>Browse 20+ Poses</span>
          <ChevronRight size={13} />
        </button>
      </header>

      {/* Hero Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-5 py-8 flex flex-col items-center">
        {/* Editorial Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs text-white/70 mb-5">
          <Layers size={13} className="text-sky-400" />
          <span>Real-time Translucent Alignment Overlay</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center tracking-tight leading-[1.15] max-w-2xl text-balance">
          Your next photo,{' '}
          <span className="bg-gradient-to-r from-sky-400 via-white to-amber-200 bg-clip-text text-transparent">
            perfectly posed.
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-white/60 text-center max-w-md leading-relaxed">
          Align your body against reference photography with a live ghost overlay. Adjust opacity, scale, and angle for flawless recreation.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-7 w-full max-w-xs flex flex-col gap-3">
          <button
            onClick={onOpenGallery}
            className="w-full h-13 rounded-2xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-white/10 hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Camera size={18} className="stroke-[2.2]" />
            <span>Recreate a Pose</span>
          </button>

          <ImageUploader
            onImageSelected={(pose) => onSelectPose(pose)}
            triggerButton={
              <button
                type="button"
                className="w-full h-12 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/15 text-white font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Sparkles size={16} className="text-amber-300" />
                <span>Upload Your Own Pose</span>
              </button>
            }
          />
        </div>

        {/* Visual Live Demonstration: Viewfinder Simulator */}
        <div className="mt-10 w-full max-w-sm rounded-3xl bg-neutral-900/90 border border-white/[0.12] p-4 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 text-xs text-white/60 px-1">
            <span className="flex items-center gap-1.5 font-medium text-white/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Overlay Preview
            </span>
            <span className="font-mono text-[11px] text-white/40">{Math.round(demoOpacity * 100)}% Ghost Opacity</span>
          </div>

          {/* Interactive Viewfinder Box */}
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 flex items-center justify-center">
            {/* Simulated camera background (neutral studio background) */}
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-800 to-neutral-950 flex flex-col items-center justify-center text-white/20 select-none">
              <Camera size={40} className="mb-2 opacity-30" />
              <span className="text-xs uppercase tracking-widest text-white/30 font-mono">Live Camera Feed</span>
            </div>

            {/* Overlaid Reference Silhouette */}
            {featuredPoses[0] && (
              <img
                src={featuredPoses[0].imageUrl}
                alt="Pose Demonstration"
                className="absolute inset-0 w-full h-full object-cover transition-opacity pointer-events-none"
                style={{ opacity: demoOpacity }}
              />
            )}

            {/* Camera Viewfinder Crosshairs & Grid */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/3 left-0 right-0 border-b border-white/[0.08]" />
              <div className="absolute top-2/3 left-0 right-0 border-b border-white/[0.08]" />
              <div className="absolute left-1/3 top-0 bottom-0 border-r border-white/[0.08]" />
              <div className="absolute left-2/3 top-0 bottom-0 border-r border-white/[0.08]" />
              
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/40 rounded-tl" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/40 rounded-bl" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/40 rounded-br" />
            </div>

            <div className="absolute bottom-3 inset-x-3 bg-black/60 backdrop-blur-md rounded-xl p-2.5 border border-white/10 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] text-white/70">
                <span className="flex items-center gap-1">
                  <Sliders size={12} />
                  Drag to test opacity
                </span>
                <span className="font-mono text-white/90 font-bold">{Math.round(demoOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.02"
                value={demoOpacity}
                onChange={(e) => setDemoOpacity(parseFloat(e.target.value))}
                className="w-full accent-white h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                aria-label="Demo opacity slider"
              />
            </div>
          </div>
        </div>

        {/* Featured Poses Quick Selection */}
        <section className="mt-12 w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white tracking-tight">Popular References</h2>
            <button
              onClick={onOpenGallery}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
            >
              <span>See all</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {featuredPoses.slice(0, 4).map((pose) => (
              <div
                key={pose.id}
                onClick={() => onSelectPose(pose)}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-white/[0.08] hover:border-white/25 transition-all cursor-pointer active:scale-95 shadow-md"
              >
                <img
                  src={pose.imageUrl}
                  alt={pose.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                  <span className="text-[11px] uppercase tracking-wider text-sky-400 font-semibold mb-0.5">
                    {pose.category}
                  </span>
                  <span className="text-xs font-bold text-white leading-tight line-clamp-1">
                    {pose.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Guarantees */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white/5 text-emerald-400 shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">100% On-Device Privacy</h3>
              <p className="text-[12px] text-white/50 mt-0.5">Camera feed and captures never touch any server or cloud storage.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white/5 text-sky-400 shrink-0">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Ghost Overlay Engine</h3>
              <p className="text-[12px] text-white/50 mt-0.5">Scale, drag, and pinch the reference over your live camera feed.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white/5 text-amber-300 shrink-0">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Pure Photo Capture</h3>
              <p className="text-[12px] text-white/50 mt-0.5">Final saved image records only your clean camera view, excluding all UI.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-white/[0.06] text-center text-xs text-white/40">
        <span>PoseCam &copy; 2026 · Pure Client-Side Photography Assistant</span>
      </footer>
    </div>
  );
};
