"use client";

import { useState } from 'react';
import { Search, X, Flame, Disc, Radio, Activity, Music, Sparkles, Globe, MapPin } from 'lucide-react';
import { HeroSection } from '@/components/home/HeroSection';
import { CarouselSection } from '@/components/home/CarouselSection';
import { CommunitiesRecommended } from '@/components/home/CommunitiesRecommended';
import { FriendsActivitySidebar } from '@/components/home/FriendsActivitySidebar';
import { useQuery } from '@tanstack/react-query';

const LANGUAGES = [
  "Hindi", "Punjabi", "Tamil", "Telugu", 
  "Malayalam", "Kannada", "Marathi", "Bengali", 
  "Gujarati", "English"
];

const GENRES = [
  { id: 'g1', name: 'Pop', color: 'bg-pink-500' },
  { id: 'g2', name: 'Bollywood', color: 'bg-orange-500' },
  { id: 'g3', name: 'Hip-Hop', color: 'bg-blue-500' },
  { id: 'g4', name: 'Rock', color: 'bg-red-500' },
  { id: 'g5', name: 'EDM', color: 'bg-indigo-500' },
  { id: 'g6', name: 'Lo-fi', color: 'bg-purple-500' }
];

export default function DiscoverPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");

  const buildQueryUrl = (sectionQuery: string) => {
    const params = new URLSearchParams();
    if (selectedLanguage !== "All") params.set('language', selectedLanguage);
    if (selectedGenre !== "All") params.set('genre', selectedGenre);
    params.set('section', sectionQuery);
    return `/api/music/discover?${params.toString()}`;
  };

  const discoverSections = [
    { id: "trending", title: "🔥 Trending Now", query: "Trending Songs" },
    { id: "india", title: "🇮🇳 Trending in India", query: "Trending India Songs" },
    { id: "new", title: "🎧 New Releases", query: "New Release Songs" },
    { id: "albums", title: "💿 Popular Albums", query: "Popular Album Playlists" },
    { id: "artists", title: "⭐ Trending Artists", query: "Top Trending Artists" },
  ];

  const regionalSections = [
    { id: "regional1", title: `🎬 ${selectedLanguage === "All" ? "Tamil" : selectedLanguage} Hits`, query: `${selectedLanguage === "All" ? "Tamil" : selectedLanguage} Hits Songs` },
    { id: "regional2", title: `🎭 ${selectedLanguage === "All" ? "Telugu" : selectedLanguage} Hits`, query: `${selectedLanguage === "All" ? "Telugu" : selectedLanguage} Trending Hits` },
    { id: "regional3", title: `🎵 Punjabi Vibes`, query: `Punjabi Hit Songs` },
    { id: "regional4", title: `🎤 Bollywood Hits`, query: `Bollywood Hit Songs` },
  ];

  return (
    <div className="max-w-[1600px] mx-auto pb-12 pt-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-12">
          
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

          {/* Filters */}
          <div className="space-y-8">
            {/* Language Filter */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-500" /> Browse by Language
                </h2>
                {selectedLanguage !== "All" && (
                  <button onClick={() => setSelectedLanguage("All")} className="text-sm text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
                    <X className="w-4 h-4" /> Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setSelectedLanguage("All")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedLanguage === "All" ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10 text-zinc-300'}`}
                >
                  All
                </button>
                {LANGUAGES.map(lang => (
                  <button 
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedLanguage === lang ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10 text-zinc-300'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </section>

            {/* Genre Filter */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Disc className="w-5 h-5 text-fuchsia-500" /> Browse by Genre
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
          </div>

          <hr className="border-white/10" />

          {/* Trending Sections */}
          <div className="space-y-12">
            {discoverSections.map(section => (
              <CarouselSection 
                key={section.id}
                title={section.title} 
                icon={<Flame className="w-6 h-6 text-red-500" />} 
                queryKey={['discover', section.id, selectedLanguage, selectedGenre]} 
                endpoint={buildQueryUrl(section.query)} 
              />
            ))}
          </div>

          <hr className="border-white/10" />

          {/* Regional Highlights */}
          <div className="space-y-12">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-400">Based on Language</h2>
            {regionalSections.map(section => (
              <CarouselSection 
                key={section.id}
                title={section.title} 
                icon={<Globe className="w-6 h-6 text-blue-400" />} 
                queryKey={['discover', section.id, selectedLanguage, selectedGenre]} 
                endpoint={buildQueryUrl(section.query)} 
              />
            ))}
          </div>

          <hr className="border-white/10" />

          {/* Personalized Highlights */}
          <div className="space-y-12">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-400">Personalized for You</h2>
            <CarouselSection 
              title="❤️ Recommended" 
              icon={<Sparkles className="w-6 h-6 text-pink-500" />} 
              queryKey={['discover', 'recommended', selectedLanguage, selectedGenre]} 
              endpoint={buildQueryUrl('Recommended Songs Based on History')} 
            />
            <CarouselSection 
              title="🔄 Recently Played Vibe" 
              icon={<Activity className="w-6 h-6 text-green-500" />} 
              queryKey={['discover', 'recent', selectedLanguage, selectedGenre]} 
              endpoint={buildQueryUrl('Songs similar to recently played')} 
            />
          </div>

          <hr className="border-white/10" />

          {/* Community */}
          <CommunitiesRecommended />
          
        </div>

        {/* Right Sidebar: Friends Activity */}
        <div className="hidden xl:block xl:col-span-1">
          <FriendsActivitySidebar />
        </div>

      </div>
    </div>
  )
}
