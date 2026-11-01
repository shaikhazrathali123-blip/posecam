import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { PoseItem } from '../types/pose';

interface ImageUploaderProps {
  onImageSelected: (pose: PoseItem) => void;
  triggerButton?: React.ReactNode;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  triggerButton,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    setErrorMsg(null);

    // Validate mime type
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    // Validate size (max 25MB)
    const MAX_SIZE_MB = 25;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`Image exceeds maximum allowed size (${MAX_SIZE_MB}MB). Please select a smaller photo.`);
      return;
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      const customPose: PoseItem = {
        id: `custom_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, '').slice(0, 24) || 'Custom Reference',
        category: 'solo',
        imageUrl: objectUrl,
        thumbnailUrl: objectUrl,
        aspectRatio: '3:4',
        difficulty: 'Moderate',
        description: 'Custom photo imported from your device gallery.',
        tips: [
          'Align your shoulders and head with the reference outline',
          'Adjust opacity slider to check body angles',
          'Use pinch gesture or scale slider to match camera distance'
        ],
        isCustomUpload: true,
      };

      onImageSelected(customPose);
    } catch (err) {
      console.error('Failed to create object URL:', err);
      setErrorMsg('Failed to process image file. Please try another photo.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so re-selecting the same file fires change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/*"
        onChange={handleChange}
        className="hidden"
        aria-label="Upload custom pose reference"
      />

      {triggerButton ? (
        <div onClick={handleClick} className="cursor-pointer">
          {triggerButton}
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`group flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            isDragging
              ? 'border-sky-400 bg-sky-950/20'
              : 'border-white/15 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05]'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-slate-300 group-hover:text-white">
            <Upload size={20} />
          </div>
          <span className="text-sm font-semibold text-white mb-1">Upload Reference Photo</span>
          <span className="text-xs text-white/50 text-center">Tap to select from library or camera roll</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-2 p-2.5 rounded-lg bg-red-950/80 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
