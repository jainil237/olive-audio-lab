import React, { useState, useEffect } from 'react';
import {
  Play, Pause, /* ShoppingBag, */ X, Menu, ChevronRight,
  Award, Mic2, Star, Quote, Headphones, Disc, Volume2
} from 'lucide-react';
// import { useCart } from './context/CartContext.jsx';
import { useCatalog } from './context/CatalogContext.jsx';
import { TESTIMONIALS_CLIENTS, EXPERT_REVIEWS } from './data/catalog.js';
import sonicLogo from './assets/OliveGreenLogo.png';

// --- COMPONENTS ---
import SongCard from './components/SongCard.jsx';
import SongStreamingDialog from './components/SongStreamingDialog.jsx';
import ArtistCard from './components/ArtistCard.jsx';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', onClick, className = '' }) => {
  const baseStyle = "px-6 py-3 rounded-full font-medium transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2";
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
  <h2 className={`text-4xl md:text-5xl font-bold tracking-tight mb-12 text-${align} bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500`}>
    {children}
  </h2>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 p-8 rounded-3xl hover:border-zinc-600 transition-colors duration-500 ${className}`}>
    {children}
  </div>
);

const OliveAudioLab = () => {
  const { songs, artists, achievements } = useCatalog();
  const spotlightSongs = songs.filter(s => s.showOnHome);
  const spotlightArtists = artists.filter(a => a.showOnHome);
  const spotlightAchievements = achievements.filter(a => a.showOnHome);

  // const { items: cartItems, addItem, removeItem, total } = useCart();
  const [streamSong, setStreamSong] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  //const [isPlaying, setIsPlaying] = useState(false); // Legacy state, kept for potential sticky player if reused

  // Handle Scroll Effect for Navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const bottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
      setIsAtBottom(bottom);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Player Logic (Legacy/Sticky - Simplified or removed active usage if conflicting)
  // const togglePlay = (song) => {
  //   // Legacy logic...
  // };

  // const addToCart = (song) => { ... };

  // Scroll to section helper
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-lime-500/30 selection:text-lime-200">

      {/* --- NAVIGATION --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-black/20">
              <img src={sonicLogo} alt="Olive Audio Lab" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-xl tracking-tight">Olive Audio Lab</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Work', 'Studio', 'Reviews', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden animate-fade-in">
          <div className="flex flex-col gap-6 text-2xl font-light">
            {['Work', 'Studio', 'Reviews', 'Contact'].map((item) => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="text-left border-b border-zinc-800 pb-4">
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- HERO SECTION (Apple Style) --- */}
      <header className="relative pt-40 pb-20 md:pt-60 md:pb-40 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          {/* Background Image - contained to sides */}
          <div className="absolute inset-x-0 top-0 bottom-0 bg-cover bg-center bg-no-repeat opacity-80" style={{ backgroundImage: 'url("/src/assets/OliveAudioLabBrick.png")', marginTop: '-18.75rem' }} />

          {/* Dark gradient overlay for text area */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/60" />

          {/* Abstract Background Gradient Overlays - moved to sides */}
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-lime-900/10 rounded-full blur-[100px]" />
        </div>



        <div className="container mx-auto relative z-10 text-center md:text-center md:max-w-4xl" style={{ marginTop: '25.5rem' }}>
          <span className="inline-block py-1 px-3 rounded-full border border-lime-500/30 text-lime-400 text-xs font-bold tracking-widest uppercase mb-6 animate-pulse">
            Sonic Perfection
          </span>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500">
            Jerry Martin.
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Founder of <span className="text-white font-medium">Olive Audio Lab</span>.
            Sculpting sound for the next generation of artists.
          </p>
          <div className="flex flex-col md:flex-row justify-start gap-4">
            <Button variant="ghost" className="order-3 md:order-none" onClick={() => window.location.assign('/login')}>
              Sign in to dashboard
            </Button>
            <Button onClick={() => scrollTo('work')}>
              Listen to Works <ChevronRight size={16} />
            </Button>
            <Button variant="secondary" onClick={() => scrollTo('contact')}>
              Book Studio Time
            </Button>
          </div>
        </div>
      </header>

      {/* --- SELECTED WORKS (Discography) --- */}
      <section id="work" className="py-24 bg-zinc-950">
        <div className="container mx-auto px-6">
          <SectionHeading>Selected Works</SectionHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                <p>No selected works to display.</p>
                <p className="text-xs mt-2">Go to <span className="text-lime-400 cursor-pointer" onClick={() => window.location.assign('/songs')}>Catalogue</span> and check "Show on Home Page".</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- ACHIEVEMENTS & STATS --- */}
      <section className="py-24 border-y border-zinc-900 bg-black relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center justify-between">
            <SectionHeading>Achievements</SectionHeading>
            <Button variant="ghost" onClick={() => window.location.assign('/achievements')} className="text-sm">
              View more →
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {spotlightAchievements.map((ach) => (
              <div key={ach.id} className="text-center p-8 rounded-3xl bg-zinc-900/30 border border-white/5 hover:border-lime-500/30 transition-colors">
                <Award className="w-12 h-12 text-lime-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">{ach.title}</h3>
                <p className="text-zinc-400 mb-4">{ach.desc}</p>
                <span className="text-sm font-mono text-zinc-600 border border-zinc-800 px-3 py-1 rounded-full">{ach.year}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HONORABLE CLIENTS & COLLABS --- */}
      <section id="studio" className="py-24 bg-zinc-950">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16">

            {/* Artists Column */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Mic2 className="text-lime-500" /> Featured Artists
                </h3>
                <Button variant="ghost" onClick={() => window.location.assign('/artists')} className="text-sm">
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
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Quote className="text-lime-500" /> Client Stories
              </h3>
              <div className="grid gap-6">
                {TESTIMONIALS_CLIENTS.map((t) => (
                  <Card key={t.id} className="p-6">
                    <p className="text-zinc-300 italic mb-4 leading-relaxed">"{t.text}"</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-sm">{t.name}</p>
                        <p className="text-lime-500 text-xs">{t.role}</p>
                      </div>
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- INDUSTRY RECOGNITION (Experts) --- */}
      <section id="reviews" className="py-24 bg-gradient-to-b from-zinc-950 to-black">
        <div className="container mx-auto px-6 text-center">
          <SectionHeading>Industry Recognition</SectionHeading>
          <p className="text-zinc-400 mb-16 max-w-2xl mx-auto">
            It's not just our clients who love the sound. Olive Audio Lab has been recognized by leading publications in the audio engineering world.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {EXPERT_REVIEWS.map((review) => (
              <div key={review.id} className="bg-zinc-900 p-10 rounded-3xl border border-zinc-800 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <h4 className="font-serif text-3xl mb-6 text-white">{review.source}</h4>
                <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                  {review.text}
                </p>
                <div className="flex justify-center text-lime-500 gap-1">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTACT / FOOTER --- */}
      <section id="contact" className="py-24 bg-black border-t border-zinc-900">
        <div className="container mx-auto px-6">
          <div className="bg-zinc-900 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
            {/* Background flair */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/10 rounded-full blur-[100px] pointer-events-none" />

            <h2 className="text-5xl md:text-7xl font-bold mb-8 relative z-10">Let's make a hit.</h2>
            <p className="text-xl text-zinc-400 mb-12 max-w-xl mx-auto relative z-10">
              Ready to take your sound to the next level? Olive Audio Lab is currently accepting new projects for Q4.
            </p>
            <div className="relative z-10">
              <Button onClick={() => window.location.href = navigate('/queries')}>
                Get a Quote
              </Button>
            </div>
          </div>

          <div className="mt-20 flex flex-col md:flex-row justify-between items-center text-zinc-500 text-sm">
            <p>© 2025 Olive Audio Lab. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="https://www.instagram.com/jerrymartin050?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="hover:text-white">Instagram</a>
              <a href="https://open.spotify.com/artist/7HLVwydcZhCpj92ZDUCxlw?si=APfyqvR2SZeX0nJCpyre0A" className="hover:text-white">Spotify</a>
              <a href="https://music.apple.com/us/artist/jerry-martin/1542172902" className="hover:text-white">Apple Music</a>
            </div>
          </div>
        </div>
      </section>

      {/* --- STICKY PLAYER (Optional/Legacy) --- */}
      {/* 
      <div className={`fixed bottom-6 left-0 right-0 px-6 transition-transform duration-500 z-40 ${currentSong ? 'translate-y-0' : 'translate-y-32'}`}>
        ... (Sticky player content commented out)
      </div> 
      */}

      {/* Scroll Indicator (Fixed) - Animating the whole mouse to bounce */}
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
        className="fixed bottom-8 right-8 z-50 w-6 h-10 border-2 border-zinc-500 rounded-full flex items-start justify-center p-2 backdrop-blur-sm bg-black/20"
      >
        <div className="w-1 h-3 bg-lime-400 rounded-full" />
      </motion.div>

      <SongStreamingDialog open={!!streamSong} onClose={() => setStreamSong(null)} song={streamSong} />

      {/* Styles for animations */}
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