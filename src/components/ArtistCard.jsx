import React from 'react';
import { Pill } from './ui/primitives.jsx';

const ArtistCard = ({ artist, onClick }) => (
  <button
    type="button"
    onClick={() => onClick?.(artist)}
    className="w-full text-left bg-zinc-900/50 hover:bg-zinc-900 transition-colors border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4"
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
);

export default ArtistCard;
