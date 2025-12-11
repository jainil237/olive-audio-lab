import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppButton, GlassCard, SectionHeading } from '../components/ui/primitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const roles = [
  { label: 'Viewer', value: 'viewer', description: 'Browse catalogue previews and achievements.' },
  { label: 'Collaborator', value: 'collaborator', description: 'Access shared resources and project queries.' },
  { label: 'Admin', value: 'admin', description: 'Manage catalogue, achievements, and billing records.' },
];

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', name: '', role: roles[0].value });
  const [error, setError] = useState('');

  const redirect = searchParams.get('redirect');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!form.email) {
      setError('Email is required.');
      return;
    }

    try {
      const next = login(form);
      navigate(redirect || next, { replace: true });
    } catch (authError) {
      setError(authError.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white grid place-items-center py-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-900/30 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-20%] left-[-5%] w-[420px] h-[420px] bg-lime-700/20 rounded-full blur-[140px]" />
      </div>

      <GlassCard className="relative z-10 w-full max-w-3xl bg-black/60">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <SectionHeading align="left" eyebrow="Access">
              Sign in to Olive Audio Lab
            </SectionHeading>
            <p className="text-sm text-zinc-400">
              Use your collaborator credentials to access the full experience. Admins can manage catalogue entries after authentication.
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@studio.com"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">Full name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                  {error}
                </div>
              )}

              <AppButton type="submit" variant="primary" className="w-full md:w-auto">
                Enter studio
              </AppButton>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Role permissions</h3>
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.value} className={`rounded-2xl border border-white/10 bg-black/40 p-4 ${form.role === role.value ? 'border-lime-400/60 bg-lime-500/10' : ''}`}>
                  <p className="text-sm font-semibold text-white">{role.label}</p>
                  <p className="text-xs text-zinc-400">{role.description}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-500">
              Admin and collaborator privileges rely on server-side validation when connected to production identity providers.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default LoginPage;
