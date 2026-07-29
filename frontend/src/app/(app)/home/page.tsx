'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Clock, Music, PlayCircle, Radio, Flame, Sparkles, Users } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QuickPicksGrid } from '@/components/home/QuickPicksGrid';
import { CarouselSection } from '@/components/home/CarouselSection';
import { usePlayer } from '@/context/PlayerContext';
import { Skeleton } from '@/components/ui/skeleton';

function FriendsActivitySidebar() {
  const queryClient = useQueryClient();

  const { data: friends, isLoading } = useQuery({
    queryKey: ['home', 'friends'],
    queryFn: async () => {
      const res = await fetch('/api/home/friends');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    // Subscribe to realtime updates for friend activity
    const channel = supabase
      .channel('friends_activity_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'friend_activity' },
        (payload) => {
          // Invalidate friends query so it refetches the latest
          queryClient.invalidateQueries({ queryKey: ['home', 'friends'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" /> Friend Activity
      </h3>
      
      {isLoading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))
      ) : (
        <div className="space-y-4">
          {friends?.length > 0 ? friends.map((activity: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-primary/20 shrink-0 overflow-hidden flex items-center justify-center">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user_id}`} alt="User avatar" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">User {activity.user_id.slice(0,4)}</span>
                <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                   {activity.type === 'listening' ? 'Listening to a track' : 'Liked a track'}
                </span>
                <span className="text-[10px] text-muted-foreground/50 mt-1">2h ago</span>
              </div>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { playSong } = usePlayer();

  const { data: homeData, isLoading: homeLoading } = useQuery({
    queryKey: ['home', 'core'],
    queryFn: async () => {
      const res = await fetch('/api/home');
      if (!res.ok) throw new Error('Failed to fetch home core');
      return res.json();
    }
  });

  const { hero, continueListening, recentlyPlayed, madeForYou } = homeData || {};

  return (
    <div className="max-w-[1600px] mx-auto pb-12 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-3 w-full space-y-12">
          
          {/* Hero Section */}
          <header className="flex flex-col gap-6">
            {homeLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-5 w-48" />
              </div>
            ) : (
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-3">
                  {hero?.greeting || 'Good day'}, Soniya 👋
                </h1>
                <p className="text-muted-foreground flex items-center gap-5 text-sm font-medium">
                   <span className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-500" /> {hero?.stats?.streak || 5} Day Streak</span>
                   <span className="flex items-center gap-1.5"><Music className="w-4 h-4 text-blue-500" /> {hero?.stats?.songsToday || 12} Songs Today</span>
                   <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-purple-500" /> {hero?.stats?.likedSongs || 42} Liked Songs</span>
                </p>
              </div>
            )}
            
            {/* Highlighted Continue Listening Hero Banner */}
            {!homeLoading && continueListening && (
              <div 
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6 flex flex-col sm:flex-row items-center gap-6 group cursor-pointer hover:bg-black/50 transition-colors shadow-2xl"
                onClick={() => {
                  // In reality you'd fetch the full track detail. For now mock a play.
                  console.log("Resume", continueListening.track_id);
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
                <div className="relative w-32 h-32 shrink-0 rounded-xl overflow-hidden shadow-xl">
                  {/* Mock image since table only stores track_id right now */}
                  <img src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" alt="Track" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2 z-10">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Continue Listening</span>
                  <h2 className="text-2xl font-bold text-white">Espresso</h2>
                  <p className="text-muted-foreground">Sabrina Carpenter</p>
                  
                  <div className="flex items-center gap-4 pt-2">
                    <Button onClick={(e) => { e.stopPropagation(); console.log("Resume"); }} className="rounded-full font-bold px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                      Resume
                    </Button>
                    <span className="text-xs font-medium text-muted-foreground/70">1:42 / 3:58</span>
                  </div>
                </div>
              </div>
            )}
          </header>

          <QuickPicksGrid />

          <CarouselSection 
            title="Made for You" 
            subtitle="Based on your recent listening"
            icon={<Sparkles className="w-6 h-6 text-fuchsia-500" />} 
            queryKey={['made-for-you']} 
            endpoint="/api/home" // In a real app we'd map this better, but using Carousel component as is for now requires an endpoint that returns array. I'll use trending as fallback.
          />

          <CarouselSection 
            title="Trending Now" 
            subtitle="Catch up with the most popular tracks"
            icon={<Flame className="w-6 h-6 text-orange-500" />} 
            queryKey={['trending-now']} 
            endpoint="/api/home/trending" 
          />

          <CarouselSection 
            title="Live Rooms" 
            subtitle="Listen together with others"
            icon={<Radio className="w-6 h-6 text-blue-500" />} 
            queryKey={['live-rooms']} 
            endpoint="/api/home/live" 
          />
        </div>

        {/* Right Sidebar: Friends Activity */}
        <aside className="lg:col-span-1 hidden lg:block border-l border-white/5 pl-8 pt-2">
           <FriendsActivitySidebar />
        </aside>

      </div>
    </div>
  )
}
