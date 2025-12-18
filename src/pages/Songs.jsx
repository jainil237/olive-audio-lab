import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import SongCard from '../components/SongCard.jsx';
import SongStreamingDialog from '../components/SongStreamingDialog.jsx';
import { AppButton, SectionHeading } from '../components/ui/primitives.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
// import { useCart } from '../context/CartContext.jsx';

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
    isAdmin 
  } = useCatalog();
  // const { addItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [streamSong, setStreamSong] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with first artist if empty
  useEffect(() => {
    if (!formData.artistIds?.length && artists.length > 0 && isFormOpen && !editingId) {
      setFormData((prev) => ({ ...prev, artistIds: [String(artists[0].id)] }));
    }
  }, [artists, isFormOpen, editingId]);

  // Handle Filter Logic from URL
  useEffect(() => {
      const param = searchParams.get('artists');
      // Fix: Don't force Numbers here either, keep strings for Firestore IDs
      const fromParams = param ? param.split(',').map(s => s.trim()).filter(Boolean) : [];
      
      const current = songFilter?.artistIds ?? [];
      const paramKey = fromParams.join(',');
      const currentKey = current.join(',');
  
      if (paramKey !== currentKey) {
        applySongFilter(fromParams.length ? { artistIds: fromParams } : null);
      }
  }, [searchParams, applySongFilter, songFilter]);

  // Sync Filter to URL
  useEffect(() => {
    const ids = songFilter?.artistIds ?? [];
    const param = searchParams.get('artists');
    const paramIds = param ? param.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    if (ids.join(',') === paramIds.join(',')) return;

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
        return song.artistIds.some((id) => activeIds.includes(String(id)));
      });
    }
    return songs;
  }, [songs, songFilter]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const toggleFilterArtist = useCallback((artistId) => {
    const sid = String(artistId);
    const current = new Set(songFilter?.artistIds ?? []);
    if (current.has(sid)) current.delete(sid);
    else current.add(sid);
    const next = Array.from(current);
    applySongFilter(next.length ? { artistIds: next } : null);
  }, [songFilter, applySongFilter]);

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
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this song?")) {
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
        artistIds: formData.artistIds, // Sending Strings, NOT Numbers
        price: Number(formData.price) || 0,
        duration: formData.duration,
        type: formData.type,
        genres: formData.genres.split(',').map((genre) => genre.trim()).filter(Boolean),
        streaming,
      };

      if (editingId) {
        await updateSong(editingId, payload);
      } else {
        await addSong(payload);
      }
      setIsFormOpen(false); // Close only on success
    } catch (error) {
      console.error("Failed to save song", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 text-white">
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-6">
          <SectionHeading align="left" eyebrow="Catalogue">Songs & Albums</SectionHeading>
          <AppButton variant="ghost" onClick={() => navigate('/artists')}>Explore collaborators →</AppButton>
        </div>
        
        <div className="flex items-start justify-between gap-4">
          <p className="text-zinc-400 max-w-2xl">
            Licenses for production, mixing and mastering projects. Add tracks to your cart to secure your spot in the studio calendar.
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

        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {artists.map((artist) => {
              const active = songFilter?.artistIds?.includes(String(artist.id));
              return (
                <button
                  key={artist.id}
                  type="button"
                  onClick={() => toggleFilterArtist(artist.id)}
                  className={`px-4 py-2 rounded-full border transition-colors text-sm ${active ? 'border-lime-400 bg-lime-500/20 text-white' : 'border-white/10 bg-black/40 text-zinc-300 hover:border-lime-300/60 hover:text-white'}`}
                >
                  {artist.name}
                </button>
              );
            })}
            {songFilter?.artistIds?.length ? (
              <AppButton variant="ghost" onClick={clearSongFilter}>Clear filters</AppButton>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onOpenStreams={setStreamSong}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </section>

      <Modal 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={editingId ? 'Edit Song' : 'Add New Song'}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
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
            {['spotify', 'apple', 'tidal', 'qobuz'].map((provider) => (
              <div key={provider} className="space-y-2">
                <label className="text-sm text-zinc-400 capitalize">{provider} link</label>
                <input type="url" name={provider} value={formData[provider]} onChange={handleInputChange} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none" placeholder={`https://...`} />
              </div>
            ))}
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