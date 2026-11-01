import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Upload, Sparkles, Filter, X } from 'lucide-react';
import { PoseItem, PoseCategory } from '../types/pose';
import { ImageUploader } from './ImageUploader';

interface PoseGalleryProps {
  poses: PoseItem[];
  onSelectPose: (pose: PoseItem) => void;
  onBack: () => void;
  onUploadCustom: (pose: PoseItem) => void;
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

export const PoseGallery: React.FC<PoseGalleryProps> = ({
  poses,
  onSelectPose,
  onBack,
  onUploadCustom,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PoseCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white/20">
      {/* Top Navigation Bar */}
      <header className="px-5 py-4 border-b border-white/[0.08] backdrop-blur-md sticky top-0 z-30 bg-black/85 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center text-white/80 hover:text-white transition-colors active:scale-95 cursor-pointer"
            aria-label="Back to Home"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">Choose your pose</h1>
            <p className="text-[11px] text-white/50 mt-0.5">Select a reference or upload custom</p>
          </div>
        </div>

        <ImageUploader
          onImageSelected={onUploadCustom}
          triggerButton={
            <button
              type="button"
              className="px-3 py-1.5 rounded-full bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-100 transition-transform active:scale-95 shadow-md shadow-white/5"
            >
              <Upload size={13} className="stroke-[2.5]" />
              <span className="hidden sm:inline">Upload</span>
            </button>
          }
        />
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search poses (e.g. coffee, trench, stairs)..."
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/[0.06] border border-white/[0.08] focus:border-white/30 focus:outline-none text-sm text-white placeholder:text-white/30 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Horizontally Scrollable Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none select-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-md shadow-white/10'
                    : 'bg-white/[0.05] text-white/70 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 mt-1">
          {/* Custom Upload Tile */}
          <ImageUploader
            onImageSelected={onUploadCustom}
            triggerButton={
              <div className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/20 hover:border-sky-400/60 bg-white/[0.02] hover:bg-sky-950/15 transition-all flex flex-col items-center justify-center p-4 text-center group cursor-pointer h-full">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2.5 text-white/60 group-hover:text-sky-300 group-hover:scale-110 transition-transform">
                  <Upload size={20} />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-sky-200">Upload Photo</span>
                <span className="text-[10px] text-white/40 mt-1">From camera roll or files</span>
              </div>
            }
          />

          {/* Pose Cards */}
          {filteredPoses.map((pose) => (
            <div
              key={pose.id}
              onClick={() => onSelectPose(pose)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-white/[0.08] hover:border-white/30 transition-all cursor-pointer shadow-lg active:scale-[0.98]"
            >
              <img
                src={pose.thumbnailUrl || pose.imageUrl}
                alt={pose.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent flex flex-col justify-between p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-white/70 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                    {pose.category}
                  </span>
                  {pose.difficulty === 'Editorial' && (
                    <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 backdrop-blur-md px-1.5 py-0.5 rounded border border-amber-400/20">
                      Editorial
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                    {pose.name}
                  </h3>
                  <p className="text-[10px] text-white/60 mt-0.5 line-clamp-1">
                    {pose.tips[0]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPoses.length === 0 && (
          <div className="py-16 text-center flex flex-col items-center">
            <Filter size={32} className="text-white/20 mb-3" />
            <h3 className="text-sm font-bold text-white">No poses found</h3>
            <p className="text-xs text-white/50 mt-1 max-w-xs">
              Try adjusting your category filter or search keywords.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
