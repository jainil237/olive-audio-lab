import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ArtistCard from '../components/ArtistCard.jsx';
import ArtistDetailDialog from '../components/ArtistDetailDialog.jsx';
import { AppButton, SectionHeading } from '../components/ui/primitives.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';

const INITIAL_FORM = {
  name: '',
  role: '',
  bio: '',
  genres: '',
  honors: '',
  notableWorks: '',
  showOnHome: false,
};

const ArtistsPage = () => {
  const navigate = useNavigate();
  const { artists, addArtist, updateArtist, deleteArtist, applySongFilter, isAdmin } = useCatalog();

  const [selectedArtist, setSelectedArtist] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const handleViewSongs = (artist) => {
  //   applySongFilter({ artistIds: [artist.id] });
  //   navigate('/songs', { state: { fromArtist: true } });
  // };

  const handleViewSongs = (artist) => {
    // UPDATED: Navigate with query param so Songs page filters automatically
    if (!artist || !artist.id) {
      console.error("Missing artist ID!");
      return;
    }
    navigate(`/songs?artists=${artist.id}`);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const parseList = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);

  const openAddModal = () => {
    setFormData(INITIAL_FORM);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (artist) => {
    setEditingId(artist.id);
    setFormData({
      name: artist.name,
      role: artist.role,
      bio: artist.bio,
      genres: artist.genres?.join(', ') || '',
      honors: artist.honors?.join(', ') || '',
      notableWorks: artist.notableWorks?.join(', ') || '',
      showOnHome: artist.showOnHome || false,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this artist?")) {
      await deleteArtist(id);
      if (editingId === id) {
        setIsFormOpen(false);
        setFormData(INITIAL_FORM);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        role: formData.role,
        bio: formData.bio,
        genres: parseList(formData.genres),
        honors: parseList(formData.honors),
        notableWorks: parseList(formData.notableWorks),
        showOnHome: formData.showOnHome,
      };

      if (editingId) {
        await updateArtist(editingId, payload);
      } else {
        await addArtist(payload);
      }

      setIsFormOpen(false);
      setFormData(INITIAL_FORM);
      setEditingId(null);
    } catch (error) {
      console.error("Failed to save artist", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 text-white">
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-6">
          <SectionHeading align="left" eyebrow="Collaborators">Artists & Partners</SectionHeading>
          <AppButton variant="ghost" onClick={() => window.location.assign('/songs')}>Explore catalogue →</AppButton>
        </div>

        <div className="flex items-start justify-between gap-4">
          <p className="text-zinc-400 max-w-2xl">
            A curated network of vocalists, instrumentalists and producers we regularly work with at Olive Audio Lab.
          </p>
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-lime-500/20 text-lime-400 hover:bg-lime-500/30 rounded-full text-sm font-semibold transition-colors border border-lime-500/30"
            >
              <Plus size={16} /> Add Artist
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onClick={setSelectedArtist}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </section>

      <Modal open={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? 'Edit Artist' : 'Add New Artist'}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 flex items-center gap-3 p-4 rounded-2xl border border-white/10 bg-black/40">
              <input
                type="checkbox"
                name="showOnHome"
                id="showOnHome"
                checked={formData.showOnHome}
                onChange={handleChange}
                className="w-5 h-5 rounded border-zinc-600 text-lime-500 focus:ring-lime-500 bg-black/50"
              />
              <label htmlFor="showOnHome" className="text-sm text-zinc-300 select-none cursor-pointer">
                Show on Home Page (Featured Artists)
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Role</label>
              <input name="role" value={formData.role} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-zinc-400">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none" rows={3} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Genres (comma separated)</label>
              <input name="genres" value={formData.genres} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Honours (comma separated)</label>
              <input name="honors" value={formData.honors} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-zinc-400">Notable Works (comma separated)</label>
              <input name="notableWorks" value={formData.notableWorks} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none" />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <AppButton variant="ghost" type="button" onClick={() => setIsFormOpen(false)}>Cancel</AppButton>
            <AppButton type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingId ? 'Update Artist' : 'Add Artist')}
            </AppButton>
          </div>
        </form>
      </Modal>

      <ArtistDetailDialog open={!!selectedArtist} artist={selectedArtist} onClose={() => setSelectedArtist(null)} onViewWorks={handleViewSongs} />
    </div>
  );
};

export default ArtistsPage;