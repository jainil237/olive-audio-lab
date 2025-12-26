import React, { useState, useEffect, useRef, useMemo } from 'react';
import clsx from 'clsx';
import { Info, MoreVertical, Edit, Trash2 } from 'lucide-react';
import SongEmbedPlayer from './SongEmbedPlayer.jsx';
import MusicVisualizer from './MusicVisualizer.jsx';

const providerLabelMap = {
  apple: 'Apple Music',
  soundcloud: 'SoundCloud',
  primary: 'Embedded Player',
  legacy: 'Embedded Player',
};

const coverOverlayMap = {
  blue: 'bg-blue-500/15',
  rose: 'bg-rose-500/15',
  purple: 'bg-purple-500/15',
  amber: 'bg-amber-500/15',
  emerald: 'bg-emerald-500/15',
  slate: 'bg-slate-500/15',
};

const FrequencyBars = () => (
  <div className="flex items-end justify-center gap-1">
    {Array.from({ length: 9 }).map((_, index) => (
      <div
        key={index}
        className="w-1.5 rounded-t-full bg-gradient-to-t from-lime-500/10 via-lime-400/40 to-lime-300/90 animate-pulse"
        style={{
          height: `${18 + (index % 4) * 10}px`,
          animationDelay: `${index * 90}ms`,
        }}
      />
    ))}
  </div>
);

const EmbedPlaceholder = ({ text = "Awaiting Embed" }) => (
  <div className="relative flex h-full min-h-[220px] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-900 via-black to-zinc-950">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(163,230,53,0.18),_transparent_65%)]" />
    <FrequencyBars />
    <p className="mt-6 text-xs uppercase tracking-[0.35em] text-lime-300/70">{text}</p>
  </div>
);

const SongCard = ({
  song,
  onPlay,
  // onAdd, 
  isActive = false,
  isPlaying = false,
  onOpenStreams,
  isAdmin,
  onEdit,
  onDelete,
  showEmbedPlayer = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const embedEntries = useMemo(() => {
    const entries = [];
    const seenHtml = new Set();
    const pushEntry = (key, html) => {
      if (typeof html !== 'string') return;
      const trimmed = html.trim();
      if (!trimmed || seenHtml.has(trimmed)) return;
      seenHtml.add(trimmed);
      const label = providerLabelMap[key] || key.replace(/(^|_)(\w)/g, (_, __, ch) => ` ${ch.toUpperCase()}`).trim();
      entries.push({ key, label, html: trimmed });
    };

    const embeds = song.embeds || {};
    ['apple', 'soundcloud'].forEach((key) => pushEntry(key, embeds[key]));
    Object.entries(embeds).forEach(([key, value]) => {
      if (key === 'apple' || key === 'soundcloud') return;
      pushEntry(key, value);
    });
    pushEntry('legacy', song.embed);
    return entries;
  }, [song]);


  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (embedEntries.length > 0 && !activeTab) {
      const soundcloud = embedEntries.find(e => e.key === 'soundcloud');
      setActiveTab(soundcloud ? soundcloud.key : embedEntries[0].key);
    }
  }, [embedEntries, activeTab]);

  const hasEmbeds = embedEntries.length > 0;
  const shouldShowEmbeds = showEmbedPlayer && hasEmbeds;

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
    <div className={clsx(
      "group relative overflow-hidden rounded-3xl border border-zinc-800/60 transition-all duration-500 text-white",
      "hover:border-lime-400/50 hover:shadow-[0_20px_50px_-25px_rgba(163,230,53,0.4)]",
      coverOverlayMap[song.cover] || 'bg-zinc-900'
    )}>
      <div className="relative overflow-hidden pt-14 bg-black/40">

        {shouldShowEmbeds ? (
          <div className="flex flex-col">
            {embedEntries.length > 1 && (
              <div className="flex items-center gap-1 px-4 mb-2 overflow-x-auto no-scrollbar">
                {embedEntries.map((embed) => (
                  <button
                    key={embed.key}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab(embed.key);
                    }}
                    className={clsx(
                      "px-3 py-1.5 text-xs font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap",
                      activeTab === embed.key
                        ? "border-lime-400 text-lime-400 bg-white/5"
                        : "border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {embed.label}
                  </button>
                ))}
              </div>
            )}

            {embedEntries.map((embed) => (
              <div key={embed.key} className={clsx(activeTab === embed.key ? "block" : "hidden")}>
                <SongEmbedPlayer
                  embedHtml={embed.html}
                  minHeight={220}
                  className="rounded-none md:rounded-t-3xl border-t border-white/10"
                  placeholder={<EmbedPlaceholder text={embed.key === 'legacy' || embed.key === 'primary' ? 'Loading Player' : `Loading ${embed.label}`} />}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmbedPlaceholder text="No Embed Available" />
        )}

        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          {onOpenStreams && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenStreams(song); }}
              className="px-4 py-1.5 text-xs font-semibold tracking-wide rounded-full border border-white/20 bg-black/50 backdrop-blur-sm text-white transition-colors hover:text-lime-200 hover:border-lime-300/70"
            >
              Listen Full Track
            </button>
          )}

          {isAdmin && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-1.5 rounded-full bg-black/40 border border-white/20 text-white hover:bg-black/70 hover:text-lime-300 transition-colors"
              >
                <MoreVertical size={16} />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-36 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl overflow-hidden flex flex-col">
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

        <div className="absolute top-4 left-4">
          <div className="group/credits relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/55 backdrop-blur-md text-white transition-colors group-hover/credits:border-lime-300/70 group-hover/credits:text-lime-200">
              <Info size={14} />
            </div>
            <div className="pointer-events-none absolute left-0 top-10 w-56 rounded-2xl border border-white/15 bg-black/85 p-4 opacity-0 shadow-xl transition-opacity duration-200 group-hover/credits:opacity-100 z-10">
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

        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none fade-in-up">
          <div className="h-24 bg-gradient-to-t from-black via-black/60 to-transparent absolute bottom-0 left-0 right-0" />
          <div className="relative z-20 pb-2 opacity-80 mix-blend-screen">
            <MusicVisualizer isPlaying={isPlaying} />
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
    </div >
  );
};

export default SongCard;