import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SongCard from '../components/SongCard.jsx';
import SongStreamingDialog from '../components/SongStreamingDialog.jsx';
import { AppButton, GlassCard, SectionHeading } from '../components/ui/primitives.jsx';
import AdminGate from '../components/AdminGate.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const INITIAL_FORM = {
  title: '',
  artistId: '',
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
    clearSongFilter,
  } = useCatalog();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [streamSong, setStreamSong] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!formData.artistId && artists.length > 0) {
      setFormData((prev) => ({ ...prev, artistId: artists[0].id }));
    }
  }, [artists, formData.artistId]);

  useEffect(() => {
    if (!location.state?.fromArtist && songFilter) {
      clearSongFilter();
    }

    if (location.state?.fromArtist) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, songFilter, clearSongFilter, navigate, location.pathname]);

  const filteredSongs = useMemo(() => {
    if (songFilter?.artistId) {
      return songs.filter((song) => song.artistId === songFilter.artistId);
    }
    return songs;
  }, [songs, songFilter]);

  const activeArtist = useMemo(() => {
    if (songFilter?.artistId) {
      return artists.find((artist) => artist.id === songFilter.artistId);
    }
    return null;
  }, [artists, songFilter]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData((prev) => ({ ...INITIAL_FORM, artistId: artists[0]?.id || '' }));
    setEditingId(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title || !formData.artistId) {
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
      artistId: Number(formData.artistId),
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
      artistId: song.artistId || '',
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
        {activeArtist && (
          <GlassCard className="flex items-center justify-between gap-4 bg-zinc-900/70">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-lime-300/80">Filtered</p>
              <h3 className="text-2xl font-semibold">{activeArtist.name}</h3>
              <p className="text-sm text-zinc-400">Showing works produced with this collaborator.</p>
            </div>
            <AppButton variant="outline" onClick={clearSongFilter}>
              Clear filter
            </AppButton>
          </GlassCard>
        )}
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
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Artist</label>
              <select
                name="artistId"
                value={formData.artistId}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
                required
              >
                <option value="" disabled>
                  Select artist
                </option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
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
