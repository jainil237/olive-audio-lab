import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Loader2, X, Filter } from 'lucide-react';
import SongCard from '../components/SongCard.jsx';
import SongStreamingDialog from '../components/SongStreamingDialog.jsx';
import { AppButton, SectionHeading } from '../components/ui/primitives.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';

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
  embed: '',
  embedApple: '',
  embedSoundcloud: '',
  showOnHome: false,
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
    isAdmin,
    loading: contextLoading
  } = useCatalog();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Local state for the modal/form
  const [streamSong, setStreamSong] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- CRITICAL FIX: ONE-WAY SYNC (URL -> CONTEXT) ---
  // We strictly listen to URL changes and update the Context.
  // We DO NOT listen to Context to update URL (that caused the loop).
  useEffect(() => {
    const param = searchParams.get('artists');

    // Convert URL string "1,2,3" into Array ["1","2","3"]
    const urlArtistIds = param ? param.split(',').map(s => s.trim()).filter(Boolean) : [];

    const currentContextIds = songFilter?.artistIds ?? [];

    // Compare arrays to avoid infinite re-renders
    const urlKey = urlArtistIds.sort().join(',');
    const contextKey = currentContextIds.sort().join(',');

    if (urlKey !== contextKey) {
      // If URL is empty, clear context. If URL has data, update context.
      if (urlArtistIds.length === 0) {
        clearSongFilter();
      } else {
        applySongFilter({ artistIds: urlArtistIds });
      }
    }
  }, [searchParams, songFilter, applySongFilter, clearSongFilter]);

  // --- HANDLERS (Update URL Directly) ---

  const handleClearFilters = () => {
    // Just clear URL. The useEffect above will catch this and clear the Context automatically.
    setSearchParams({}, { replace: true });
  };

  const toggleFilterArtist = useCallback((artistId) => {
    const sid = String(artistId);

    // 1. Get current IDs from URL (Source of Truth)
    const currentParam = searchParams.get('artists');
    const currentIds = currentParam ? currentParam.split(',').filter(Boolean) : [];
    const idSet = new Set(currentIds);

    // 2. Toggle logic
    if (idSet.has(sid)) {
      idSet.delete(sid);
    } else {
      idSet.add(sid);
    }

    // 3. Update URL
    const nextIds = Array.from(idSet);
    if (nextIds.length === 0) {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ artists: nextIds.join(',') }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // --- FILTER LOGIC (Derived from Context) ---
  const filteredSongs = useMemo(() => {
    const activeIds = songFilter?.artistIds;
    if (activeIds?.length) {
      return songs.filter((song) => {
        if (!song.artistIds?.length) return false;
        return song.artistIds.some((id) => activeIds.includes(String(id)));
      });
    }
    return songs;
  }, [songs, songFilter]);

  // ... Form Handlers ...
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleArtistSelection = (artistId) => {
    setFormData((prev) => {
      const current = new Set(prev.artistIds);
      const key = String(artistId);
      if (current.has(key)) current.delete(key);
      else current.add(key);
      return { ...prev, artistIds: Array.from(current) };
    });
  };

  const openAddModal = () => {
    setFormData({ ...INITIAL_FORM, artistIds: artists[0] ? [String(artists[0].id)] : [] });
    setEditingId(null);
    setIsFormOpen(true);
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
      embed: song.embed || '',
      embedApple: song.embeds?.apple || '',
      embedSoundcloud: song.embeds?.soundcloud || '',
      showOnHome: song.showOnHome || false,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this song?")) {
      await deleteSong(id);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.title || formData.artistIds.length === 0) return;

    setIsSubmitting(true);
    try {
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
        artistIds: formData.artistIds,
        price: Number(formData.price) || 0,
        duration: formData.duration,
        type: formData.type,
        genres: formData.genres.split(',').map((genre) => genre.trim()).filter(Boolean),
        streaming,
        streaming,
        embed: formData.embed.trim(),
        embeds: {
          apple: formData.embedApple.trim(),
          soundcloud: formData.embedSoundcloud.trim(),
        },
        showOnHome: formData.showOnHome,
      };

      if (editingId) {
        await updateSong(editingId, payload);
      } else {
        await addSong(payload);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to save song", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 text-white min-h-screen">
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-6">
          <SectionHeading align="left" eyebrow="Catalogue">Songs & Albums</SectionHeading>
          <AppButton variant="ghost" onClick={() => navigate('/artists')}>Explore collaborators →</AppButton>
        </div>

        <div className="flex items-start justify-between gap-4">
          <p className="text-zinc-400 max-w-2xl">
            Licenses for production, mixing and mastering projects.
          </p>
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-lime-500/20 text-lime-400 hover:bg-lime-500/30 rounded-full text-sm font-semibold transition-colors border border-lime-500/30"
            >
              <Plus size={16} /> Add Song
            </button>
          )}
        </div>

        {/* --- FILTER BAR --- */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-zinc-500 text-sm mr-2">
              <Filter size={14} />
              <span>Filter by Artist:</span>
            </div>

            {/* Clear Filter Button */}
            {songFilter?.artistIds?.length > 0 && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
              >
                <X size={14} /> Clear
              </button>
            )}

            {artists.map((artist) => {
              // Check active state against URL params OR Context (Context is safer here as it lags slightly less visually)
              const active = songFilter?.artistIds?.includes(String(artist.id));
              return (
                <button
                  key={artist.id}
                  type="button"
                  onClick={() => toggleFilterArtist(artist.id)}
                  className={`px-4 py-2 rounded-full border transition-colors text-sm ${active
                    ? 'border-lime-400 bg-lime-500/20 text-white'
                    : 'border-white/10 bg-black/40 text-zinc-300 hover:border-lime-300/60 hover:text-white'
                    }`}
                >
                  {artist.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- MAIN CONTENT (With Context Loader) --- */}
        {contextLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-lime-400" />
            <p className="animate-pulse">Loading library...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredSongs.length > 0 ? (
              filteredSongs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onOpenStreams={setStreamSong}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  showEmbedPlayer
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                <p>No songs found for this artist.</p>
                <button onClick={handleClearFilters} className="mt-4 text-lime-400 hover:underline">Clear filters to see all songs</button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Modal and Streaming Dialog */}
      <Modal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Song' : 'Add New Song'}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 flex items-center gap-3 p-4 rounded-2xl border border-white/10 bg-black/40">
              <input
                type="checkbox"
                name="showOnHome"
                id="showOnHome"
                checked={formData.showOnHome}
                onChange={handleInputChange}
                className="w-5 h-5 rounded border-zinc-600 text-lime-500 focus:ring-lime-500 bg-black/50"
              />
              <label htmlFor="showOnHome" className="text-sm text-zinc-300 select-none cursor-pointer">
                Show on Home Page (Selected Works)
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none" required />
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
                      className={`px-4 py-2 rounded-full border transition-colors text-sm ${active ? 'border-lime-400 bg-lime-500/20 text-white' : 'border-white/10 bg-black/40 text-zinc-300 hover:border-lime-300/60 hover:text-white'}`}
                    >
                      {artist.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Price (USD)</label>
              <input type="number" name="price" step="0.01" value={formData.price} onChange={handleInputChange} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Duration</label>
              <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none" placeholder="3:45" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Service Type</label>
              <input type="text" name="type" value={formData.type} onChange={handleInputChange} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none" placeholder="Production, Mixing..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Genres (comma separated)</label>
              <input type="text" name="genres" value={formData.genres} onChange={handleInputChange} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 flex items-center gap-3 p-4 rounded-2xl border border-white/10 bg-black/40">
              <input
                type="checkbox"
                name="showOnHome"
                id="showOnHome"
                checked={formData.showOnHome}
                onChange={handleInputChange}
                className="w-5 h-5 rounded border-zinc-600 text-lime-500 focus:ring-lime-500 bg-black/50"
              />
              <label htmlFor="showOnHome" className="text-sm text-zinc-300 select-none cursor-pointer">
                Show on Home Page (Selected Works)
              </label>
            </div>
            {['spotify', 'apple', 'tidal', 'qobuz'].map((provider) => (
              <div key={provider} className="space-y-2">
                <label className="text-sm text-zinc-400 capitalize">{provider} link</label>
                <input type="url" name={provider} value={formData[provider]} onChange={handleInputChange} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none" placeholder={`https://...`} />
              </div>
            ))}
          </div>
          <div className="space-y-4 pt-4 border-t border-white/10">
            <p className="text-sm font-semibold text-zinc-300">Embed Players</p>

            <div className="space-y-2">
              <label className="text-xs text-zinc-400">Apple Music Embed Code</label>
              <textarea
                name="embedApple"
                value={formData.embedApple}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none min-h-[100px] font-mono text-xs"
                placeholder="<iframe ... src='embed.music.apple.com' ...></iframe>"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-400">SoundCloud Embed Code</label>
              <textarea
                name="embedSoundcloud"
                value={formData.embedSoundcloud}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none min-h-[100px] font-mono text-xs"
                placeholder="<iframe ... src='w.soundcloud.com/player' ...></iframe>"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-400">Custom Embed</label>
              <textarea
                name="embed"
                value={formData.embed}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none min-h-[80px] font-mono text-xs"
                placeholder="Any other iframe code"
              />
            </div>
            <p className="text-xs text-zinc-500">Paste the full iframe code. Multiple players will be stacked vertically on the song card.</p>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <AppButton variant="ghost" type="button" onClick={() => setIsFormOpen(false)}>Cancel</AppButton>
            <AppButton type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingId ? 'Update Song' : 'Add Song')}
            </AppButton>
          </div>
        </form>
      </Modal>

      <SongStreamingDialog open={!!streamSong} onClose={() => setStreamSong(null)} song={streamSong} />
    </div>
  );
};

export default SongsPage;