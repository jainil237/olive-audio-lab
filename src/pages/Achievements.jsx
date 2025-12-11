import React, { useState } from 'react';
import AchievementTimeline from '../components/AchievementTimeline.jsx';
import { AppButton, GlassCard, SectionHeading } from '../components/ui/primitives.jsx';
import AdminGate from '../components/AdminGate.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';

const INITIAL_FORM = {
  title: '',
  desc: '',
  year: '',
  category: '',
};

const AchievementsPage = () => {
  const { achievements, addAchievement, updateAchievement, deleteAchievement } = useCatalog();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setEditingId(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.title) return;

    const payload = {
      title: formData.title,
      desc: formData.desc,
      year: formData.year,
      category: formData.category,
    };

    if (editingId) {
      updateAchievement(editingId, payload);
    } else {
      addAchievement(payload);
    }

    resetForm();
  };

  const handleEdit = (achievement) => {
    setEditingId(achievement.id);
    setFormData({
      title: achievement.title,
      desc: achievement.desc,
      year: achievement.year,
      category: achievement.category || '',
    });
  };

  const handleDelete = (id) => {
    deleteAchievement(id);
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <div className="space-y-16 text-white">
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-6">
          <SectionHeading align="left" eyebrow="Recognition">
            Awards & Milestones
          </SectionHeading>
          <AppButton variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Back to top ↑
          </AppButton>
        </div>
        <p className="text-zinc-400 max-w-2xl">
          Highlights from years of collaboration across production, mixing and mastering for leading artists.
        </p>
        <AchievementTimeline achievements={achievements} />
      </section>

      <AdminGate>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Year</label>
              <input
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
                placeholder="2024"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-zinc-400">Description</label>
              <textarea
                name="desc"
                value={formData.desc}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Category</label>
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
                placeholder="Production, Engineering..."
              />
            </div>
          </div>
          <div className="flex gap-3">
            <AppButton type="submit" variant="primary">
              {editingId ? 'Update achievement' : 'Add achievement'}
            </AppButton>
            {editingId && (
              <AppButton variant="outline" type="button" onClick={resetForm}>
                Cancel editing
              </AppButton>
            )}
          </div>
        </form>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {achievements.map((achievement) => (
            <GlassCard key={achievement.id} className="bg-black/40 space-y-3">
              <div>
                <h4 className="text-lg font-semibold">{achievement.title}</h4>
                <p className="text-xs text-zinc-500">{achievement.year}</p>
              </div>
              <div className="flex gap-3">
                <AppButton variant="secondary" className="text-xs" onClick={() => handleEdit(achievement)}>
                  Edit
                </AppButton>
                <AppButton variant="ghost" className="text-xs text-red-400 hover:text-red-200" onClick={() => handleDelete(achievement.id)}>
                  Delete
                </AppButton>
              </div>
            </GlassCard>
          ))}
        </div>
      </AdminGate>
    </div>
  );
};

export default AchievementsPage;
