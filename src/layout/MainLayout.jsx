import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import BackToTopButton from '../components/BackToTopButton.jsx';
import { AppButton } from '../components/ui/primitives.jsx';
import sonicLogo from '.././assets/OliveGreenLogo.png';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Overview', to: '/overview' },
  { label: 'Songs / Albums', to: '/songs' },
  { label: 'Artists', to: '/artists' },
  { label: 'Achievements', to: '/achievements' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'Queries', to: '/queries' },
];

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [mobileOpen]);

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-lime-500/30 selection:text-lime-200">
      {/* Skip to Content */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-md py-3 sm:py-4 border-b border-white/10' : 'bg-transparent py-4 sm:py-6'}`}
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
          <button
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
            aria-label="Olive Audio Lab - Go to home page"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-black/20">
              <img src={sonicLogo} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight">Olive Audio Lab</span>
          </button>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-zinc-400 hover:text-white'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {user && user.role === 'admin' && (
              <NavLink
                to="/content"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-lime-400 hover:text-lime-300'}`
                }
              >
                Manage Content
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <AppButton
                variant="secondary"
                className="hidden md:inline-flex gap-2 border border-white/10"
                onClick={() => {
                  logout();
                  navigate('/', { replace: true });
                }}
                aria-label={`Sign out (logged in as ${user.role})`}
              >
                <span className="text-xs uppercase tracking-[0.3em] text-lime-300/80">{user.role}</span>
                Sign out
              </AppButton>
            ) : (
              <AppButton variant="outline" onClick={() => navigate('/login')} className="hidden md:inline-flex">
                Sign in
              </AppButton>
            )}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="fixed inset-0 z-40 bg-black/95 backdrop-blur-md pt-20 sm:pt-24 px-6 md:hidden animate-fade-in overflow-y-auto"
        >
          <nav className="flex flex-col gap-4 sm:gap-6 text-xl sm:text-2xl font-light" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `text-left border-b border-zinc-800 pb-4 py-2 ${isActive ? 'text-white' : 'text-zinc-300'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {user && user.role === 'admin' && (
              <NavLink
                to="/content"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `text-left border-b border-zinc-800 pb-4 py-2 ${isActive ? 'text-white' : 'text-lime-400'}`
                }
              >
                Manage Content
              </NavLink>
            )}
            <button
              className="text-left border-b border-zinc-800 pb-4 py-2 text-zinc-300"
              onClick={() => {
                setMobileOpen(false);
                if (user) {
                  logout();
                  navigate('/', { replace: true });
                } else {
                  navigate('/login');
                }
              }}
            >
              {user ? 'Sign out' : 'Sign in'}
            </button>
          </nav>
        </div>
      )}

      <main id="main-content" className="pt-24 sm:pt-32 pb-16 sm:pb-24 relative" tabIndex={-1}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-emerald-900/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-lime-900/10 rounded-full blur-[100px]" />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-zinc-900 bg-black py-8 sm:py-10" role="contentinfo">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center text-zinc-500 text-sm gap-4">
          <p>© {new Date().getFullYear()} Olive Audio Lab. All rights reserved.</p>
          <nav className="flex gap-6" aria-label="Social media links">
            <a href="https://www.instagram.com/jerrymartin050?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Follow on Instagram">Instagram</a>
            <a href="https://open.spotify.com/artist/7HLVwydcZhCpj92ZDUCxlw?si=APfyqvR2SZeX0nJCpyre0A" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Listen on Spotify">Spotify</a>
            <a href="https://music.apple.com/us/artist/jerry-martin/1542172902" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Listen on Apple Music">Apple Music</a>
          </nav>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
      <BackToTopButton />
    </div>
  );
};

export default MainLayout;
