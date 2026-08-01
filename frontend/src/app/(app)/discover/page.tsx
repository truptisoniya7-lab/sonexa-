"use client";

import { useState } from 'react';
import { Search, X, Flame, Disc, Radio, Activity, Music, Sparkles, Globe, MapPin, Heart, Clock, BarChart } from 'lucide-react';
import { HeroSection } from '@/components/home/HeroSection';
import { CarouselSection } from '@/components/home/CarouselSection';
import { motion } from 'framer-motion';

const GENRES = [
  { id: 'g1', name: 'Pop', color: 'bg-pink-500' },
  { id: 'g2', name: 'Bollywood', color: 'bg-orange-500' },
  { id: 'g3', name: 'Hip-Hop', color: 'bg-blue-500' },
  { id: 'g4', name: 'Rock', color: 'bg-red-500' },
  { id: 'g5', name: 'EDM', color: 'bg-indigo-500' },
  { id: 'g6', name: 'Lo-fi', color: 'bg-purple-500' }
];

export default function DiscoverPage() {
  const [selectedGenre, setSelectedGenre] = useState<string>("All");

  const buildQueryUrl = (sectionQuery: string) => {
    const params = new URLSearchParams();
    if (selectedGenre !== "All") params.set('genre', selectedGenre);
    params.set('section', sectionQuery);
    return `/api/music/discover?${params.toString()}`;
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-12 pt-6 px-4">
      <div className="w-full space-y-10 lg:space-y-14">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 mb-2 drop-shadow-sm">
                Discover
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                 <Sparkles className="w-4 h-4 text-primary" />
                 Explore the world of music
              </p>
            </div>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HeroSection />
          </motion.div>

          {/* Genre Filter inside Flow */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[28px] md:text-3xl font-black tracking-tight flex items-center gap-2">
                    🎧 Browse by Genre
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium">Explore specific sounds and styles.</p>
                </div>
                {selectedGenre !== "All" && (
                  <button onClick={() => setSelectedGenre("All")} className="text-sm text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
                    <X className="w-4 h-4" /> Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 px-1">
                <div 
                  onClick={() => setSelectedGenre("All")}
                  className={`${selectedGenre === "All" ? 'bg-primary ring-2 ring-white' : 'bg-zinc-800'} rounded-[24px] p-5 h-24 flex items-end justify-start cursor-pointer hover:scale-105 transition-all shadow-lg border border-white/5 group`}
                >
                  <h3 className="font-extrabold text-white text-lg tracking-tight group-hover:drop-shadow-md">All Genres</h3>
                </div>
                {GENRES.map(genre => (
                  <div 
                    key={genre.id} 
                    onClick={() => setSelectedGenre(genre.name)}
                    className={`${genre.color} ${selectedGenre === genre.name ? 'ring-2 ring-white scale-105' : 'opacity-90 hover:opacity-100'} rounded-[24px] p-5 h-24 flex items-end justify-start cursor-pointer hover:scale-105 hover:-translate-y-1 transition-all shadow-lg relative overflow-hidden group border border-white/10`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-0" />
                    <h3 className="font-extrabold text-white text-lg tracking-tight relative z-10 group-hover:drop-shadow-md">{genre.name}</h3>
                    <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors" />
                  </div>
                ))}
              </div>
            </section>
          </motion.div>

          {/* Trending Songs */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <CarouselSection 
              title="🔥 Trending Songs" 
              subtitle="Most played in your country today."
              queryKey={['discover', 'trending-songs', selectedGenre]} 
              endpoint={buildQueryUrl("Trending Songs")} 
            />
          </motion.div>

          {/* Recommended For You */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <CarouselSection 
              title="🎵 Recommended For You" 
              subtitle="Curated picks based on your recent activity."
              queryKey={['discover', 'recommended', selectedGenre]} 
              endpoint={buildQueryUrl("Recommended Songs Based on History")} 
            />
          </motion.div>

          {/* Because You Listened To... */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <CarouselSection 
              title="🔄 Because You Listened To..." 
              subtitle="Deep dives into vibes you've been loving."
              queryKey={['discover', 'similar', selectedGenre]} 
              endpoint={buildQueryUrl("Songs similar to recently played")} 
            />
          </motion.div>


          {/* New Releases */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <CarouselSection 
              title="💿 New Releases" 
              subtitle="Fresh tracks hitting the airwaves."
              queryKey={['discover', 'new-releases', selectedGenre]} 
              endpoint={buildQueryUrl("New Release Songs")} 
            />
          </motion.div>

          {/* Popular Artists */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <CarouselSection 
              title="🎤 Popular Artists" 
              subtitle="The voices defining the charts right now."
              queryKey={['discover', 'popular-artists', selectedGenre]} 
              endpoint={buildQueryUrl("Top Trending Artists")} 
            />
          </motion.div>

          {/* Top Charts */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <CarouselSection 
              title="📈 Top Charts" 
              subtitle="The most popular music globally."
              queryKey={['discover', 'top-charts', selectedGenre]} 
              endpoint={buildQueryUrl("Top Charts")} 
            />
          </motion.div>
          
        </div>
    </div>
  )
}
