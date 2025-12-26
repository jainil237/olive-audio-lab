import React from 'react';

const MusicVisualizer = ({ isPlaying }) => {
    return (
        <div className="flex items-end justify-center gap-[2px] h-12 w-full px-4">
            {Array.from({ length: 40 }).map((_, index) => (
                <div
                    key={index}
                    className={`w-1 rounded-t-full bg-gradient-to-t from-lime-500/80 via-lime-400/90 to-white transition-all duration-300 ease-in-out ${isPlaying ? 'animate-music-bar' : 'h-1 opacity-50'
                        }`}
                    style={{
                        animationDelay: `-${Math.random() * 1}s`,
                        animationDuration: `${0.4 + Math.random() * 0.6}s`
                    }}
                />
            ))}
        </div>
    );
};

export default MusicVisualizer;
