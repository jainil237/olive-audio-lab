import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SongCard from '../components/SongCard.jsx';
import ArtistCard from '../components/ArtistCard.jsx';
import AchievementTimeline from '../components/AchievementTimeline.jsx';
import { AppButton, SectionHeading, GlassCard } from '../components/ui/primitives.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import SongStreamingDialog from '../components/SongStreamingDialog.jsx';

const Home = () => {
  const { songs, artists, achievements } = useCatalog();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [streamSong, setStreamSong] = useState(null);

  const spotlightSongs = songs.slice(0, 3);
  const spotlightArtists = artists.slice(0, 4);

  return (
    <div className="space-y-24 text-white">
      <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-black via-zinc-900 to-zinc-950 p-10 md:p-20 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] right-[-20%] w-[520px] h-[520px] bg-emerald-500/15 blur-[140px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[420px] h-[420px] bg-lime-500/15 blur-[120px]" />
        </div>
        <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
          <span className="inline-block text-xs tracking-[0.3em] uppercase text-lime-300/90">Sonic Perfection</span>
          <h1 className="text-5xl md:text-[4.5rem] font-bold tracking-tight leading-[1.05]">
            Olive Audio Lab
          </h1>
          <p className="text-lg md:text-xl text-zinc-300">
            Crafted productions, mixes and masters for the next generation of artists.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <AppButton variant="primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Experience the Lab
            </AppButton>
            <AppButton variant="secondary" onClick={() => (window.location.href = 'mailto:jerry@oliveaudiolab.com')}>
              Start a project
            </AppButton>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <SectionHeading align="left" eyebrow="Catalogue">
            Selected Works
          </SectionHeading>
          <AppButton variant="ghost" className="text-sm" onClick={() => navigate('/songs')}>
            View all songs →
          </AppButton>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {spotlightSongs.map((song) => (
            <SongCard key={song.id} song={song} onAdd={addItem} onOpenStreams={setStreamSong} />
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <SectionHeading align="left" eyebrow="Collaborators">
            Featured Artists
          </SectionHeading>
          <AppButton variant="ghost" className="text-sm" onClick={() => navigate('/artists')}>
            Meet all collaborators →
          </AppButton>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {spotlightArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <SectionHeading align="left" eyebrow="Recognition">
            Achievements & Awards
          </SectionHeading>
          <AppButton variant="ghost" className="text-sm" onClick={() => navigate('/achievements')}>
            View full history →
          </AppButton>
        </div>
        <AchievementTimeline achievements={achievements.slice(0, 4)} />
      </section>

      <GlassCard className="bg-zinc-900/70">
        <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <div className="space-y-3 max-w-2xl">
            <p className="uppercase tracking-[0.35em] text-xs text-lime-300/80">Collaboration</p>
            <h3 className="text-3xl font-semibold">Ready to craft your next record?</h3>
            <p className="text-zinc-400">
              Submit a project brief and we will respond within 24 hours with timelines, deliverables and a quote.
            </p>
          </div>
          <AppButton variant="primary" onClick={() => navigate('/queries')}>
            Submit a query
          </AppButton>
        </div>
      </GlassCard>

      <SongStreamingDialog open={!!streamSong} onClose={() => setStreamSong(null)} song={streamSong} />
    </div>
  );
};

export default Home;
