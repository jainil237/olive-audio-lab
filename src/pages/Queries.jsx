import React, { useMemo, useState } from 'react';
import { Pencil, Trash2, X, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link
import { AppButton, GlassCard, SectionHeading } from '../components/ui/primitives.jsx';
import { useCatalog } from '../context/CatalogContext.jsx'; 

const initialFormState = {
  name: '',
  email: '',
  projectType: '',
  budget: '',
  message: '',
};

const QueriesPage = () => {
  // Pull isAdmin from context
  const { addQuery, updateQuery, deleteQuery, queries, currentUser, isAdmin } = useCatalog();
  
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (query) => {
    setEditingId(query.id);
    setFormData({
      name: query.name,
      email: query.email,
      projectType: query.projectType || '',
      budget: query.budget || '',
      message: query.message || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this query?")) {
      await deleteQuery(id);
      if (editingId === id) handleCancelEdit();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      if (editingId) {
        await updateQuery(editingId, { ...formData, updatedAt: new Date() });
      } else {
        await addQuery(formData);
      }
      setSuccess(true);
      setFormData(initialFormState);
      setEditingId(null);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      alert("Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const responseItems = useMemo(() => [
    'Share your references and timeline.',
    'Receive a curated production plan.',
    'Approve proposal and secure slot.',
  ], []);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2 text-white">
      {/* LEFT: FORM SECTION (Same as before) */}
      <div className="space-y-6">
        <SectionHeading align="left" eyebrow={editingId ? "Edit Mode" : "Project brief"}>
          {editingId ? "Update your query" : "Tell us about your sound"}
        </SectionHeading>
        <p className="text-zinc-400">
          Share project details so we can prepare timelines, budget and deliverables. Our team responds within 24 hours.
        </p>

        <form onSubmit={handleSubmit} className={`relative space-y-4 overflow-hidden rounded-[2.5rem] border ${editingId ? 'border-lime-500/30' : 'border-white/5'} bg-black/60 p-6 md:p-8 transition-colors duration-300`}>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-lime-500/10 via-transparent to-emerald-500/10 opacity-70" />
          <div className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-lime-400/20 blur-3xl" />
          
          <div className="relative space-y-4">
            {editingId && (
              <div className="flex items-center justify-between bg-lime-500/10 px-4 py-2 rounded-xl border border-lime-500/20 text-lime-300 text-sm mb-4">
                <span>Editing previous submission</span>
                <button type="button" onClick={handleCancelEdit} className="hover:text-white flex items-center gap-1"><X size={14} /> Cancel</button>
              </div>
            )}

            {[
              { label: 'Name', name: 'name', type: 'text', placeholder: 'Your full name', required: true },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com', required: true },
              { label: 'Project type', name: 'projectType', type: 'text', placeholder: 'Production, mixing, mastering…' },
              { label: 'Budget range', name: 'budget', type: 'text', placeholder: '$500 - $3,000' },
            ].map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="text-sm text-zinc-400">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  disabled={submitting}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none disabled:opacity-50 text-white"
                />
              </div>
            ))}

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Project brief</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                disabled={submitting}
                rows={5}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none disabled:opacity-50 text-white"
              />
            </div>

            <div className="flex gap-3">
              <AppButton type="submit" variant="primary" className="flex-1 md:w-auto" disabled={submitting}>
                {submitting ? 'Saving...' : (editingId ? 'Update Query' : 'Submit Query')}
              </AppButton>
              {editingId && (
                 <AppButton type="button" variant="ghost" onClick={handleCancelEdit} disabled={submitting}>Cancel</AppButton>
              )}
            </div>
            
            {success && (
              <div className="rounded-2xl border border-lime-500/40 bg-lime-500/10 px-4 py-2 text-sm text-lime-200 animate-in fade-in slide-in-from-top-2">
                {editingId ? 'Query updated successfully.' : "Thanks! We've received your brief."}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* RIGHT: INFO & HISTORY SECTION */}
      <div className="space-y-6">
        <GlassCard className="bg-black/50 space-y-4">
          <h3 className="text-2xl font-semibold">Booking process</h3>
          <div className="space-y-4">
            {responseItems.map((step, index) => (
              <div key={step} className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-lime-300/80">Step {index + 1}</p>
                <p className="text-sm text-zinc-300">{step}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* --- CONDITIONAL RENDERING START --- */}
        
        {/* CASE 1: ADMIN VIEW */}
        {isAdmin && (
          <div className="space-y-4 pt-6 border-t border-white/10">
            <div className="p-6 rounded-2xl bg-lime-900/10 border border-lime-500/20 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-lime-500/20 flex items-center justify-center mx-auto text-lime-400">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Admin Access</h4>
                <p className="text-sm text-zinc-400 mt-1">
                  You are signed in as an administrator. Use the dashboard to view all received inquiries.
                </p>
              </div>
              <Link to="/queries-listing">
                <AppButton variant="outline" className="w-full mt-2 group">
                  View All Inquiries <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </AppButton>
              </Link>
            </div>
          </div>
        )}

        {/* CASE 2: REGULAR USER VIEW (PREVIOUS QUERIES) */}
        {!isAdmin && currentUser && (
          <div className="space-y-4 pt-6 border-t border-white/10">
            <h4 className="text-lg font-semibold flex items-center gap-2 text-zinc-200">Previous Queries</h4>
            
            {queries.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">No previous queries found.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {queries.map((entry) => (
                  <GlassCard key={entry.id} className="bg-black/40 space-y-3 border-white/5 hover:border-white/10 transition-colors group relative">
                    <div className="flex justify-between items-center text-xs text-zinc-500 pb-2 border-b border-white/5">
                      <span className="font-mono text-lime-500/80">
                        {entry.updatedAt ? 'Updated ' : 'Sent '} {formatDate(entry.updatedAt || entry.createdAt)}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(entry)} className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(entry.id)} className="p-1.5 hover:bg-red-500/10 rounded-md text-zinc-400 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="space-y-1">
                       <h5 className="text-sm font-semibold text-white truncate">{entry.projectType || 'General Inquiry'}</h5>
                       <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed" title={entry.message}>{entry.message || 'No description provided.'}</p>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                        <div className="text-xs text-zinc-500 truncate max-w-[70%]">
                           <span className="text-zinc-600">Budget: </span><span className="text-zinc-300 truncate">{entry.budget || 'TBD'}</span>
                        </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CASE 3: GUEST VIEW */}
        {!isAdmin && !currentUser && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center mt-6">
                <p className="text-sm text-zinc-400">Sign in to track and manage your project queries.</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default QueriesPage;