import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Disc, Info, /* Pause, Play, */ MoreVertical, Edit, Trash2 } from 'lucide-react';

const coverOverlayMap = {
  blue: 'bg-blue-500/15',
  rose: 'bg-rose-500/15',
  purple: 'bg-purple-500/15',
  amber: 'bg-amber-500/15',
  emerald: 'bg-emerald-500/15',
  slate: 'bg-slate-500/15',
};

const SongCard = ({ 
  song, 
  onPlay, 
  // onAdd, 
  isActive = false, 
  isPlaying = false, 
  onOpenStreams,
  isAdmin,
  onEdit,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="group relative bg-zinc-900 rounded-2xl overflow-hidden hover:bg-zinc-850 transition-all duration-500 border border-zinc-800/60 hover:border-zinc-700">
      <div className="h-48 w-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden">
        <div
          className={clsx(
            'absolute inset-0 transition-colors duration-500 group-hover:opacity-100 opacity-80',
            coverOverlayMap[song.cover] || 'bg-lime-500/15'
          )}
        />
        <Disc className="text-zinc-700 w-20 h-20 group-hover:scale-110 transition-transform duration-700" />
        
        {/* Play Button Overlay - DISABLED */}
        {/* <button
          type="button"
          onClick={() => onPlay?.(song)}
          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-2xl transform group-hover:scale-100">
            {isActive && isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </div>
        </button> */}

        {/* Top Right Actions: Listen Button + Admin Menu */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          {/* Listen Full Track Button - DISABLED */}
          {/* {onOpenStreams && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenStreams(song); }}
              className="px-3 py-1 text-xs font-semibold tracking-wide rounded-full border border-white/20 bg-black/40 backdrop-blur-sm text-white transition-colors hover:text-lime-200 hover:border-lime-300/70"
            >
              Listen Full Track
            </button>
          )} */}

          {/* Admin 3-Dots Menu */}
          {isAdmin && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-1 rounded-full bg-black/40 border border-white/20 text-white hover:bg-black/60 hover:text-lime-300 transition-colors"
              >
                <MoreVertical size={16} />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-32 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl overflow-hidden flex flex-col">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit?.(song); }}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white text-left"
                  >
                    <Edit size={12} /> Edit
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete?.(song.id); }}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-zinc-800 hover:text-red-300 text-left"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info/Credits Icon */}
        <div className="absolute top-4 left-4">
          <div className="group/credits relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm text-white transition-colors group-hover/credits:border-lime-300/70 group-hover/credits:text-lime-200">
              <Info size={14} />
            </div>
            <div className="pointer-events-none absolute left-0 top-10 w-56 rounded-2xl border border-white/15 bg-black/80 p-4 opacity-0 shadow-xl transition-opacity duration-200 group-hover/credits:opacity-100 z-10">
              <p className="text-xs uppercase tracking-[0.3em] text-lime-300/80">Credits</p>
              <p className="mt-2 text-sm font-semibold text-white">{song.artist}</p>
              {song.artistIds?.length > 1 && (
                <p className="text-xs text-zinc-400">Collaborators: {song.artistIds.length}</p>
              )}
              {song.genres?.length > 0 && (
                <p className="mt-2 text-xs text-zinc-400">Genres: {song.genres.join(' • ')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{song.title}</h3>
            <p className="text-zinc-400 text-sm">{song.artist} • {song.duration}</p>
          </div>
          <span className="text-xs font-mono bg-zinc-900/70 text-zinc-300 px-2 py-1 rounded border border-zinc-800 uppercase tracking-widest">
            {song.type}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {/* <span className="text-lg font-semibold text-white">${song.price.toFixed(2)}</span> */}
            {song.genres?.length > 0 && (
              <span className="text-xs text-zinc-500 mt-1">{song.genres.join(' • ')}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongCard;