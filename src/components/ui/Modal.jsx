import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ open, onClose, title, children, width = 'max-w-2xl' }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className={`relative z-10 w-full ${width} bg-zinc-950/90 border border-zinc-800/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden`}> 
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800">
          <h3 id="modal-title" className="text-base sm:text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 text-zinc-200 overflow-y-auto max-h-[80vh] sm:max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

