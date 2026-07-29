'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Clock, Music } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { QuickPicksGrid } from '@/components/home/QuickPicksGrid';
import { CarouselSection } from '@/components/home/CarouselSection';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [greeting, setGreeting] = useState('Good evening');

  const { data: profile } = useQuery({
    queryKey: ['profile', 1],
    queryFn: async () => {
      const res = await fetch('/api/profile/1');
      if (!res.ok) return null;
      return res.json();
    }
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to a dedicated search page or handle search results
      // For now, let's keep it simple
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col gap-8">
        
        {/* Main Content Area */}
        <div className="w-full space-y-12">
          
          {/* Header & Search */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-2">
                {greeting}{profile?.user?.name ? `, ${profile.user.name}` : ''}
              </h1>
              <p className="text-muted-foreground flex items-center gap-4 text-sm font-medium">
                 <span>🔥 5 Day Streak</span>
                 <span>🎵 12 Songs Today</span>
                 <span>🎧 Pop Enthusiast</span>
              </p>
            </div>
          </header>

          {/* Quick Picks */}
          <QuickPicksGrid />

          {/* Modular Carousels */}
          <CarouselSection 
            title="Continue Listening" 
            icon={<Clock className="w-6 h-6 text-primary" />} 
            queryKey={['recent']} 
            endpoint="/api/history/recent/1" 
          />

          <CarouselSection 
            title="Made for You" 
            icon={<Music className="w-6 h-6 text-fuchsia-500" />} 
            queryKey={['made-for-you']} 
            endpoint="/api/music/search?q=for+you+mix" 
          />

          <CarouselSection 
            title="Trending Now" 
            icon={<Music className="w-6 h-6 text-orange-500" />} 
            queryKey={['trending-now']} 
            endpoint="/api/music/search?q=trending+songs" 
          />
          
          <CarouselSection 
            title="Because you listened to Ed Sheeran" 
            icon={<Music className="w-6 h-6 text-blue-500" />} 
            queryKey={['because-ed-sheeran']} 
            endpoint="/api/music/search?q=pop+songs" 
          />

          <CarouselSection 
            title="Favourite Artists" 
            icon={<Music className="w-6 h-6 text-red-500" />} 
            queryKey={['favourite-artists']} 
            endpoint="/api/music/search?q=Arijit+Singh" 
          />

          <CarouselSection 
            title="New Releases" 
            icon={<Music className="w-6 h-6 text-green-500" />} 
            queryKey={['new-releases']} 
            endpoint="/api/music/search?q=new+releases+music" 
          />
          
        </div>

      </div>
    </div>
  )
}
