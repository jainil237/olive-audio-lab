import React, { useState, useRef, useEffect } from 'react';
import { Pill } from './ui/primitives.jsx';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

const ArtistCard = ({ artist, onClick, isAdmin, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

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
    <div className="relative group">
      <button
        type="button"
        onClick={() => onClick?.(artist)}
        className="w-full text-left bg-zinc-900/50 hover:bg-zinc-900 transition-colors border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 relative z-10"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lime-400/60 to-emerald-500/60 flex items-center justify-center text-white font-semibold">
            {artist.name.charAt(0)}
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">{artist.name}</h4>
            <p className="text-sm text-zinc-400">{artist.role}</p>
          </div>
        </div>
        {artist.genres?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {artist.genres.map((genre) => (
              <Pill key={genre}>{genre}</Pill>
            ))}
          </div>
        )}
        {artist.honors?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Honors</p>
            <ul className="space-y-1 text-sm text-zinc-300">
              {artist.honors.map((honor) => (
                <li key={honor}>{honor}</li>
              ))}
            </ul>
          </div>
        )}
      </button>

      {/* Admin Menu */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-20" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <MoreVertical size={20} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-32 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl overflow-hidden flex flex-col">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit?.(artist); }}
                className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white text-left"
              >
                <Edit size={12} /> Edit
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete?.(artist.id); }}
                className="flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-zinc-800 hover:text-red-300 text-left"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtistCard;