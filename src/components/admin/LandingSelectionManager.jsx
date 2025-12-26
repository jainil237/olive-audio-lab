import React, { useEffect, useMemo, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext.jsx';
import { AppButton, SectionHeading, GlassCard } from '../ui/primitives.jsx';
import clsx from 'clsx';

const pillBase = 'px-4 py-2 rounded-full border transition-colors text-sm flex items-center gap-2';

const SelectionGroup = ({
  heading,
  eyebrow,
  items,
  selectedIds,
  onToggle,
  emptyLabel,
  hint,
}) => (
  <GlassCard className="bg-black/50 border-white/5">
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <SectionHeading align="left" eyebrow={eyebrow}>
          {heading}
        </SectionHeading>
        {hint && <p className="text-xs text-zinc-500 max-w-xl">{hint}</p>}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">{emptyLabel}</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {items.map(({ id, label, secondary }) => {
            const active = selectedIds.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onToggle(id)}
                className={clsx(
                  pillBase,
                  active
                    ? 'border-lime-400 bg-lime-500/20 text-white shadow-[0_0_20px_rgba(163,230,53,0.25)]'
                    : 'border-white/10 bg-black/40 text-zinc-300 hover:border-lime-300/60 hover:text-white'
                )}
              >
                <span>{label}</span>
                {secondary && (
                  <span className="text-xs text-zinc-500">{secondary}</span>
                )}
                {active && <Check size={14} className="text-lime-300" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  </GlassCard>
);

const LandingSelectionManager = () => {
  const {
    songs,
    artists,
    achievements,
    landingSelection,
    updateLandingSelection,
    loading,
    isAdmin,
  } = useCatalog();

  const [draft, setDraft] = useState(landingSelection);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setDraft(landingSelection);
  }, [landingSelection]);

  const toggleId = (key) => (id) => {
    setDraft((prev) => {
      const nextSet = new Set(prev[key]);
      if (nextSet.has(id)) {
        nextSet.delete(id);
      } else {
        nextSet.add(id);
      }
      return { ...prev, [key]: Array.from(nextSet) };
    });
  };

  const songOptions = useMemo(
    () =>
      songs.map((song) => ({
        id: String(song.id),
        label: song.title,
        secondary: song.artistName || song.artist,
      })),
    [songs]
  );

  const artistOptions = useMemo(
    () =>
      artists.map((artist) => ({
        id: String(artist.id),
        label: artist.name,
        secondary: artist.role,
      })),
    [artists]
  );

  const achievementOptions = useMemo(
    () =>
      achievements.map((achievement) => ({
        id: String(achievement.id),
        label: `${achievement.title}`,
        secondary: achievement.year,
      })),
    [achievements]
  );

  const handleSave = async () => {
    if (!isAdmin) return;
    setSaving(true);
    setSuccess(false);
    try {
      await updateLandingSelection(draft);
      setSuccess(true);
    } catch (err) {
      console.error('Failed to update landing selection', err);
      alert('Unable to update landing selections. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const dirty =
    JSON.stringify({
      songIds: draft.songIds,
      artistIds: draft.artistIds,
      achievementIds: draft.achievementIds,
    }) !==
    JSON.stringify({
      songIds: landingSelection.songIds,
      artistIds: landingSelection.artistIds,
      achievementIds: landingSelection.achievementIds,
    });

  return (
    <div className="space-y-8">
      <GlassCard className="bg-black/60 border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <p className="uppercase tracking-[0.3em] text-xs text-lime-300/80">Landing Experience</p>
            <h1 className="text-3xl font-semibold text-white flex items-center gap-3">
              Configure spotlight content <Sparkles size={20} className="text-lime-300" />
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl">
              Curate which songs, collaborators, and achievements feature on the public landing page.
              Changes are saved instantly for all visitors.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <div className="flex gap-3 text-xs text-zinc-500">
              <span>🎵 {draft.songIds.length} songs</span>
              <span>👥 {draft.artistIds.length} artists</span>
              <span>🏆 {draft.achievementIds.length} achievements</span>
            </div>
            <AppButton
              variant={dirty ? 'primary' : 'secondary'}
              onClick={handleSave}
              disabled={!dirty || saving || loading}
            >
              {saving ? 'Publishing…' : dirty ? 'Save changes' : success ? 'Saved' : 'Up-to-date'}
            </AppButton>
          </div>
        </div>
      </GlassCard>

      <SelectionGroup
        heading="Spotlight Songs"
        eyebrow="Catalogue"
        items={songOptions}
        selectedIds={draft.songIds}
        onToggle={toggleId('songIds')}
        emptyLabel="No songs available yet. Add songs first to curate this section."
        hint="Choose up to 3 tracks to highlight. Embedded players will be visible on the landing page."
      />

      <SelectionGroup
        heading="Featured Collaborators"
        eyebrow="Artists"
        items={artistOptions}
        selectedIds={draft.artistIds}
        onToggle={toggleId('artistIds')}
        emptyLabel="No artists available yet."
        hint="These collaborators will appear in the landing page grid."
      />

      <SelectionGroup
        heading="Achievements & Awards"
        eyebrow="Recognition"
        items={achievementOptions}
        selectedIds={draft.achievementIds}
        onToggle={toggleId('achievementIds')}
        emptyLabel="No achievements recorded yet."
        hint="Highlight key wins to display in the timeline."
      />
    </div>
  );
};

export default LandingSelectionManager;
