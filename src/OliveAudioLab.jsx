import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, ShoppingBag, X, Menu, ChevronRight, 
  Award, Mic2, Star, Quote, Headphones, Disc, Volume2 
} from 'lucide-react';
import { useCart } from './context/CartContext.jsx';
import { useCatalog } from './context/CatalogContext.jsx';
import { TESTIMONIALS_CLIENTS, EXPERT_REVIEWS } from './data/catalog.js';

// --- COMPONENTS ---

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
  const { items: cartItems, addItem, removeItem, total } = useCart();
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle Scroll Effect for Navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Player Logic
  const togglePlay = (song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const addToCart = (song) => {
    addItem(song);
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    removeItem(id);
  };

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
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-8 h-8 bg-gradient-to-br from-lime-400 to-emerald-600 rounded-full flex items-center justify-center">
              <span className="font-bold text-black text-xs">OL</span>
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
            <button 
              className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={20} />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-lime-500 text-black text-[10px] font-bold flex items-center justify-center rounded-full">
                  {cartItems.length}
                </span>
              )}
            </button>
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
           <div className="absolute inset-x-0 top-0 bottom-0 bg-cover bg-center bg-no-repeat opacity-80" style={{backgroundImage: 'url("/src/assets/OliveAudioLabBrick.jpg")'}} />
           
           {/* Dark gradient overlay for text area */}
           <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/60" />
           
           {/* Abstract Background Gradient Overlays - moved to sides */}
           <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/15 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-lime-900/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto relative z-10 text-center">
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
          <div className="flex flex-col md:flex-row justify-center gap-4">
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
            {songs.map((song) => (
              <div key={song.id} className="group relative bg-zinc-900 rounded-2xl overflow-hidden hover:bg-zinc-800 transition-all duration-500 cursor-pointer border border-zinc-800/50 hover:border-zinc-700">
                {/* Mock Album Art based on color */}
                <div className={`h-48 w-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden`}>
                   <div className={`absolute inset-0 bg-${song.cover}-500/10 group-hover:bg-${song.cover}-500/20 transition-colors`} />
                   <Disc className="text-zinc-700 w-20 h-20 group-hover:scale-110 transition-transform duration-700" />
                   
                   <button 
                    onClick={() => togglePlay(song)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
                   >
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-2xl transform scale-50 group-hover:scale-100 transition-transform">
                       {currentSong?.id === song.id && isPlaying ? <Pause fill="black" /> : <Play fill="black" className="ml-1" />}
                     </div>
                   </button>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{song.title}</h3>
                      <p className="text-zinc-400 text-sm">{song.artist}</p>
                    </div>
                    <span className="text-xs font-mono bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700">{song.type}</span>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-lg font-medium">${song.price}</span>
                    <Button variant="outline" className="text-xs py-2 px-4 h-auto" onClick={() => addToCart(song)}>
                      Purchase License
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
            {achievements.map((ach) => (
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
                {artists.map((artist) => (
                  <div key={artist.id} className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-colors">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
                      <span className="text-zinc-500 font-bold">{artist.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{artist.name}</h4>
                      <p className="text-sm text-zinc-500">{artist.role}</p>
                    </div>
                  </div>
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
                        {[...Array(5)].map((_,i) => <Star key={i} size={12} fill="currentColor" />)}
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
                   {[...Array(review.rating)].map((_,i) => <Star key={i} size={16} fill="currentColor" />)}
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
              <Button onClick={() => window.location.href='mailto:jerry@oliveaudiolab.com'}>
                Get a Quote
              </Button>
            </div>
          </div>

          <div className="mt-20 flex flex-col md:flex-row justify-between items-center text-zinc-500 text-sm">
             <p>© 2024 Olive Audio Lab. All rights reserved.</p>
             <div className="flex gap-6 mt-4 md:mt-0">
               <a href="#" className="hover:text-white">Instagram</a>
               <a href="#" className="hover:text-white">Twitter</a>
               <a href="#" className="hover:text-white">SoundCloud</a>
             </div>
          </div>
        </div>
      </section>

      {/* --- STICKY PLAYER --- */}
      <div className={`fixed bottom-6 left-0 right-0 px-6 transition-transform duration-500 z-40 ${currentSong ? 'translate-y-0' : 'translate-y-32'}`}>
        <div className="container mx-auto max-w-3xl">
          <div className="bg-zinc-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                 <Headphones size={20} className="text-white" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">{currentSong?.title || "Select a track"}</h4>
                <p className="text-zinc-400 text-xs">{currentSong?.artist}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
               <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform">
                 {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-1" />}
               </button>
               <div className="hidden md:flex items-center gap-2">
                 <Volume2 size={16} className="text-zinc-400" />
                 <div className="w-20 h-1 bg-zinc-600 rounded-full">
                   <div className="w-2/3 h-full bg-white rounded-full" />
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SHOPPING CART DRAWER --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-zinc-900 h-full border-l border-zinc-800 p-8 flex flex-col animate-slide-in-right">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-zinc-500 mt-20">
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex justify-between items-center p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                    <div>
                      <h4 className="font-bold text-sm">{item.title}</h4>
                      <p className="text-xs text-zinc-500">{item.artist}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm">${item.price}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-zinc-500 hover:text-red-400">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-zinc-800 pt-6 mt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-zinc-400">Total</span>
                <span className="text-2xl font-bold font-mono">${total.toFixed(2)}</span>
              </div>
              <Button className="w-full" onClick={() => alert("Checkout simulated! Tracks would be sent to your email.")}>
                Checkout Now
              </Button>
            </div>
          </div>
        </div>
      )}

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