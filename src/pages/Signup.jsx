// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppButton, GlassCard, SectionHeading } from '../components/ui/primitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
        const cleanEmail = form.email.trim();
      await register(cleanEmail, form.password, form.name);
      navigate('/overview', { replace: true });
    } catch (err) {
      console.error(err);
      // Firebase specific error mapping
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white grid place-items-center py-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-lime-800/20 rounded-full blur-[140px]" />
      </div>

      <GlassCard className="relative z-10 w-full max-w-md bg-black/60">
        <div className="space-y-6">
          <SectionHeading align="left" eyebrow="Join Us">
            Create Account
          </SectionHeading>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">Full Name</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                required
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none transition-colors"
              />
            </div>

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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
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
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </AppButton>
          </form>
          
          <p className="text-xs text-zinc-500 text-center">
             Already have an account?{' '}
             <Link to="/login" className="text-lime-400 hover:underline">
               Sign in
             </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default SignupPage;