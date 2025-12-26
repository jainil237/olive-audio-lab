import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
// import { ShoppingBag } from 'lucide-react';
// import { useCart } from '../context/CartContext.jsx';
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
  { label: 'Queries', to: '/queries' },
  // { label: 'Cart & Billing', to: '/cart' },
];

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  // const { items } = useCart();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-lime-500/30 selection:text-lime-200">
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <button
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-black/20">
              <img src={sonicLogo} alt="Olive Audio Lab" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-xl tracking-tight">Olive Audio Lab</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
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

          <div className="flex items-center gap-4">
            {/* <Link className="relative p-2 hover:bg-white/10 rounded-full transition-colors" to="/cart">
              <ShoppingBag size={20} />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-lime-500 text-black text-[10px] font-bold flex items-center justify-center rounded-full">
                  {items.length}
                </span>
              )}
            </Link> */}
            {user ? (
              <AppButton
                variant="secondary"
                className="hidden md:inline-flex gap-2 border border-white/10"
                onClick={() => {
                  logout();
                  navigate('/', { replace: true });
                }}
              >
                <span className="text-xs uppercase tracking-[0.3em] text-lime-300/80">{user.role}</span>
                Sign out
              </AppButton>
            ) : (
              <AppButton variant="outline" onClick={() => navigate('/login')} className="hidden md:inline-flex">
                Sign in
              </AppButton>
            )}
            <button className="md:hidden" onClick={() => setMobileOpen((open) => !open)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden animate-fade-in">
          <div className="flex flex-col gap-6 text-2xl font-light">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `text-left border-b border-zinc-800 pb-4 ${isActive ? 'text-white' : 'text-zinc-300'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              className="text-left border-b border-zinc-800 pb-4 text-zinc-300"
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
          </div>
        </div>
      )}

      <main className="pt-32 pb-24 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-lime-900/10 rounded-full blur-[100px]" />
        </div>
        <div className="container relative z-10 mx-auto px-6">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-zinc-900 bg-black py-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-zinc-500 text-sm">
          <p>© {new Date().getFullYear()} Olive Audio Lab. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="https://www.instagram.com/jerrymartin050?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="hover:text-white">Instagram</a>
            <a href="https://open.spotify.com/artist/7HLVwydcZhCpj92ZDUCxlw?si=APfyqvR2SZeX0nJCpyre0A" className="hover:text-white">Spotify</a>
            <a href="https://music.apple.com/us/artist/jerry-martin/1542172902" className="hover:text-white">Apple Music</a>
          </div>
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
