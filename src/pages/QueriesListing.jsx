import React, { useState } from 'react';
import { Trash2, Mail, Calendar, User, X, DollarSign } from 'lucide-react';
import { AppButton, SectionHeading } from '../components/ui/primitives.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';

// --- Internal Modal Component for Details ---
const QueryDetailModal = ({ query, onClose }) => {
  if (!query) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111] border border-white/10 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-10">
          <h3 className="text-2xl font-bold text-white mb-1">{query.projectType || 'General Inquiry'}</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5"><User size={14} /> {query.name}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-lime-400"><Mail size={14} /> {query.email}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(query.createdAt)}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Budget Range</span>
            <div className="text-lg text-white font-medium flex items-center gap-2">
               <DollarSign size={18} className="text-lime-500" /> 
               {query.budget || 'Not specified'}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Project Brief</span>
            <div className="p-5 rounded-xl bg-black/40 border border-white/5 text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-[40vh] overflow-y-auto custom-scrollbar">
              {query.message || 'No additional details provided.'}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-end">
          <AppButton variant="ghost" onClick={onClose}>Close</AppButton>
        </div>
      </div>
    </div>
  );
};


// --- Main Listing Page ---
const QueriesListingPage = () => {
  const { queries, deleteQuery, isAdmin } = useCatalog();
  const [selectedQuery, setSelectedQuery] = useState(null);

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent opening the modal when clicking delete
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteQuery(id);
      if (selectedQuery?.id === id) setSelectedQuery(null);
    }
  };

  // 1. Security Check
  if (!isAdmin) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-zinc-500">
        Access Denied. Admin only.
      </div>
    );
  }

  // 2. Date Formatter Helper
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-10 text-white min-h-screen">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionHeading align="left" eyebrow="Inbox">
          Received Queries
        </SectionHeading>
        <div className="text-zinc-400 text-sm">
          {queries.length} {queries.length === 1 ? 'Message' : 'Messages'}
        </div>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {queries.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
            <Mail className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500">No queries received yet.</p>
          </div>
        ) : (
          queries.map((query) => (
            <div 
              key={query.id} 
              onClick={() => setSelectedQuery(query)}
              className="group relative bg-[#111] border border-white/10 rounded-2xl p-5 transition-all hover:border-lime-500/30 hover:bg-white/5 cursor-pointer"
            >
              {/* Header Row: Name/Info + Date/Actions */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                
                {/* Left Side: Icon + Name + Email */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-lime-500/10 rounded-full text-lime-400 shrink-0 mt-1">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg leading-tight">
                      {query.name || 'Unknown Sender'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                      <a 
                        href={`mailto:${query.email}`} 
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-zinc-400 hover:text-lime-400 transition-colors flex items-center gap-1"
                      >
                        {query.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right Side: Date + Delete Button (Flex container prevents overlap) */}
                <div className="flex items-center gap-3 shrink-0 self-start md:self-auto pl-11 md:pl-0">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 font-mono whitespace-nowrap">
                    <Calendar size={12} />
                    {query.createdAt ? formatDate(query.createdAt) : 'No Date'}
                  </div>
                  
                  <button
                    onClick={(e) => handleDelete(e, query.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete Message"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Body: Budget & Preview */}
              <div className="space-y-2 pl-0 md:pl-[3.25rem]">
                <div className="flex flex-wrap items-center gap-2">
                    {query.projectType && (
                    <span className="inline-block px-2 py-0.5 rounded bg-white/10 text-[10px] font-medium text-zinc-300 tracking-wide uppercase border border-white/5">
                        {query.projectType}
                    </span>
                    )}
                    {/* Budget Badge Display */}
                    {query.budget && (
                        <span className="inline-block px-2 py-0.5 rounded bg-lime-500/10 text-[10px] font-medium text-lime-400 tracking-wide border border-lime-500/20">
                            Budget: {query.budget}
                        </span>
                    )}
                </div>
                
                <p className="text-zinc-400 text-sm line-clamp-2">
                  {query.message || <span className="italic opacity-50">No details provided...</span>}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      <QueryDetailModal 
        query={selectedQuery} 
        onClose={() => setSelectedQuery(null)} 
      />

    </div>
  );
};

export default QueriesListingPage;