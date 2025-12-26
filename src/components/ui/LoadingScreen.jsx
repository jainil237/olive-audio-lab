import React from 'react';
import oliveLogo from '../../assets/OliveGreenLogo.png';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black">
            <div className="relative flex flex-col items-center">
                <img
                    src={oliveLogo}
                    alt="Loading..."
                    className="w-24 h-24 md:w-32 md:h-32 object-contain animate-spin-slow"
                />
                {/* Optional styling for 'spin-slow' if not in tailwind config, 
            otherwise fallback to 'animate-spin' which is standard tailwind */}
                <p className="mt-4 text-zinc-500 font-light text-sm tracking-widest uppercase animate-pulse">
                    Loading
                </p>
            </div>
            <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default LoadingScreen;
