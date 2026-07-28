"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Flame, Disc, Radio, Activity, Music, Sparkles, Globe } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { HeroSection } from '@/components/home/HeroSection';
import { CarouselSection } from '@/components/home/CarouselSection';
import { CommunitiesRecommended } from '@/components/home/CommunitiesRecommended';
import { FriendsActivitySidebar } from '@/components/home/FriendsActivitySidebar';
import { useQuery } from '@tanstack/react-query';

const GenresGrid = () => {
  const { data: genres = [] } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const res = await fetch('/api/music/genres');
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
  });

  if (genres.length === 0) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <Disc className="w-6 h-6 text-fuchsia-500" /> Genres
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {genres.map((genre: any) => (
          <div 
            key={genre.id} 
            className={`${genre.color} rounded-xl p-4 h-24 flex items-end justify-start cursor-pointer hover:scale-105 transition-transform shadow-lg relative overflow-hidden`}
          >
            <h3 className="font-bold text-white text-lg relative z-10">{genre.name}</h3>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/20 rounded-full blur-xl" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-12 pt-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-12">
          
          {/* Header & Search */}
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

          {/* Featured Hero */}
          <HeroSection />

          {/* Trending Artists */}
          <CarouselSection 
            title="Trending Artist: The Weeknd" 
            icon={<Flame className="w-6 h-6 text-red-500" />} 
            queryKey={['discover-the-weeknd']} 
            endpoint="/api/music/search?q=The+Weeknd" 
          />
          
          <CarouselSection 
            title="Trending Artist: Taylor Swift" 
            icon={<Flame className="w-6 h-6 text-orange-500" />} 
            queryKey={['discover-taylor-swift']} 
            endpoint="/api/music/search?q=Taylor+Swift" 
          />

          {/* Trending Albums */}
          <CarouselSection 
            title="Trending Album: After Hours" 
            icon={<Disc className="w-6 h-6 text-blue-500" />} 
            queryKey={['discover-after-hours']} 
            endpoint="/api/music/search?q=After+Hours+The+Weeknd+songs" 
          />

          <CarouselSection 
            title="Trending Album: Divide" 
            icon={<Disc className="w-6 h-6 text-cyan-500" />} 
            queryKey={['discover-divide']} 
            endpoint="/api/music/search?q=Divide+Ed+Sheeran+songs" 
          />

          {/* Genres */}
          <GenresGrid />

          {/* New & Rising Artists */}
          <CarouselSection 
            title="New & Rising Artists" 
            icon={<Activity className="w-6 h-6 text-green-500" />} 
            queryKey={['discover-rising']} 
            endpoint="/api/music/search?q=upcoming+rising+artists+songs" 
          />

          {/* Editorial Playlists */}
          <CarouselSection 
            title="Editorial Playlists" 
            icon={<Sparkles className="w-6 h-6 text-purple-500" />} 
            queryKey={['discover-editorial']} 
            endpoint="/api/music/search?q=official+music+playlist" 
          />

          {/* Live Rooms */}
          <CommunitiesRecommended />

          {/* What's Popular Worldwide */}
          <CarouselSection 
            title="What's Popular Worldwide" 
            icon={<Globe className="w-6 h-6 text-blue-400" />} 
            queryKey={['discover-global']} 
            endpoint="/api/music/search?q=global+top+50+songs" 
          />
          
        </div>

        {/* Right Sidebar: Friends Activity */}
        <div className="hidden xl:block xl:col-span-1">
          <FriendsActivitySidebar />
        </div>

      </div>
    </div>
  )
}
