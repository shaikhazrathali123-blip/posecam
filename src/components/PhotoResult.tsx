import React, { useState } from 'react';
import {
  Download,
  Share2,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Columns,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { PoseItem } from '../types/pose';

interface PhotoResultProps {
  capturedDataUrl: string;
  capturedBlob: Blob | null;
  pose: PoseItem;
  onRetake: () => void;
  onChooseAnotherPose: () => void;
  onBackToHome: () => void;
}

export const PhotoResult: React.FC<PhotoResultProps> = ({
  capturedDataUrl,
  capturedBlob,
  pose,
  onRetake,
  onChooseAnotherPose,
  onBackToHome,
}) => {
  const [isComparing, setIsComparing] = useState(false);
  const [compareSplit, setCompareSplit] = useState(50);
  const [isSaved, setIsSaved] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Download photo to user device
  const handleDownload = () => {
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `posecam-photo-${dateStr}-${Date.now().toString().slice(-4)}.jpg`;

      const link = document.createElement('a');
      link.href = capturedDataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Unable to initiate automatic download. Please long-press the photo to save.');
    }
  };

  // Web Share API
  const handleShare = async () => {
    setShareFeedback(null);

    if (navigator.share) {
      try {
        if (capturedBlob && navigator.canShare && navigator.canShare({ files: [new File([capturedBlob], 'posecam-photo.jpg', { type: 'image/jpeg' })] })) {
          const file = new File([capturedBlob], 'posecam-photo.jpg', { type: 'image/jpeg' });
          await navigator.share({
            title: 'My PoseCam Recreation',
            text: `Recreated the ${pose.name} pose using PoseCam!`,
            files: [file],
          });
          return;
        } else {
          await navigator.share({
            title: 'PoseCam Photo',
            text: `Recreated the ${pose.name} pose using PoseCam!`,
            url: window.location.href,
          });
          return;
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Share failed, falling back to download:', err);
          handleDownload();
          setShareFeedback('Native share unavailable. Downloaded photo instead.');
        }
        return;
      }
    }

    // Fallback if Web Share is not supported
    handleDownload();
    setShareFeedback('Photo downloaded to your device!');
    setTimeout(() => setShareFeedback(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-black text-white selection:bg-white/20 overflow-hidden">
      {/* Top Bar */}
      <header className="px-4 py-3 border-b border-white/[0.08] backdrop-blur-md sticky top-0 z-30 bg-black/85 flex items-center justify-between pt-safe">
        <button
          onClick={onRetake}
          className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center text-white/80 hover:text-white transition-colors active:scale-95 cursor-pointer"
          aria-label="Back to Camera"
        >
          <ArrowLeft size={17} />
        </button>

        <div className="text-center">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
            Captured Clean
          </span>
          <h1 className="text-sm font-bold text-white tracking-tight truncate max-w-[200px]">
            {pose.name}
          </h1>
        </div>

        {/* Compare with Reference Toggle */}
        <button
          onClick={() => setIsComparing(!isComparing)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
            isComparing
              ? 'bg-sky-400 text-black shadow-lg shadow-sky-400/20'
              : 'bg-white/[0.08] text-white/80 hover:bg-white/[0.15]'
          }`}
          title="Compare photo with reference"
        >
          <Columns size={13} />
          <span>{isComparing ? 'Exit Split' : 'Compare'}</span>
        </button>
      </header>

      {/* Main Image Viewport */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-3 flex flex-col justify-center items-center">
        <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-neutral-950 border border-white/10 shadow-2xl flex items-center justify-center">
          {isComparing ? (
            /* Split comparison view */
            <div className="relative w-full h-full select-none overflow-hidden">
              {/* Reference pose (Background layer) */}
              <img
                src={pose.imageUrl}
                alt="Original Reference"
                className="absolute inset-0 w-full h-full object-contain bg-neutral-900"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-mono text-white/70 border border-white/10">
                Original Pose
              </span>

              {/* User captured photo (Foreground clipped layer) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${compareSplit}%` }}
              >
                <img
                  src={capturedDataUrl}
                  alt="Your Shot"
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-950/80 text-[10px] font-mono text-emerald-300 border border-emerald-500/20">
                  Your Shot
                </span>
                <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              </div>

              {/* Split Slider Handle Bar */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-2xl pointer-events-none"
                style={{ left: `${compareSplit}%` }}
              >
                <Columns size={14} />
              </div>

              {/* Range Input for Split */}
              <input
                type="range"
                min="0"
                max="100"
                value={compareSplit}
                onChange={(e) => setCompareSplit(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                aria-label="Comparison slider"
              />
            </div>
          ) : (
            /* Clean captured photo */
            <img
              src={capturedDataUrl}
              alt="Captured Recreation"
              className="w-full h-full object-contain"
            />
          )}

          {isSaved && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-bold flex items-center gap-1.5 shadow-xl animate-in fade-in zoom-in">
              <Check size={14} className="stroke-[3]" />
              <span>Saved to Device</span>
            </div>
          )}
        </div>

        {shareFeedback && (
          <p className="mt-2 text-xs text-sky-300 text-center animate-in fade-in">
            {shareFeedback}
          </p>
        )}
      </main>

      {/* Sticky Bottom Control Bar */}
      <footer className="p-3.5 sm:p-5 border-t border-white/[0.08] bg-black/90 backdrop-blur-md sticky bottom-0 z-20 pb-safe">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          {/* Primary Action: Save & Share */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <button
              onClick={handleDownload}
              className="h-11 sm:h-12 rounded-2xl bg-white text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-white/10 hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Download size={16} className="stroke-[2.2]" />
              <span>Save Photo</span>
            </button>

            <button
              onClick={handleShare}
              className="h-11 sm:h-12 rounded-2xl bg-white/[0.1] hover:bg-white/[0.16] border border-white/20 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>

          {/* Secondary Actions: Retake & New Pose */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <button
              onClick={onRetake}
              className="h-9.5 sm:h-10 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white/80 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Retake Shot</span>
            </button>

            <button
              onClick={onChooseAnotherPose}
              className="h-9.5 sm:h-10 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white/80 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-colors cursor-pointer"
            >
              <ImageIcon size={13} />
              <span>New Pose</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
