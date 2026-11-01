import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-500/90 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-semibold text-black shadow-xl animate-in fade-in slide-in-from-top-2">
      <WifiOff size={13} className="shrink-0 stroke-[2.5]" />
      <span>Offline Mode — All cached poses and camera work offline</span>
    </div>
  );
};
