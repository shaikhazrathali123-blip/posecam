import React from 'react';
import { Camera, Compass, PlusCircle, Image as ImageIcon } from 'lucide-react';
import { AppTab } from '../types/pose';

interface MobileTabBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  albumCount: number;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  onTabChange,
  albumCount,
}) => {
  const tabs: { id: AppTab; label: string; icon: React.ReactNode; isCenter?: boolean }[] = [
    {
      id: 'camera',
      label: 'Camera',
      icon: <Camera size={22} className={activeTab === 'camera' ? 'stroke-[2.4]' : 'stroke-[1.8]'} />,
      isCenter: true,
    },
    {
      id: 'poses',
      label: 'Poses',
      icon: <Compass size={22} className={activeTab === 'poses' ? 'stroke-[2.4]' : 'stroke-[1.8]'} />,
    },
    {
      id: 'upload',
      label: 'Import',
      icon: <PlusCircle size={22} className={activeTab === 'upload' ? 'stroke-[2.4]' : 'stroke-[1.8]'} />,
    },
    {
      id: 'album',
      label: 'Album',
      icon: (
        <div className="relative">
          <ImageIcon size={22} className={activeTab === 'album' ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
          {albumCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black font-bold text-[9px] flex items-center justify-center">
              {albumCount > 9 ? '9+' : albumCount}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <nav
      className="w-full bg-black/95 backdrop-blur-xl border-t border-white/[0.08] px-2 sm:px-4 pt-1.5 pb-safe select-none z-40 shrink-0"
      aria-label="Mobile Navigation Bar"
    >
      <div className="flex items-center justify-around max-w-md mx-auto h-12">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-0.5 transition-all active:scale-90 cursor-pointer min-h-[44px] ${
                isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <div
                className={`flex items-center justify-center w-9 sm:w-10 h-6 sm:h-6.5 rounded-full transition-all ${
                  isActive ? 'bg-white/15' : ''
                }`}
              >
                {tab.icon}
              </div>
              <span
                className={`text-[9px] sm:text-[10px] tracking-tight mt-0.5 transition-colors ${
                  isActive ? 'font-bold text-white' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
