
import React, { useState } from 'react';
import { Plus, Quote, Star, Trash2, Edit2, X } from 'lucide-react';
import { AppButton, SectionHeading } from '../components/ui/primitives.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';

const INITIAL_TESTIMONIAL = { name: '', role: '', text: '' };
const INITIAL_REVIEW = { source: '', text: '', rating: 5 };

const ContentManager = () => {
    const {
        testimonials, addTestimonial, updateTestimonial, deleteTestimonial,
        reviews, addReview, updateReview, deleteReview,
        isAdmin
    } = useCatalog();

    const [activeTab, setActiveTab] = useState('testimonials');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isAdmin) {
        return <div className="min-h-screen pt-40 text-center text-zinc-500">Access Denied</div>;
    }

    const openAddModal = () => {
        setFormData(activeTab === 'testimonials' ? INITIAL_TESTIMONIAL : INITIAL_REVIEW);
        setEditingId(null);
        setIsFormOpen(true);
    };

    const openEditModal = (item) => {
        setEditingId(item.id);
        const { id, ...data } = item;
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

    return (
        <div className="min-h-screen text-white space-y-12">
            <div className="flex items-center justify-between">
                <SectionHeading align="left" eyebrow="Admin">Content Manager</SectionHeading>
                <div className="flex gap-4 p-1 bg-zinc-900 rounded-full border border-zinc-800">
                    {['testimonials', 'reviews'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab ? 'bg-lime-500 text-black' : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            {tab === 'testimonials' ? 'Client Stories' : 'Industry Reviews'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <AppButton onClick={openAddModal} className="flex gap-2 items-center">
                    <Plus size={16} /> Add {activeTab === 'testimonials' ? 'Story' : 'Review'}
                </AppButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeTab === 'testimonials' ? testimonials : reviews).map(item => (
                    <div key={item.id} className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl relative group hover:border-zinc-700 transition-colors">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(item)} className="p-2 bg-black/50 hover:bg-lime-500/20 hover:text-lime-400 rounded-full"><Edit2 size={14} /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 bg-black/50 hover:bg-red-500/20 hover:text-red-400 rounded-full"><Trash2 size={14} /></button>
                        </div>

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
                ))}
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

export default ContentManager;
