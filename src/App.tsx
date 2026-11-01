/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { PoseItem, OverlayState, AppTab, AppScreen, CapturedPhoto } from './types/pose';
import { INITIAL_POSES } from './data/poses';
import { MobileAppShell } from './components/MobileAppShell';
import { MobileTabBar } from './components/MobileTabBar';
import { CameraView } from './components/CameraView';
import { PoseLibraryView } from './components/PoseLibraryView';
import { UploadView } from './components/UploadView';
import { AlbumView } from './components/AlbumView';
import { PhotoResult } from './components/PhotoResult';
import { OfflineIndicator } from './components/OfflineIndicator';

const DEFAULT_OVERLAY_STATE: OverlayState = {
  opacity: 0.45,
  scale: 1.0,
  x: 0,
  y: 0,
  isLocked: false,
  isVisible: true,
  isMirrored: false,
  blendMode: 'normal',
  fitMode: 'contain',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('camera');
  const [screen, setScreen] = useState<AppScreen>('main');
  const [poses, setPoses] = useState<PoseItem[]>(INITIAL_POSES);
  const [activePose, setActivePose] = useState<PoseItem>(INITIAL_POSES[0]);
  const [overlayState, setOverlayState] = useState<OverlayState>(DEFAULT_OVERLAY_STATE);
  const [albumPhotos, setAlbumPhotos] = useState<CapturedPhoto[]>([]);
  const [activeResultPhoto, setActiveResultPhoto] = useState<CapturedPhoto | null>(null);

  // Partial update helper for overlay settings
  const handleUpdateOverlayState = useCallback((patch: Partial<OverlayState>) => {
    setOverlayState((prev) => ({ ...prev, ...patch }));
  }, []);

  // Instant pose selection & shoot
  const handleSelectAndShoot = useCallback((pose: PoseItem) => {
    setActivePose(pose);
    setActiveTab('camera');
  }, []);

  // When custom image is uploaded
  const handleCustomPoseCreated = useCallback((newPose: PoseItem) => {
    setPoses((prev) => [newPose, ...prev]);
    setActivePose(newPose);
    setActiveTab('camera');
  }, []);

  // When photo capture completes
  const handleCaptureComplete = useCallback((dataUrl: string, blob: Blob) => {
    const newCapturedPhoto: CapturedPhoto = {
      id: `photo_${Date.now()}`,
      dataUrl,
      blob,
      timestamp: Date.now(),
      pose: activePose,
    };

    setAlbumPhotos((prev) => [newCapturedPhoto, ...prev]);
    setActiveResultPhoto(newCapturedPhoto);
    setScreen('result');
  }, [activePose]);

  // Retake photo: return to camera maintaining exact pose and overlay adjustments
  const handleRetake = useCallback(() => {
    setScreen('main');
    setActiveTab('camera');
  }, []);

  // Open photo from album
  const handleOpenAlbumPhoto = useCallback((photo: CapturedPhoto) => {
    setActiveResultPhoto(photo);
    setScreen('result');
  }, []);

  // Delete photo from album
  const handleDeleteAlbumPhoto = useCallback((id: string) => {
    setAlbumPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Choose another pose from result view
  const handleChooseAnotherPose = useCallback(() => {
    setScreen('main');
    setActiveTab('poses');
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      poses.forEach((p) => {
        if (p.isCustomUpload && p.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(p.imageUrl);
        }
      });
    };
  }, [poses]);

  return (
    <MobileAppShell>
      <OfflineIndicator />
      {screen === 'result' && activeResultPhoto ? (
        <PhotoResult
          capturedDataUrl={activeResultPhoto.dataUrl}
          capturedBlob={activeResultPhoto.blob}
          pose={activeResultPhoto.pose}
          onRetake={handleRetake}
          onChooseAnotherPose={handleChooseAnotherPose}
          onBackToHome={() => {
            setScreen('main');
            setActiveTab('camera');
          }}
        />
      ) : (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Main Tab Views */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {activeTab === 'camera' && (
              <CameraView
                activePose={activePose}
                allPoses={poses}
                overlayState={overlayState}
                onSelectPose={setActivePose}
                onUpdateOverlayState={handleUpdateOverlayState}
                onCaptureComplete={handleCaptureComplete}
                onOpenUpload={() => setActiveTab('upload')}
                onOpenPoseLibrary={() => setActiveTab('poses')}
              />
            )}

            {activeTab === 'poses' && (
              <PoseLibraryView
                poses={poses}
                activePose={activePose}
                overlayState={overlayState}
                onSelectAndShoot={handleSelectAndShoot}
                onUpdateOverlayState={handleUpdateOverlayState}
              />
            )}

            {activeTab === 'upload' && (
              <UploadView
                onCustomPoseCreated={handleCustomPoseCreated}
                overlayState={overlayState}
                onUpdateOverlayState={handleUpdateOverlayState}
              />
            )}

            {activeTab === 'album' && (
              <AlbumView
                photos={albumPhotos}
                onOpenPhoto={handleOpenAlbumPhoto}
                onDeletePhoto={handleDeleteAlbumPhoto}
                onGoToCamera={() => setActiveTab('camera')}
              />
            )}
          </div>

          {/* Native Mobile Bottom Tab Bar */}
          <MobileTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            albumCount={albumPhotos.length}
          />
        </div>
      )}
    </MobileAppShell>
  );
}
