
import React, { useState, useMemo, useCallback } from 'react';
import { Home, Music, Mic2, Award, Check, Quote, Star } from 'lucide-react';
import { SectionHeading } from '../components/ui/primitives.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';

// --- Home Page Selector Panel ---
const HomePageSelector = () => {
  const {
    songs, artists, achievements, testimonials, reviews,
    landingSelection, updateLandingSelection,
  } = useCatalog();

  const [saving, setSaving] = useState(false);

  const toggleItem = useCallback(async (category, id) => {
    const key = `${category}Ids`;
    const current = landingSelection[key] || [];
    const sid = String(id);
    const next = current.includes(sid)
      ? current.filter(i => i !== sid)
      : [...current, sid];

    setSaving(true);
    try {
      await updateLandingSelection({ ...landingSelection, [key]: next });
    } catch (err) {
      console.error('Failed to update landing selection', err);
    } finally {
      setSaving(false);
    }
  }, [landingSelection, updateLandingSelection]);

  const isSelected = useCallback((category, id) => {
    const key = `${category}Ids`;
    return (landingSelection[key] || []).includes(String(id));
  }, [landingSelection]);

  const selectedCounts = useMemo(() => ({
    song: (landingSelection.songIds || []).length,
    artist: (landingSelection.artistIds || []).length,
    achievement: (landingSelection.achievementIds || []).length,
    testimonial: (landingSelection.testimonialIds || []).length,
    review: (landingSelection.reviewIds || []).length,
  }), [landingSelection]);

  const CheckboxItem = ({ selected, onClick, children }) => (
    <button
      onClick={onClick}
      disabled={saving}
      className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border text-left transition-all ${
        selected
          ? 'border-lime-400/50 bg-lime-500/10 text-white'
          : 'border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
      } disabled:opacity-50`}
    >
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
        selected ? 'border-lime-400 bg-lime-500' : 'border-zinc-600 bg-transparent'
      }`}>
        {selected && <Check size={12} className="text-black" />}
      </div>
      {children}
    </button>
  );

  return (
    <div className="space-y-10">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3">
        {[
          { icon: Music, count: selectedCounts.song, label: 'songs' },
          { icon: Mic2, count: selectedCounts.artist, label: 'artists' },
          { icon: Award, count: selectedCounts.achievement, label: 'achievements' },
          { icon: Quote, count: selectedCounts.testimonial, label: 'stories' },
          { icon: Star, count: selectedCounts.review, label: 'reviews' },
        ].map(({ icon: Icon, count, label }) => (
          <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-sm">
            <Icon size={14} className="text-lime-400" />
            <span className="text-zinc-400">{count} {label}</span>
          </div>
        ))}
      </div>

      {/* Songs Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Music size={18} className="text-lime-400" />
          <h3 className="text-lg font-semibold text-white">Songs & Albums</h3>
          <span className="text-xs text-zinc-500">Select tracks to feature on the home page</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {songs.map(song => (
            <CheckboxItem key={song.id} selected={isSelected('song', song.id)} onClick={() => toggleItem('song', song.id)}>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{song.title}</p>
                <p className="text-xs text-zinc-500 truncate">{song.artistName || song.artist} • {song.type}</p>
              </div>
            </CheckboxItem>
          ))}
        </div>
      </div>

      {/* Artists Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Mic2 size={18} className="text-lime-400" />
          <h3 className="text-lg font-semibold text-white">Artists & Collaborators</h3>
          <span className="text-xs text-zinc-500">Select artists to feature</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {artists.map(artist => (
            <CheckboxItem key={artist.id} selected={isSelected('artist', artist.id)} onClick={() => toggleItem('artist', artist.id)}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-400/60 to-emerald-500/60 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {artist.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{artist.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{artist.role}</p>
                </div>
              </div>
            </CheckboxItem>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Award size={18} className="text-lime-400" />
          <h3 className="text-lg font-semibold text-white">Achievements & Awards</h3>
          <span className="text-xs text-zinc-500">Select achievements to feature</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map(ach => (
            <CheckboxItem key={ach.id} selected={isSelected('achievement', ach.id)} onClick={() => toggleItem('achievement', ach.id)}>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{ach.title}</p>
                <p className="text-xs text-zinc-500 truncate">{ach.year}{ach.category ? ` • ${ach.category}` : ''}</p>
              </div>
            </CheckboxItem>
          ))}
        </div>
      </div>

      {/* Client Stories Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Quote size={18} className="text-lime-400" />
          <h3 className="text-lg font-semibold text-white">Client Stories</h3>
          <span className="text-xs text-zinc-500">Select stories to feature on the home page</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.length > 0 ? testimonials.map(t => (
            <CheckboxItem key={t.id} selected={isSelected('testimonial', t.id)} onClick={() => toggleItem('testimonial', t.id)}>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{t.name}</p>
                <p className="text-xs text-zinc-500 truncate">{t.role} • ⭐ {t.rating || 5}</p>
              </div>
            </CheckboxItem>
          )) : (
            <p className="text-zinc-500 text-sm col-span-full">No client stories available. Users can add them from the Reviews page.</p>
          )}
        </div>
      </div>

      {/* Industry Reviews Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Star size={18} className="text-lime-400" />
          <h3 className="text-lg font-semibold text-white">Industry Reviews</h3>
          <span className="text-xs text-zinc-500">Select reviews to feature on the home page</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.length > 0 ? reviews.map(r => (
            <CheckboxItem key={r.id} selected={isSelected('review', r.id)} onClick={() => toggleItem('review', r.id)}>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{r.source}</p>
                <p className="text-xs text-zinc-500 truncate">⭐ {r.rating || 5}</p>
              </div>
            </CheckboxItem>
          )) : (
            <p className="text-zinc-500 text-sm col-span-full">No industry reviews available. Users can add them from the Reviews page.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main ContentManager ---
const ContentManager = () => {
  const { isAdmin } = useCatalog();

  if (!isAdmin) {
    return <div className="min-h-screen pt-40 text-center text-zinc-500">Access Denied</div>;
  }

  return (
    <div className="min-h-screen text-white space-y-8 sm:space-y-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <SectionHeading align="left" eyebrow="Admin">Content Manager</SectionHeading>
      </div>
      <HomePageSelector />
    </div>
  );
};

export default ContentManager;
