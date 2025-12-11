import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtistCard from '../components/ArtistCard.jsx';
import ArtistDetailDialog from '../components/ArtistDetailDialog.jsx';
import { AppButton, GlassCard, SectionHeading } from '../components/ui/primitives.jsx';
import AdminGate from '../components/AdminGate.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';

const INITIAL_FORM = {
  name: '',
  role: '',
  bio: '',
  genres: '',
  honors: '',
  notableWorks: '',
};

const ArtistsPage = () => {
  const navigate = useNavigate();
  const {
    artists,
    addArtist,
    updateArtist,
    deleteArtist,
    applySongFilter,
  } = useCatalog();

  const [selectedArtist, setSelectedArtist] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);

  const handleOpen = (artist) => {
    setSelectedArtist(artist);
  };

  const handleViewSongs = (artist) => {
    applySongFilter({ artistIds: [artist.id] });
    navigate('/songs', { state: { fromArtist: true } });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setEditingId(null);
  };

  const parseList = (value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.name) return;

    const payload = {
      name: formData.name,
      role: formData.role,
      bio: formData.bio,
      genres: parseList(formData.genres),
      honors: parseList(formData.honors),
      notableWorks: parseList(formData.notableWorks),
    };

    if (editingId) {
      updateArtist(editingId, payload);
    } else {
      addArtist(payload);
    }

    resetForm();
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
    });
  };

  const handleDelete = (id) => {
    deleteArtist(id);
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <div className="space-y-16 text-white">
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-6">
          <SectionHeading align="left" eyebrow="Collaborators">
            Artists & Partners
          </SectionHeading>
          <AppButton variant="ghost" onClick={() => window.location.assign('/songs')}>
            Explore catalogue →
          </AppButton>
        </div>
        <p className="text-zinc-400 max-w-2xl">
          A curated network of vocalists, instrumentalists and producers we regularly work with at Olive Audio Lab.
        </p>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} onClick={handleOpen} />
          ))}
        </div>
      </section>

      <AdminGate>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Role</label>
              <input
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-zinc-400">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Genres (comma separated)</label>
              <input
                name="genres"
                value={formData.genres}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Honours (comma separated)</label>
              <input
                name="honors"
                value={formData.honors}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-zinc-400">Notable Works (comma separated)</label>
              <input
                name="notableWorks"
                value={formData.notableWorks}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <AppButton type="submit" variant="primary">
              {editingId ? 'Update artist' : 'Add artist'}
            </AppButton>
            {editingId && (
              <AppButton variant="outline" type="button" onClick={resetForm}>
                Cancel editing
              </AppButton>
            )}
          </div>
        </form>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {artists.map((artist) => (
            <GlassCard key={artist.id} className="bg-black/40 space-y-3">
              <div>
                <h4 className="text-lg font-semibold">{artist.name}</h4>
                <p className="text-xs text-zinc-500">{artist.role}</p>
              </div>
              <div className="flex gap-3">
                <AppButton variant="secondary" className="text-xs" onClick={() => handleEdit(artist)}>
                  Edit
                </AppButton>
                <AppButton variant="ghost" className="text-xs text-red-400 hover:text-red-200" onClick={() => handleDelete(artist.id)}>
                  Delete
                </AppButton>
              </div>
            </GlassCard>
          ))}
        </div>
      </AdminGate>

      <ArtistDetailDialog
        open={!!selectedArtist}
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
        onViewWorks={handleViewSongs}
      />
    </div>
  );
};

export default ArtistsPage;
