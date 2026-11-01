import React from 'react';

interface MobileAppShellProps {
  children: React.ReactNode;
}

export const MobileAppShell: React.FC<MobileAppShellProps> = ({ children }) => {
  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] bg-black text-white flex flex-col justify-center items-center overflow-hidden select-none">
      {/* Mobile-first fluid app canvas: 100% width on mobile, centered max-w-md on desktop */}
      <div className="w-full h-full max-w-md flex flex-col overflow-hidden relative bg-black shadow-2xl">
        {children}
      </div>
    </div>
  );
};
