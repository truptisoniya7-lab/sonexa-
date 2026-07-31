"use client";

import { useState } from 'react';
import { Search, X, Flame, Disc, Radio, Activity, Music, Sparkles, Globe, MapPin } from 'lucide-react';
import { HeroSection } from '@/components/home/HeroSection';
import { CarouselSection } from '@/components/home/CarouselSection';

import { DiscoverySidebar } from '@/components/home/DiscoverySidebar';
import { useQuery } from '@tanstack/react-query';

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
    <div className="max-w-[1600px] mx-auto pb-12 pt-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-8 lg:space-y-10">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 mb-2">
                Discover
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                 <Sparkles className="w-4 h-4 text-primary" />
                 Explore the world of music
              </p>
            </div>
          </header>

          <HeroSection />

          {/* Trending Songs */}
          <CarouselSection 
            title="🔥 Trending Songs" 
            icon={<Flame className="w-6 h-6 text-red-500" />} 
            queryKey={['discover', 'trending-songs', selectedGenre]} 
            endpoint={buildQueryUrl("Trending Songs")} 
          />

          {/* New Releases */}
          <CarouselSection 
            title="🎧 New Releases" 
            icon={<Music className="w-6 h-6 text-blue-400" />} 
            queryKey={['discover', 'new-releases', selectedGenre]} 
            endpoint={buildQueryUrl("New Release Songs")} 
          />

          {/* Genre Filter inside Flow */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Disc className="w-6 h-6 text-fuchsia-500" /> Genres
              </h2>
              {selectedGenre !== "All" && (
                <button onClick={() => setSelectedGenre("All")} className="text-sm text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
              <div 
                onClick={() => setSelectedGenre("All")}
                className={`${selectedGenre === "All" ? 'bg-primary ring-2 ring-white' : 'bg-zinc-800'} rounded-xl p-4 h-20 flex items-end justify-start cursor-pointer hover:scale-105 transition-all shadow-lg`}
              >
                <h3 className="font-bold text-white text-md">All Genres</h3>
              </div>
              {GENRES.map(genre => (
                <div 
                  key={genre.id} 
                  onClick={() => setSelectedGenre(genre.name)}
                  className={`${genre.color} ${selectedGenre === genre.name ? 'ring-2 ring-white scale-105' : 'opacity-80 hover:opacity-100'} rounded-xl p-4 h-20 flex items-end justify-start cursor-pointer hover:scale-105 transition-all shadow-lg relative overflow-hidden`}
                >
                  <h3 className="font-bold text-white text-md relative z-10">{genre.name}</h3>
                  <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-white/20 rounded-full blur-xl" />
                </div>
              ))}
            </div>
          </section>

          {/* Popular Artists / Popular Albums */}
          <CarouselSection 
            title="⭐ Popular Artists" 
            icon={<Sparkles className="w-6 h-6 text-yellow-400" />} 
            queryKey={['discover', 'popular-artists', selectedGenre]} 
            endpoint={buildQueryUrl("Top Trending Artists")} 
          />


          
        </div>

        {/* Right Sidebar: Discovery Features */}
        <div className="hidden xl:block xl:col-span-1">
          <DiscoverySidebar />
        </div>

      </div>
    </div>
  )
}
