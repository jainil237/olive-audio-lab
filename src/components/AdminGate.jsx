import React, { useState } from 'react';
import { AppButton, GlassCard } from './ui/primitives.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';

const AdminGate = ({ children }) => {
  const { isAdmin, authenticateAdmin, signOutAdmin } = useCatalog();
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    if (!secret) {
      setError('Enter the admin access key.');
      return;
    }
    const success = authenticateAdmin(secret.trim());
    if (!success) {
      setError('Incorrect access key.');
    } else {
      setSecret('');
    }
  };

  if (!isAdmin) {
    return (
      <form onSubmit={handleSubmit} className="mt-10 max-w-md">
        <GlassCard className="bg-black/60 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Admin access required</h3>
            <p className="text-sm text-zinc-400">
              Enter the admin key to unlock management actions for this section.
            </p>
          </div>
          <input
            type="password"
            placeholder="Enter admin access key"
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-lime-400 focus:outline-none"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            required
          />
          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
          <AppButton type="submit" variant="primary">
            Unlock admin mode
          </AppButton>
        </GlassCard>
      </form>
    );
  }

  return (
    <GlassCard className="bg-black/60 space-y-4 mt-10">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Admin controls</h3>
        <AppButton variant="ghost" className="text-red-400 hover:text-red-200" onClick={signOutAdmin}>
          Sign out
        </AppButton>
      </div>
      <div className="space-y-6">{children}</div>
    </GlassCard>
  );
};

export default AdminGate;
