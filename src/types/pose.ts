export type PoseCategory = 'all' | 'solo' | 'couple' | 'travel' | 'fashion' | 'sitting' | 'mirror';

export interface PoseItem {
  id: string;
  name: string;
  category: 'solo' | 'couple' | 'travel' | 'fashion' | 'sitting' | 'mirror';
  imageUrl: string;
  thumbnailUrl?: string;
  aspectRatio: '3:4' | '1:1' | '9:16' | '4:3';
  difficulty: 'Easy' | 'Moderate' | 'Editorial';
  tips: string[];
  description: string;
  isCustomUpload?: boolean;
}

export interface OverlayState {
  opacity: number;       // 0.05 to 1.0 (default 0.45)
  scale: number;         // 0.4 to 2.5 (default 1.0)
  x: number;             // X offset in pixels
  y: number;             // Y offset in pixels
  isLocked: boolean;     // Lock dragging/scaling
  isVisible: boolean;    // Toggle visibility
  isMirrored: boolean;   // Flip horizontally
  blendMode: 'normal' | 'difference'; // Pro alignment blend mode
  fitMode: 'contain' | 'cover' | 'free'; // 'contain' = fit to screen, 'cover' = fill screen, 'free' = custom manual drag/pinch
}

export type AppTab = 'camera' | 'poses' | 'upload' | 'album';

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  blob: Blob | null;
  timestamp: number;
  pose: PoseItem;
}

export type AppScreen = 'main' | 'result';
