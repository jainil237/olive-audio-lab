import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import SongCard from '../components/SongCard.jsx';
import SongStreamingDialog from '../components/SongStreamingDialog.jsx';
import { AppButton, GlassCard, SectionHeading } from '../components/ui/primitives.jsx';
import AdminGate from '../components/AdminGate.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const INITIAL_FORM = {
  title: '',
  artistIds: [],
  price: '',
  duration: '',
  type: '',
  genres: '',
  spotify: '',
  apple: '',
  tidal: '',
  qobuz: '',
};

const SongsPage = () => {
  const {
    songs,
    artists,
    addSong,
    updateSong,
    deleteSong,
    songFilter,
    applySongFilter,
    clearSongFilter,
  } = useCatalog();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [streamSong, setStreamSong] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!formData.artistIds?.length && artists.length > 0) {
      setFormData((prev) => ({ ...prev, artistIds: [String(artists[0].id)] }));
    }
  }, [artists, formData.artistIds]);

  useEffect(() => {
    if (location.state?.fromArtist) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    const param = searchParams.get('artists');
    const fromParams = param
      ? param
          .split(',')
          .map((value) => Number(value.trim()))
          .filter((value) => Number.isInteger(value))
      : [];
    const current = songFilter?.artistIds ?? [];
    const paramKey = fromParams.join(',');
    const currentKey = current.join(',');

    if (paramKey !== currentKey) {
      applySongFilter(fromParams.length ? { artistIds: fromParams } : null);
    }
  }, [searchParams, applySongFilter, songFilter]);

  useEffect(() => {
    const ids = songFilter?.artistIds ?? [];
    const param = searchParams.get('artists');
    const paramIds = param
      ? param
          .split(',')
          .map((value) => Number(value.trim()))
          .filter((value) => Number.isInteger(value))
      : [];
    const idsKey = ids.join(',');
    const paramKey = paramIds.join(',');

    if (idsKey === paramKey) {
      return;
    }

    if (ids.length) {
      setSearchParams({ artists: ids.join(',') }, { replace: true });
    } else if (param) {
      setSearchParams({}, { replace: true });
    }
  }, [songFilter, searchParams, setSearchParams]);

  const filteredSongs = useMemo(() => {
    const activeIds = songFilter?.artistIds;
    if (activeIds?.length) {
      return songs.filter((song) => {
        if (!song.artistIds?.length) return false;
        return song.artistIds.some((id) => activeIds.includes(id));
      });
    }
    return songs;
  }, [songs, songFilter]);

  const activeArtists = useMemo(() => {
    const activeIds = songFilter?.artistIds;
    if (!activeIds?.length) return [];
    return artists.filter((artist) => activeIds.includes(artist.id));
  }, [artists, songFilter]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleArtistSelection = (artistId) => {
    setFormData((prev) => {
      const current = new Set(prev.artistIds);
      const key = String(artistId);
      if (current.has(key)) {
        current.delete(key);
      } else {
        current.add(key);
      }
      const next = Array.from(current);
      return { ...prev, artistIds: next };
    });
  };

  const toggleFilterArtist = useCallback(
    (artistId) => {
      const current = new Set(songFilter?.artistIds ?? []);
      if (current.has(artistId)) {
        current.delete(artistId);
      } else {
        current.add(artistId);
      }
      const next = Array.from(current);
      applySongFilter(next.length ? { artistIds: next } : null);
    },
    [songFilter, applySongFilter],
  );

  const resetForm = () => {
    setFormData((prev) => ({ ...INITIAL_FORM, artistIds: artists[0] ? [String(artists[0].id)] : [] }));
    setEditingId(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title || formData.artistIds.length === 0) {
      return;
    }

    const streaming = Object.entries({
      spotify: formData.spotify,
      apple: formData.apple,
      tidal: formData.tidal,
      qobuz: formData.qobuz,
    }).reduce((acc, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    }, {});

    const payload = {
      title: formData.title,
      artistIds: formData.artistIds.map((id) => Number(id)),
      price: Number(formData.price) || 0,
      duration: formData.duration,
      type: formData.type,
      genres: formData.genres
        .split(',')
        .map((genre) => genre.trim())
        .filter(Boolean),
      streaming,
    };

    if (editingId) {
      updateSong(editingId, payload);
    } else {
      addSong(payload);
    }

    resetForm();
  };

  const handleEdit = (song) => {
    setEditingId(song.id);
    setFormData({
      title: song.title,
      artistIds: song.artistIds?.map((id) => String(id)) || [],
      price: song.price?.toString() || '',
      duration: song.duration || '',
      type: song.type || '',
      genres: song.genres?.join(', ') || '',
      spotify: song.streaming?.spotify || '',
      apple: song.streaming?.apple || '',
      tidal: song.streaming?.tidal || '',
      qobuz: song.streaming?.qobuz || '',
    });
  };

  const handleDelete = (id) => {
    deleteSong(id);
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <div className="space-y-16 text-white">
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-6">
          <SectionHeading align="left" eyebrow="Catalogue">
            Songs & Albums
          </SectionHeading>
          <AppButton variant="ghost" onClick={() => navigate('/artists')}>
            Explore collaborators →
          </AppButton>
        </div>
        <p className="text-zinc-400 max-w-2xl">
          Licenses for production, mixing and mastering projects. Add tracks to your cart to secure your spot in the studio calendar.
        </p>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {artists.map((artist) => {
              const active = songFilter?.artistIds?.includes(artist.id);
              return (
                <button
                  key={artist.id}
                  type="button"
                  onClick={() => toggleFilterArtist(artist.id)}
                  className={
                    `px-4 py-2 rounded-full border transition-colors text-sm ` +
                    (active
                      ? 'border-lime-400 bg-lime-500/20 text-white'
                      : 'border-white/10 bg-black/40 text-zinc-300 hover:border-lime-300/60 hover:text-white')
                  }
                >
                  {artist.name}
                </button>
              );
            })}
            {songFilter?.artistIds?.length ? (
              <AppButton variant="ghost" onClick={clearSongFilter}>
                Clear filters
              </AppButton>
            ) : null}
          </div>
          {activeArtists.length > 0 && (
            <GlassCard className="bg-zinc-900/70">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm uppercase tracking-[0.3em] text-lime-300/80">Filtered</p>
                <div className="flex flex-wrap gap-2">
                  {activeArtists.map((artist) => (
                    <span
                      key={artist.id}
                      className="px-3 py-1 rounded-full bg-lime-500/15 text-lime-200 text-sm border border-lime-400/30"
                    >
                      {artist.name}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-zinc-400">Showing works that feature any of the selected collaborators.</p>
              </div>
            </GlassCard>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onAdd={addItem}
              onOpenStreams={setStreamSong}
            />
          ))}
        </div>
      </section>

      <AdminGate>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-zinc-400">Artists</label>
              <div className="flex flex-wrap gap-3">
                {artists.map((artist) => {
                  const active = formData.artistIds.includes(String(artist.id));
                  return (
                    <button
                      key={artist.id}
                      type="button"
                      onClick={() => toggleArtistSelection(artist.id)}
                      className={
                        `px-4 py-2 rounded-full border transition-colors text-sm ` +
                        (active
                          ? 'border-lime-400 bg-lime-500/20 text-white'
                          : 'border-white/10 bg-black/40 text-zinc-300 hover:border-lime-300/60 hover:text-white')
                      }
                    >
                      {artist.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Price (USD)</label>
              <input
                type="number"
                name="price"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
                placeholder="3:45"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Service Type</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
                placeholder="Production, Mixing..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Genres (comma separated)</label>
              <input
                type="text"
                name="genres"
                value={formData.genres}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {['spotify', 'apple', 'tidal', 'qobuz'].map((provider) => (
              <div key={provider} className="space-y-2">
                <label className="text-sm text-zinc-400 capitalize">{provider} link</label>
                <input
                  type="url"
                  name={provider}
                  value={formData[provider]}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
                  placeholder={`https://...`}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <AppButton type="submit" variant="primary">
              {editingId ? 'Update song' : 'Add song'}
            </AppButton>
            {editingId && (
              <AppButton variant="outline" type="button" onClick={resetForm}>
                Cancel editing
              </AppButton>
            )}
          </div>
        </form>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {songs.map((song) => (
            <GlassCard key={song.id} className="bg-black/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold">{song.title}</h4>
                  <p className="text-xs text-zinc-500">{song.artist}</p>
                </div>
                <span className="text-xs font-mono text-zinc-400">${song.price.toFixed(2)}</span>
              </div>
              <div className="flex gap-3">
                <AppButton variant="secondary" className="text-xs" onClick={() => handleEdit(song)}>
                  Edit
                </AppButton>
                <AppButton variant="ghost" className="text-xs text-red-400 hover:text-red-200" onClick={() => handleDelete(song.id)}>
                  Delete
                </AppButton>
              </div>
            </GlassCard>
          ))}
        </div>
      </AdminGate>

      <SongStreamingDialog open={!!streamSong} onClose={() => setStreamSong(null)} song={streamSong} />
    </div>
  );
};

export default SongsPage;
