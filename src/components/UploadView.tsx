import React, { useRef, useState } from 'react';
import { Upload, Camera, FlipHorizontal, Maximize2, Sparkles, Check, AlertCircle } from 'lucide-react';
import { PoseItem, OverlayState } from '../types/pose';

interface UploadViewProps {
  onCustomPoseCreated: (pose: PoseItem) => void;
  overlayState: OverlayState;
  onUpdateOverlayState: (patch: Partial<OverlayState>) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  onCustomPoseCreated,
  overlayState,
  onUpdateOverlayState,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [poseName, setPoseName] = useState('My Reference Pose');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Image exceeds 25MB limit.');
      return;
    }

    setErrorMsg(null);
    const objUrl = URL.createObjectURL(file);
    setSelectedFileUrl(objUrl);
    setPoseName(file.name.replace(/\.[^/.]+$/, '').slice(0, 24) || 'Custom Reference');
  };

  const handleLaunchCamera = () => {
    if (!selectedFileUrl) return;

    const newPose: PoseItem = {
      id: `custom_${Date.now()}`,
      name: poseName,
      category: 'solo',
      imageUrl: selectedFileUrl,
      thumbnailUrl: selectedFileUrl,
      aspectRatio: '3:4',
      difficulty: 'Moderate',
      description: 'Custom photo imported from your device library.',
      tips: [
        'Align your posture with the imported reference silhouette',
        'Use the opacity slider to verify angles',
        'Tap Fit Screen to match camera viewport',
      ],
      isCustomUpload: true,
    };

    onCustomPoseCreated(newPose);
  };

  return (
    <div className="flex-1 flex flex-col bg-black text-white p-4 overflow-y-auto pb-safe">
      <header className="mb-4 pt-safe">
        <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Upload size={18} className="text-sky-400" />
          <span>Import Reference</span>
        </h1>
        <p className="text-xs text-white/50 mt-0.5">
          Select any photo from your camera roll to use as an alignment ghost
        </p>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload photo"
      />

      {!selectedFileUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 min-h-[320px] rounded-3xl border-2 border-dashed border-white/20 hover:border-sky-400 bg-white/[0.02] hover:bg-sky-950/20 flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-white/70 group-hover:text-sky-300">
            <Upload size={28} />
          </div>
          <h2 className="text-sm font-bold text-white mb-1">Choose Photo from Library</h2>
          <p className="text-xs text-white/40 max-w-xs">
            Supports JPEG, PNG, HEIC, and WebP from your device
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full gap-4">
          {/* Preview Image */}
          <div className="relative aspect-[3/4] max-h-[46vh] rounded-3xl overflow-hidden bg-neutral-950 border border-white/10 flex items-center justify-center">
            <img
              src={selectedFileUrl}
              alt="Imported preview"
              className={`w-full h-full object-contain ${overlayState.isMirrored ? 'scale-x-[-1]' : ''}`}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white/80 hover:text-white"
            >
              Change
            </button>
          </div>

          {/* Controls: Fit Screen & Mirror */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateOverlayState({ isMirrored: !overlayState.isMirrored })}
              className={`h-11 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                overlayState.isMirrored
                  ? 'bg-sky-400 text-black border-sky-400'
                  : 'bg-white/10 text-white border-white/15'
              }`}
            >
              <FlipHorizontal size={15} />
              <span>{overlayState.isMirrored ? 'Mirrored' : 'Mirror Horizontal'}</span>
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
              className={`h-11 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                overlayState.fitMode === 'contain'
                  ? 'bg-sky-400 text-black border-sky-400'
                  : 'bg-white/10 text-white border-white/15'
              }`}
            >
              <Maximize2 size={15} />
              <span>{overlayState.fitMode === 'contain' ? 'Fit Screen: On' : 'Fill Screen'}</span>
            </button>
          </div>

          <button
            onClick={handleLaunchCamera}
            className="w-full h-13 rounded-2xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer"
          >
            <Camera size={18} className="stroke-[2.2]" />
            <span>Launch in Camera</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 p-3 rounded-xl bg-red-950/80 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
