import React from 'react';
import { ExternalLink } from 'lucide-react';
import Modal from './ui/Modal.jsx';

const PROVIDER_LABELS = {
  spotify: 'Spotify',
  apple: 'Apple Music',
  tidal: 'Tidal',
  qobuz: 'Qobuz',
  youtube: 'YouTube Music',
};

const SongStreamingDialog = ({ open, onClose, song }) => {
  if (!song) return null;
  const entries = Object.entries(song.streaming || {}).filter(([, url]) => !!url);

  return (
    <Modal open={open} onClose={onClose} title={`Listen to ${song.title}`} width="max-w-lg">
      {entries.length === 0 ? (
        <p className="text-sm text-zinc-400">Streaming links are not available for this track yet.</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([provider, url]) => (
            <a
              key={provider}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/60 px-4 py-3 text-white transition hover:border-white/40 hover:bg-zinc-800/70"
            >
              <div>
                <p className="text-sm font-semibold">{PROVIDER_LABELS[provider] || provider}</p>
                <span className="text-xs text-zinc-400">Open in new tab</span>
              </div>
              <ExternalLink size={18} className="text-lime-300" />
            </a>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default SongStreamingDialog;
