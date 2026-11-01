import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Suppress if already running in standalone PWA mode
  if (isInstalled) {
    return null;
  }

  // Handle click for Android/Desktop vs iOS Safari
  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {variant === 'compact' ? (
        <button
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer shadow-sm ${className}`}
          title="Install PoseCam as a Progressive Web App"
        >
          <Download size={12} className="stroke-[2.5]" />
          <span>Install</span>
        </button>
      ) : (
        <button
          onClick={handleClick}
          className={`w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-98 transition-all cursor-pointer ${className}`}
        >
          <Download size={14} className="stroke-[2.5]" />
          <span>Install PoseCam App on Home Screen</span>
        </button>
      )}

      {/* Guided iOS Safari / Browser Installation Modal */}
      {showIOSModal && (
        <div
          onClick={() => setShowIOSModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-white/15 p-5 text-white shadow-2xl flex flex-col gap-3.5 pb-safe"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <Smartphone size={17} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white leading-tight">Install PoseCam</h3>
                  <span className="text-[10px] text-white/50">Add to your Home Screen</span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-90"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Install PoseCam for a fullscreen camera experience, offline access, and fast launch from your home screen:
            </p>

            <div className="space-y-2.5 bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.06] text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sky-400 font-bold text-[11px]">
                  1
                </div>
                <div className="text-white/80">
                  Tap the <strong className="text-white inline-flex items-center gap-0.5"><Share size={12} /> Share</strong> button in Safari toolbar.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sky-400 font-bold text-[11px]">
                  2
                </div>
                <div className="text-white/80">
                  Scroll down and tap <strong className="text-white inline-flex items-center gap-0.5"><PlusSquare size={12} /> Add to Home Screen</strong>.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sky-400 font-bold text-[11px]">
                  3
                </div>
                <div className="text-white/80">
                  Tap <strong className="text-white">Add</strong> in the top right to complete installation.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-1 w-full h-11 rounded-xl bg-white text-black font-semibold text-xs active:scale-95 transition-transform"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
