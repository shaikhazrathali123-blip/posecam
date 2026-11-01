import React from 'react';
import { Camera, Image as ImageIcon, Trash2, ArrowRight } from 'lucide-react';
import { CapturedPhoto } from '../types/pose';

interface AlbumViewProps {
  photos: CapturedPhoto[];
  onOpenPhoto: (photo: CapturedPhoto) => void;
  onDeletePhoto: (id: string) => void;
  onGoToCamera: () => void;
}

export const AlbumView: React.FC<AlbumViewProps> = ({
  photos,
  onOpenPhoto,
  onDeletePhoto,
  onGoToCamera,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-black text-white p-4 overflow-y-auto pb-safe">
      <header className="mb-4 pt-safe flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <ImageIcon size={18} className="text-emerald-400" />
            <span>Recents Album</span>
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'} captured on device
          </p>
        </div>

        {photos.length > 0 && (
          <button
            onClick={onGoToCamera}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-white flex items-center gap-1 active:scale-95"
          >
            <Camera size={13} />
            <span>Shoot More</span>
          </button>
        )}
      </header>

      {photos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 min-h-[300px]">
          <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-3 text-white/40">
            <Camera size={28} />
          </div>
          <h2 className="text-sm font-bold text-white mb-1">No Captures Yet</h2>
          <p className="text-xs text-white/40 max-w-xs mb-5">
            Select a reference pose, align with the ghost overlay, and take your first photo!
          </p>
          <button
            onClick={onGoToCamera}
            className="px-5 h-11 rounded-2xl bg-white text-black font-bold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-lg"
          >
            <Camera size={15} className="stroke-[2.2]" />
            <span>Open Camera</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto w-full">
          {photos.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenPhoto(item)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 hover:border-white/30 cursor-pointer shadow-md active:scale-95 transition-all"
            >
              <img
                src={item.dataUrl}
                alt="Captured recreation"
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-between p-2.5 opacity-90 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-white/80 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-xs">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePhoto(item.id);
                    }}
                    className="w-6 h-6 rounded-full bg-black/60 text-white/60 hover:text-red-400 flex items-center justify-center active:scale-90"
                    title="Delete photo"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-white block truncate">
                    {item.pose.name}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                    <span>Compare</span>
                    <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
