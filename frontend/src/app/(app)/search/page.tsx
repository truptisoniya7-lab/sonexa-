"use client"

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { usePlayer } from '@/context/PlayerContext';
import { Loader2, Play, Plus, Heart, MoreHorizontal, Clock, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { playSong } = usePlayer();
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Sync with URL if it changes externally
  useEffect(() => {
    if (initialQuery !== query) {
      setQuery(initialQuery);
      setDebouncedQuery(initialQuery);
    }
  }, [initialQuery]);

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return null;
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const handlePlay = (song: any) => {
    playSong({
      song_uri: song.uri,
      song_title: song.title,
      song_artist: song.artist,
      song_image: song.image
    });
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Render empty state
  if (!debouncedQuery.trim()) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center pt-32 pb-20 px-8">
        <SearchIcon className="w-16 h-16 text-white/20 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">Search for music</h2>
        <p className="text-white/50 text-center max-w-md">
          Find your favorite songs, artists, albums, podcasts, and more.
        </p>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center pt-32">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const topMatch = results?.[0];
  const songsList = results?.slice(1) || [];

  return (
    <div className="w-full min-h-screen bg-background/50 p-6 md:p-8 overflow-y-auto custom-scrollbar pb-32">
      {/* Category Tabs */}
      <div className="flex items-center gap-3 mb-8 sticky top-0 bg-background/95 backdrop-blur-xl z-10 py-4 -mx-8 px-8 border-b border-white/5">
        <Button variant="default" className="rounded-full px-6 h-9 font-bold tracking-wide text-xs">All</Button>
        <Button variant="ghost" className="rounded-full px-6 h-9 font-bold tracking-wide text-xs bg-white/5 hover:bg-white/10 text-white">Songs</Button>
      </div>

      {!topMatch ? (
        <div className="text-center pt-20 text-white/50">
          No results found for "{debouncedQuery}"
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Top Result Card */}
          <div className="w-full lg:w-[400px] shrink-0">
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Top result</h2>
            <div 
              className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-5 transition-all duration-300 cursor-pointer group relative overflow-hidden h-[240px] flex flex-col justify-end"
              onClick={() => handlePlay(topMatch)}
            >
              <div className="absolute top-5 left-5 w-24 h-24 rounded-lg overflow-hidden shadow-2xl">
                <img src={topMatch.image} alt={topMatch.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="z-10 mt-auto">
                <h3 className="text-3xl font-black text-white mb-1 truncate">{topMatch.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white/70">{topMatch.artist}</span>
                  {topMatch.isVerified && (
                    <span className="bg-white text-black text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm tracking-wider">
                      Verified
                    </span>
                  )}
                  {topMatch.sourceBadge && (
                    <span className="bg-primary/20 text-primary text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm tracking-wider">
                      {topMatch.sourceBadge}
                    </span>
                  )}
                  <span className="bg-white/10 text-white/50 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm tracking-wider">
                    Song
                  </span>
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute bottom-5 right-5 w-14 h-14 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl shadow-primary/20 z-20">
                <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
              </div>
            </div>
          </div>

          {/* Songs List */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Songs</h2>
            <div className="flex flex-col gap-1">
              {results.slice(0, 4).map((song: any, idx: number) => (
                <div 
                  key={song.uri}
                  className="group flex items-center justify-between p-2 rounded-md hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => handlePlay(song)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-12 h-12 rounded shrink-0 overflow-hidden bg-white/5">
                      <img src={song.image} alt={song.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-5 h-5 text-white fill-current" />
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[15px] font-semibold text-white truncate group-hover:text-primary transition-colors">
                        {song.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {song.isVerified && (
                          <span className="bg-white text-black text-[9px] uppercase font-bold px-1 py-[1px] rounded-sm tracking-widest leading-none">
                            V
                          </span>
                        )}
                        <span className="text-sm text-white/50 truncate hover:underline hover:text-white transition-colors">
                          {song.artist}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-white/10 hover:text-white text-white/70">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-white/40 font-medium w-10 text-right mr-2">
                      {formatDuration(song.duration || 0)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-white/10 hover:text-white text-white/70 hidden sm:flex">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center pt-32"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
