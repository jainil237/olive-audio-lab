import React from 'react';
import { Disc, Pause, Play, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';
import { AppButton } from './ui/primitives.jsx';

const coverOverlayMap = {
  blue: 'bg-blue-500/15',
  rose: 'bg-rose-500/15',
  purple: 'bg-purple-500/15',
  amber: 'bg-amber-500/15',
  emerald: 'bg-emerald-500/15',
  slate: 'bg-slate-500/15',
};

const SongCard = ({ song, onPlay, onAdd, isActive = false, isPlaying = false, onOpenStreams }) => (
  <div className="group relative bg-zinc-900 rounded-2xl overflow-hidden hover:bg-zinc-850 transition-all duration-500 border border-zinc-800/60 hover:border-zinc-700">
    <div className="h-48 w-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden">
      <div
        className={clsx(
          'absolute inset-0 transition-colors duration-500 group-hover:opacity-100 opacity-80',
          coverOverlayMap[song.cover] || 'bg-lime-500/15'
        )}
      />
      <Disc className="text-zinc-700 w-20 h-20 group-hover:scale-110 transition-transform duration-700" />
      <button
        type="button"
        onClick={() => onPlay?.(song)}
        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
      >
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-2xl transform group-hover:scale-100">
          {isActive && isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </div>
      </button>
      {onOpenStreams && (
        <button
          type="button"
          onClick={() => onOpenStreams(song)}
          className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold tracking-wide rounded-full border border-white/20 bg-black/40 backdrop-blur-sm text-white hover:bg-white/10"
        >
          Listen full track
        </button>
      )}
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
          <span className="text-lg font-semibold text-white">${song.price.toFixed(2)}</span>
          {song.genres?.length > 0 && (
            <span className="text-xs text-zinc-500 mt-1">{song.genres.join(' • ')}</span>
          )}
        </div>
        <AppButton
          variant="outline"
          className="text-xs py-2 px-4 h-auto"
          onClick={() => onAdd?.(song)}
        >
          <ShoppingBag size={16} /> Purchase
        </AppButton>
      </div>
    </div>
  </div>
);

export default SongCard;
