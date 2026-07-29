'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useRouter } from 'next/navigation';
import { usePlayer } from '@/context/PlayerContext';

export function QuickPicksGrid() {
  const router = useRouter();
  const { playSong } = usePlayer();
  
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['quickPicks'],
    queryFn: async () => {
      const res = await fetch('/api/music/search?q=top+hits');
      if (!res.ok) throw new Error('Failed to fetch quick picks');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
          <PlayCircle className="w-6 h-6 text-primary" /> Quick Picks
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 md:h-20 w-full rounded-xl bg-background/40" />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
        <PlayCircle className="w-6 h-6 text-primary" /> Quick Picks
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((track: any, idx: number) => (
          <motion.div 
            key={track.id || idx} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: idx * 0.05 }}
            onClick={() => playSong({
              song_uri: track.uri,
              song_title: track.title,
              song_artist: track.artist,
              song_image: track.image
            })}
          >
            <Card className="glass-panel group cursor-pointer overflow-hidden hover:bg-accent/20 transition-all border-white/5 hover:border-primary/30 h-16 md:h-20 bg-background/40 shadow-sm">
              <div className="flex items-center h-full">
                <img 
                  src={track.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80'} 
                  alt={track.title} 
                  className="w-16 h-16 md:w-20 md:h-20 object-cover shadow-lg bg-secondary/20" 
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80'; }}
                />
                <div className="flex-1 px-4 overflow-hidden">
                  <p className="font-semibold text-sm truncate text-white drop-shadow-sm" title={track.title}>{track.title}</p>
                </div>
                <div className="px-3 md:px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <PlayCircle className="w-8 h-8 md:w-10 md:h-10 text-primary fill-primary/20 shadow-xl rounded-full transition-transform hover:scale-110" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
