import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { AppButton, SectionHeading } from '../components/ui/primitives.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';

// --- Kebab Menu Component ---
const KebabMenu = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 w-32 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden py-1">
          <button 
            onClick={() => { onEdit(); setIsOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            Edit
          </button>
          <button 
            onClick={() => { onDelete(); setIsOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const INITIAL_FORM = {
  title: '',
  desc: '',
  year: '',
  category: '',
  link: ''
};

const AchievementsPage = () => {
  const { achievements, addAchievement, updateAchievement, deleteAchievement, isAdmin } = useCatalog();
  
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Handlers ---

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({ ...INITIAL_FORM, year: new Date().getFullYear() });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      desc: item.desc,
      year: item.year,
      category: item.category || '',
      link: item.link || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this achievement?")) {
      await deleteAchievement(id);
      if (editingId === id) {
        setIsFormOpen(false);
        setFormData(INITIAL_FORM);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.title) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        desc: formData.desc,
        year: formData.year,
        category: formData.category,
        link: formData.link,
      };

      if (editingId) {
        await updateAchievement(editingId, payload);
      } else {
        await addAchievement(payload);
      }

      setIsFormOpen(false);
      setFormData(INITIAL_FORM);
      setEditingId(null);
    } catch (error) {
      console.error("Failed to save achievement", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 text-white min-h-screen">
      
      {/* Header Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-6">
          <SectionHeading align="left" eyebrow="Recognition">
            Awards & Milestones
          </SectionHeading>
          
          <AppButton variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Back to top ↑
          </AppButton>
        </div>

        {/* Description & Add Button Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-2">
          <p className="text-zinc-400 max-w-2xl">
            Highlights from years of collaboration across production, mixing and mastering for leading artists.
          </p>
          
          {isAdmin && (
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-lime-500/20 text-lime-400 hover:bg-lime-500/30 rounded-full text-sm font-semibold transition-colors border border-lime-500/30 shrink-0"
            >
              <Plus size={16} /> Add Achievement
            </button>
          )}
        </div>
      </section>

      {/* Timeline List Section */}
      <section className="relative space-y-8 pl-4 md:pl-0 mt-8">
        {/* Vertical Line */}
        <div className="absolute left-4 md:left-[8.5rem] top-2 bottom-2 w-px bg-gradient-to-b from-lime-500/50 via-white/10 to-transparent" />

        {achievements
          .sort((a, b) => b.year - a.year) // Sort by year descending
          .map((item) => (
          <div key={item.id} className="relative flex flex-col md:flex-row gap-6 md:gap-12 group">
            
            {/* Year Column */}
            <div className="md:w-32 md:text-right shrink-0 pt-1">
              <span className="text-lime-400 font-mono text-lg font-bold">{item.year}</span>
            </div>

            {/* Timeline Dot */}
            <div className="absolute left-4 md:left-[8.5rem] -translate-x-1/2 mt-2 w-3 h-3 rounded-full bg-black border-2 border-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.4)] z-10" />

            {/* Content Card */}
            <div className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 ml-8 md:ml-0 relative">
              
              {/* Kebab Menu (Admin Only) */}
              {isAdmin && (
                <div className="absolute top-4 right-4 z-20">
                  <KebabMenu 
                    onEdit={() => openEditModal(item)} 
                    onDelete={() => handleDelete(item.id)} 
                  />
                </div>
              )}

              <div className="space-y-2 pr-8">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  {item.category && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-zinc-400 border border-white/5">
                      {item.category}
                    </span>
                  )}
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
                  {item.desc}
                </p>
                
                {item.link && (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-medium text-lime-400 hover:text-lime-300 mt-2"
                  >
                    View Achievement ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}

        {achievements.length === 0 && (
          <div className="text-center py-20 text-zinc-500 ml-0 md:ml-32">
            No achievements yet.
          </div>
        )}
      </section>

      {/* Modal Form */}
      <Modal open={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? 'Edit Achievement' : 'Add New Achievement'}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Title</label>
              <input 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none" 
                required 
                placeholder="Award Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Year</label>
              <input 
                name="year" 
                value={formData.year} 
                onChange={handleChange} 
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none" 
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
                placeholder="e.g. Production"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Link (Optional)</label>
              <input 
                name="link" 
                type="url" 
                value={formData.link} 
                onChange={handleChange} 
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none" 
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <AppButton variant="ghost" type="button" onClick={() => setIsFormOpen(false)}>Cancel</AppButton>
            <AppButton type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingId ? 'Save Achievement' : 'Add Achievement')}
            </AppButton>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default AchievementsPage;