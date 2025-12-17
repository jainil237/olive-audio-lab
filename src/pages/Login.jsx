import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AppButton, GlassCard, SectionHeading } from '../components/ui/primitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirect = searchParams.get('redirect');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const cleanEmail = form.email.trim();
      
      await login(cleanEmail, form.password);
      navigate(redirect || '/overview', { replace: true });
    } catch (authError) {
      console.error(authError);
      if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (authError.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white grid place-items-center py-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-900/30 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-20%] left-[-5%] w-[420px] h-[420px] bg-lime-700/20 rounded-full blur-[140px]" />
      </div>

      <GlassCard className="relative z-10 w-full max-w-md bg-black/60">
        <div className="space-y-6">
          <SectionHeading align="left" eyebrow="Access">
            Sign In
          </SectionHeading>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@studio.com"
                required
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                {error}
              </div>
            )}

            <AppButton type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Enter Studio'}
            </AppButton>
          </form>
          
          <p className="text-xs text-zinc-500 text-center">
             Don't have an account?{' '}
             <Link to="/signup" className="text-lime-400 hover:underline">
               Create one
             </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default LoginPage;