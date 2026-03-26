import React, { useState, useEffect } from 'react';
import {
  ChevronRight, Award, Mic2, Star, Quote, Menu, X
} from 'lucide-react';
import { useCatalog } from './context/CatalogContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import sonicLogo from './assets/OliveGreenLogo.png';
import oliveBrick from './assets/OliveAudioLabBrick.jpg';
import { useNavigate } from 'react-router-dom';

import SongCard from './components/SongCard.jsx';
import SongStreamingDialog from './components/SongStreamingDialog.jsx';
import ArtistCard from './components/ArtistCard.jsx';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', onClick, className = '' }) => {
  const baseStyle = "px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black";
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200 shadow-lg hover:shadow-xl",
    secondary: "bg-zinc-800/50 text-white backdrop-blur-md border border-zinc-700 hover:bg-zinc-700/50",
    outline: "border border-zinc-600 text-zinc-300 hover:border-white hover:text-white",
    ghost: "text-zinc-400 hover:text-white"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const SectionHeading = ({ children, align = 'center' }) => (
  <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-8 sm:mb-12 text-${align} bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500`}>
    {children}
  </h2>
);


const OliveAudioLab = () => {
  const { songs, artists, achievements, testimonials, reviews, landingSelection } = useCatalog();
  const { user } = useAuth();
  const navigate = useNavigate();

  const spotlightSongs = landingSelection.songIds.length > 0
    ? songs.filter(s => landingSelection.songIds.includes(String(s.id)))
    : songs.filter(s => s.showOnHome);
  const spotlightArtists = landingSelection.artistIds.length > 0
    ? artists.filter(a => landingSelection.artistIds.includes(String(a.id)))
    : artists.filter(a => a.showOnHome);
  const spotlightAchievements = landingSelection.achievementIds.length > 0
    ? achievements.filter(a => landingSelection.achievementIds.includes(String(a.id)))
    : achievements.filter(a => a.showOnHome);
  const spotlightTestimonials = landingSelection.testimonialIds.length > 0
    ? testimonials.filter(t => landingSelection.testimonialIds.includes(String(t.id)))
    : testimonials;
  const spotlightReviews = landingSelection.reviewIds.length > 0
    ? reviews.filter(r => landingSelection.reviewIds.includes(String(r.id)))
    : reviews;

  const [streamSong, setStreamSong] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const bottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
      setIsAtBottom(bottom);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [isMobileMenuOpen]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-lime-500/30 selection:text-lime-200">

      {/* Skip to Content */}
      <a href="#landing-main" className="skip-to-content">
        Skip to main content
      </a>

      {/* --- NAVIGATION --- */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-md py-3 sm:py-4 border-b border-white/10' : 'bg-transparent py-4 sm:py-6'}`}
        aria-label="Landing page navigation"
      >
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)} role="button" tabIndex={0} aria-label="Scroll to top" onKeyDown={(e) => e.key === 'Enter' && window.scrollTo(0, 0)}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center bg-black/20">
              <img src={sonicLogo} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight">Olive Audio Lab</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {['Work', 'Studio', 'Reviews', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {item}
              </button>
            ))}
            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-lime-400 hover:text-lime-300 transition-colors ml-2 sm:ml-4"
              >
                Sign In
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="landing-mobile-menu"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          id="landing-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-40 bg-black/95 backdrop-blur-md pt-20 sm:pt-24 px-6 md:hidden animate-fade-in overflow-y-auto"
        >
          <nav className="flex flex-col gap-4 sm:gap-6 text-xl sm:text-2xl font-light" aria-label="Mobile navigation">
            {['Work', 'Studio', 'Reviews', 'Contact'].map((item) => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="text-left border-b border-zinc-800 pb-4 py-2">
                {item}
              </button>
            ))}
            {!user && (
              <button onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} className="text-left border-b border-zinc-800 pb-4 py-2 text-lime-400">
                Sign In
              </button>
            )}
          </nav>
        </div>
      )}

      <main id="landing-main" tabIndex={-1}>
        {/* --- HERO SECTION --- */}
        <header className="relative pt-28 pb-12 sm:pt-40 sm:pb-20 md:pt-60 md:pb-40 px-4 sm:px-6 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
            <div className="absolute inset-x-0 top-0 bottom-0 bg-cover bg-center bg-no-repeat opacity-80" style={{ backgroundImage: `url(${oliveBrick})`, marginTop: '-10rem' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/60" />
            <div className="hidden sm:block absolute top-[-20%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-emerald-900/15 rounded-full blur-[120px]" />
            <div className="hidden sm:block absolute bottom-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-lime-900/10 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto relative z-10 text-center md:max-w-4xl mt-32 sm:mt-48 md:mt-64 lg:mt-[25.5rem]">
            <span className="inline-block py-1 px-3 rounded-full border border-lime-500/30 text-lime-400 text-xs font-bold tracking-widest uppercase mb-4 sm:mb-6 animate-pulse">
              Sonic Perfection
            </span>

            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500">
              Jerry Martin.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed mb-6 sm:mb-10 px-2">
              Founder of <span className="text-white font-medium">Olive Audio Lab</span>.
              Sculpting sound for the next generation of artists.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button onClick={() => scrollTo('work')}>
                Listen to Works <ChevronRight size={16} />
              </Button>
              <Button variant="secondary" onClick={() => scrollTo('contact')}>
                Book Studio Time
              </Button>
            </div>
          </div>
        </header>

        {/* --- SELECTED WORKS --- */}
        <section id="work" className="py-16 sm:py-24 bg-zinc-950">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <SectionHeading>Selected Works</SectionHeading>
              <Button variant="ghost" onClick={() => navigate('/songs')} className="text-sm">
                View more →
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {spotlightSongs.length > 0 ? (
                spotlightSongs.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    onOpenStreams={setStreamSong}
                    showEmbedPlayer={true}
                  />
                ))
              ) : (
                <div className="col-span-full py-8 sm:py-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                  <p>No selected works to display.</p>
                  <p className="text-xs mt-2">Go to <span className="text-lime-400 cursor-pointer" onClick={() => navigate('/songs')}>Catalogue</span> and check "Show on Home Page".</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* --- ACHIEVEMENTS & STATS --- */}
        <section className="py-16 sm:py-24 border-y border-zinc-900 bg-black relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <SectionHeading>Achievements</SectionHeading>
              <Button variant="ghost" onClick={() => navigate('/achievements')} className="text-sm">
                View more →
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
              {spotlightAchievements.map((ach) => (
                <div key={ach.id} className="text-center p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-900/30 border border-white/5 hover:border-lime-500/30 transition-colors">
                  <Award className="w-10 h-10 sm:w-12 sm:h-12 text-lime-500 mx-auto mb-4 sm:mb-6" />
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{ach.title}</h3>
                  <p className="text-zinc-400 mb-4 text-sm sm:text-base">{ach.desc}</p>
                  <span className="text-sm font-mono text-zinc-600 border border-zinc-800 px-3 py-1 rounded-full">{ach.year}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- HONORABLE CLIENTS & COLLABS --- */}
        <section id="studio" className="py-16 sm:py-24 bg-zinc-950">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-10 sm:gap-16">

              {/* Artists Column */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
                  <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                    <Mic2 className="text-lime-500" /> Featured Artists
                  </h3>
                  <Button variant="ghost" onClick={() => navigate('/artists')} className="text-sm">
                    View more →
                  </Button>
                </div>
                <div className="space-y-4">
                  {spotlightArtists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} className="bg-zinc-900/50 border-zinc-800" />
                  ))}
                </div>
              </div>

              {/* Testimonials Column */}
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center gap-3">
                  <Quote className="text-lime-500" /> Client Stories
                </h3>
                <div className="grid gap-4 sm:gap-6">
                  {spotlightTestimonials.length > 0 ? (
                    spotlightTestimonials.map((t) => (
                      <div key={t.id} className="bg-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-zinc-700 transition-colors">
                        <p className="text-zinc-300 italic mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">"{t.text}"</p>
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm sm:text-base truncate">{t.name}</p>
                            <p className="text-lime-500 text-xs sm:text-sm">{t.role}</p>
                          </div>
                          <div className="flex gap-1 text-amber-500 shrink-0">
                            {[...Array(Number(t.rating) || 5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 italic">No client stories yet.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- INDUSTRY RECOGNITION --- */}
        <section id="reviews" className="py-16 sm:py-24 bg-gradient-to-b from-zinc-950 to-black">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <SectionHeading>Industry Recognition</SectionHeading>
            <p className="text-zinc-400 mb-10 sm:mb-16 max-w-2xl mx-auto text-sm sm:text-base">
              It's not just our clients who love the sound. Olive Audio Lab has been recognized by leading publications in the audio engineering world.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto">
              {spotlightReviews.length > 0 ? (
                spotlightReviews.map((review) => (
                  <div key={review.id} className="bg-zinc-900 p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-zinc-800 relative overflow-hidden group text-left">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    <h4 className="font-serif text-2xl sm:text-3xl mb-4 sm:mb-6 text-white">{review.source}</h4>
                    <p className="text-zinc-400 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                      {review.text}
                    </p>
                    <div className="flex justify-start text-lime-500 gap-1">
                      {[...Array(review.rating || 5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 col-span-full">No industry reviews yet.</p>
              )}
            </div>
          </div>
        </section>

        {/* --- CONTACT / FOOTER --- */}
        <section id="contact" className="py-16 sm:py-24 bg-black border-t border-zinc-900">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="bg-zinc-900 rounded-2xl sm:rounded-[3rem] p-6 sm:p-12 md:p-24 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-lime-500/10 rounded-full blur-[100px] pointer-events-none" />

              <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-8 relative z-10">Let's make a hit.</h2>
              <p className="text-base sm:text-xl text-zinc-400 mb-8 sm:mb-12 max-w-xl mx-auto relative z-10">
                Ready to take your sound to the next level? Olive Audio Lab is currently accepting new projects for Q4.
              </p>
              <div className="relative z-10">
                <Button onClick={() => navigate('/queries')}>
                  Get a Quote
                </Button>
              </div>
            </div>

            <footer className="mt-12 sm:mt-20 flex flex-col md:flex-row justify-between items-center text-zinc-500 text-sm gap-4" role="contentinfo">
              <p>© 2025 Olive Audio Lab. All rights reserved.</p>
              <nav className="flex gap-6" aria-label="Social media links">
                <a href="https://www.instagram.com/jerrymartin050?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Follow on Instagram">Instagram</a>
                <a href="https://open.spotify.com/artist/7HLVwydcZhCpj92ZDUCxlw?si=APfyqvR2SZeX0nJCpyre0A" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Listen on Spotify">Spotify</a>
                <a href="https://music.apple.com/us/artist/jerry-martin/1542172902" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Listen on Apple Music">Apple Music</a>
              </nav>
            </footer>
          </div>
        </section>
      </main>

      {/* Scroll Indicator - hidden on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{
          opacity: isAtBottom ? 0 : 1,
          y: isAtBottom ? 0 : [0, 10, 0]
        }}
        transition={{
          opacity: isAtBottom ? { duration: 0.2 } : { duration: 1, delay: 0.2 },
          y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="hidden sm:flex fixed bottom-8 right-8 z-50 w-6 h-10 border-2 border-zinc-500 rounded-full items-start justify-center p-2 backdrop-blur-sm bg-black/20"
        aria-hidden="true"
      >
        <div className="w-1 h-3 bg-lime-400 rounded-full" />
      </motion.div>

      <SongStreamingDialog open={!!streamSong} onClose={() => setStreamSong(null)} song={streamSong} />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default OliveAudioLab;