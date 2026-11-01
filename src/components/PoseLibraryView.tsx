import React, { useState, useMemo } from 'react';
import { Search, X, Camera, Check, Compass, Sparkles, FlipHorizontal, Maximize2 } from 'lucide-react';
import { PoseItem, PoseCategory, OverlayState } from '../types/pose';
import { PWAInstallButton } from './PWAInstallButton';

interface PoseLibraryViewProps {
  poses: PoseItem[];
  activePose: PoseItem;
  overlayState: OverlayState;
  onSelectAndShoot: (pose: PoseItem) => void;
  onUpdateOverlayState: (patch: Partial<OverlayState>) => void;
}

const CATEGORIES: { id: PoseCategory; label: string }[] = [
  { id: 'all', label: 'All Poses' },
  { id: 'solo', label: 'Solo' },
  { id: 'couple', label: 'Couple' },
  { id: 'travel', label: 'Travel' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'sitting', label: 'Sitting' },
  { id: 'mirror', label: 'Mirror Selfies' },
];

export const PoseLibraryView: React.FC<PoseLibraryViewProps> = ({
  poses,
  activePose,
  overlayState,
  onSelectAndShoot,
  onUpdateOverlayState,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PoseCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPose, setPreviewPose] = useState<PoseItem | null>(null);

  const filteredPoses = useMemo(() => {
    return poses.filter((pose) => {
      const matchesCategory = selectedCategory === 'all' || pose.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        pose.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pose.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pose.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [poses, selectedCategory, searchQuery]);

  const handleShoot = (pose: PoseItem) => {
    setPreviewPose(null);
    onSelectAndShoot(pose);
  };

  return (
    <div className="flex-1 flex flex-col bg-black text-white overflow-hidden">
      {/* Top Mobile Bar */}
      <header className="px-4 pt-3 pb-2 border-b border-white/[0.08] bg-black/90 backdrop-blur-md shrink-0 pt-safe">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-sky-400" />
            <h1 className="text-base font-bold text-white tracking-tight">Pose Discovery</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/50 font-mono">{filteredPoses.length} Poses</span>
            <PWAInstallButton variant="compact" />
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-2">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search poses (e.g. coffee, mirror, trench)..."
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-white/[0.07] border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-md shadow-white/10'
                    : 'bg-white/[0.06] text-white/70 hover:text-white border border-white/[0.06]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Scrollable Poses Grid */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 scrollbar-none">
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 max-w-md mx-auto">
          {filteredPoses.map((pose) => {
            const isCurrentlyActive = activePose.id === pose.id;
            return (
              <div
                key={pose.id}
                onClick={() => setPreviewPose(pose)}
                className={`group relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border transition-all cursor-pointer shadow-lg active:scale-[0.98] ${
                  isCurrentlyActive
                    ? 'border-sky-400 ring-2 ring-sky-400/30'
                    : 'border-white/[0.08] hover:border-white/25'
                }`}
              >
                <img
                  src={pose.thumbnailUrl || pose.imageUrl}
                  alt={pose.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-between p-2 sm:p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-white/70 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                      {pose.category}
                    </span>
                    {isCurrentlyActive && (
                      <span className="text-[9px] font-bold text-sky-300 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-400/30">
                        Active
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white leading-tight line-clamp-1">
                      {pose.name}
                    </h3>
                    <p className="text-[10px] text-white/60 line-clamp-1 mt-0.5">
                      {pose.tips[0]}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShoot(pose);
                      }}
                      className="mt-2 w-full h-8 rounded-xl bg-white text-black font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      <Camera size={13} className="stroke-[2.2]" />
                      <span>Shoot</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* iOS-Style Pose Detail Bottom Sheet */}
      {previewPose && (
        <div
          onClick={() => setPreviewPose(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl bg-neutral-900 border-t border-white/15 p-4 sm:p-5 text-white shadow-2xl flex flex-col gap-3.5 max-h-[85dvh] overflow-y-auto pb-safe"
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1" />

            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                  {previewPose.category}
                </span>
                <h2 className="text-base font-bold text-white">{previewPose.name}</h2>
              </div>
              <button
                onClick={() => setPreviewPose(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                <X size={15} />
              </button>
            </div>

            {/* Photo preview in sheet */}
            <div className="relative aspect-[3/4] max-h-[40vh] w-full rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 flex items-center justify-center mx-auto">
              <img
                src={previewPose.imageUrl}
                alt={previewPose.name}
                className={`w-full h-full object-contain ${overlayState.isMirrored ? 'scale-x-[-1]' : ''}`}
              />
            </div>

            {/* Cues */}
            <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/[0.08]">
              <span className="text-xs font-bold text-white/90 block mb-2">
                Alignment Tips:
              </span>
              <ul className="space-y-1.5">
                {previewPose.tips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-white/80 flex items-start gap-2">
                    <Check size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => onUpdateOverlayState({ isMirrored: !overlayState.isMirrored })}
                className={`h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  overlayState.isMirrored
                    ? 'bg-sky-400 text-black border-sky-400'
                    : 'bg-white/10 text-white border-white/15'
                }`}
              >
                <FlipHorizontal size={14} />
                <span>{overlayState.isMirrored ? 'Mirrored' : 'Mirror Pose'}</span>
              </button>

              <button
                onClick={() =>
                  onUpdateOverlayState({
                    fitMode: overlayState.fitMode === 'contain' ? 'cover' : 'contain',
                    x: 0,
                    y: 0,
                    scale: 1.0,
                  })
                }
                className="h-11 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Maximize2 size={14} />
                <span>{overlayState.fitMode === 'contain' ? 'Fit Screen' : 'Fill'}</span>
              </button>
            </div>

            <button
              onClick={() => handleShoot(previewPose)}
              className="w-full h-12 rounded-2xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
            >
              <Camera size={17} className="stroke-[2.2]" />
              <span>Use This Pose & Shoot</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
