import React, { useState } from 'react';
import { Plus, Quote, Star, Trash2, Edit2 } from 'lucide-react';
import { AppButton, SectionHeading } from '../components/ui/primitives.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';

const INITIAL_TESTIMONIAL = { name: '', role: '', text: '', rating: 5 };
const INITIAL_REVIEW = { source: '', text: '', rating: 5 };

const Reviews = () => {
  const {
    testimonials, addTestimonial, updateTestimonial, deleteTestimonial,
    reviews, addReview, updateReview, deleteReview,
    isAdmin, currentUser,
  } = useCatalog();

  const [activeTab, setActiveTab] = useState('testimonials');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canModify = (item) =>
    isAdmin || (currentUser && item.userId === currentUser.uid);

  const openAddModal = () => {
    setFormData(activeTab === 'testimonials' ? INITIAL_TESTIMONIAL : INITIAL_REVIEW);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    const { id, userId, ...data } = item;
    setFormData(data);
    setIsFormOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeTab === 'testimonials') {
        editingId ? await updateTestimonial(editingId, formData) : await addTestimonial(formData);
      } else {
        editingId ? await updateReview(editingId, { ...formData, rating: Number(formData.rating) }) : await addReview({ ...formData, rating: Number(formData.rating) });
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    activeTab === 'testimonials' ? await deleteTestimonial(id) : await deleteReview(id);
  };

  const tabs = [
    { key: 'testimonials', label: 'Client Stories', icon: Quote },
    { key: 'reviews', label: 'Industry Reviews', icon: Star },
  ];

  const items = activeTab === 'testimonials' ? testimonials : reviews;

  return (
    <div className="min-h-screen text-white space-y-8 sm:space-y-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <SectionHeading align="left" eyebrow="Community">
          Reviews &amp; Stories
        </SectionHeading>
        <div className="flex gap-1 sm:gap-2 p-1 bg-zinc-900 rounded-full border border-zinc-800 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key ? 'bg-lime-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <AppButton onClick={openAddModal} className="flex gap-2 items-center">
          <Plus size={16} /> Add {activeTab === 'testimonials' ? 'Story' : 'Review'}
        </AppButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {items.length > 0 ? items.map(item => (
          <div key={item.id} className="bg-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl relative group hover:border-zinc-700 transition-colors">
            {canModify(item) && (
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(item)} className="p-2 bg-black/50 hover:bg-lime-500/20 hover:text-lime-400 rounded-full" aria-label="Edit"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-black/50 hover:bg-red-500/20 hover:text-red-400 rounded-full" aria-label="Delete"><Trash2 size={14} /></button>
              </div>
            )}

            {activeTab === 'testimonials' ? (
              <>
                <p className="text-zinc-300 italic mb-6 line-clamp-4">"{item.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-base">{item.name}</p>
                    <p className="text-lime-500 text-sm">{item.role}</p>
                  </div>
                  <div className="flex gap-1 text-amber-500">
                    {[...Array(Number(item.rating) || 5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(item.rating || 5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <h4 className="font-serif text-xl text-white mb-2">{item.source}</h4>
                <p className="text-zinc-400 text-sm line-clamp-4">"{item.text}"</p>
              </>
            )}
          </div>
        )) : (
          <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
            <p>No {activeTab === 'testimonials' ? 'client stories' : 'industry reviews'} yet.</p>
            <p className="text-xs mt-2">Be the first to add one!</p>
          </div>
        )}
      </div>

      <Modal title={`${editingId ? 'Edit' : 'Add'} ${activeTab === 'testimonials' ? 'Client Story' : 'Review'}`} open={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'testimonials' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Client Name</label>
                <input name="name" value={formData.name || ''} onChange={handleChange} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-lime-500 text-white placeholder-zinc-600 transition-colors" placeholder="e.g. Sony Music" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Role / Title</label>
                <input name="role" value={formData.role || ''} onChange={handleChange} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-lime-500 text-white placeholder-zinc-600 transition-colors" placeholder="e.g. Label Manager" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Rating (1-5)</label>
                <input type="number" min="1" max="5" name="rating" value={formData.rating || 5} onChange={handleChange} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-lime-500 text-white placeholder-zinc-600 transition-colors" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Source / Publication</label>
                <input name="source" value={formData.source || ''} onChange={handleChange} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-lime-500 text-white placeholder-zinc-600 transition-colors" placeholder="e.g. Mix Magazine" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Rating (1-5)</label>
                <input type="number" min="1" max="5" name="rating" value={formData.rating || 5} onChange={handleChange} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-lime-500 text-white placeholder-zinc-600 transition-colors" />
              </div>
            </>
          )}
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Content</label>
            <textarea name="text" value={formData.text || ''} onChange={handleChange} required rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-lime-500 text-white placeholder-zinc-600 transition-colors" placeholder="Write the content here..." />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <AppButton type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</AppButton>
            <AppButton type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Item'}</AppButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Reviews;
