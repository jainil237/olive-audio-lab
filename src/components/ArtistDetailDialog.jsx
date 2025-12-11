import React from 'react';
import { ExternalLink, Music2 } from 'lucide-react';
import Modal from './ui/Modal.jsx';
import { Pill } from './ui/primitives.jsx';

const ArtistDetailDialog = ({ open, artist, onClose, onViewWorks }) => {
  if (!artist) return null;

  return (
    <Modal open={open} onClose={onClose} title={artist.name} width="max-w-3xl">
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">{artist.bio}</p>

        {artist.genres?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {artist.genres.map((genre) => (
              <Pill key={genre}>{genre}</Pill>
            ))}
          </div>
        )}

        {artist.honors?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-[0.25em] text-lime-300/80">Honours</h4>
            <ul className="space-y-1 text-sm text-zinc-300">
              {artist.honors.map((honor) => (
                <li key={honor}>{honor}</li>
              ))}
            </ul>
          </div>
        )}

        {artist.notableWorks?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-[0.25em] text-lime-300/80">Notable Works</h4>
            <ul className="space-y-1 text-sm text-zinc-300">
              {artist.notableWorks.map((work) => (
                <li key={work} className="flex items-center gap-2">
                  <Music2 size={14} className="text-lime-300" />
                  <span>{work}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4">
          <button
            type="button"
            onClick={() => onViewWorks?.(artist)}
            className="inline-flex items-center gap-2 rounded-full border border-lime-400/40 bg-lime-500/10 px-4 py-2 text-sm font-semibold text-lime-200 transition hover:bg-lime-500/20"
          >
            <ExternalLink size={16} /> View songs produced together
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ArtistDetailDialog;
