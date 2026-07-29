'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PlayCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useRouter } from 'next/navigation';
import { usePlayer } from '@/context/PlayerContext';

interface CarouselSectionProps {
  title: string;
  icon?: React.ReactNode;
  queryKey: string[];
  endpoint: string;
}

export function CarouselSection({ title, icon, queryKey, endpoint }: CarouselSectionProps) {
  const router = useRouter();
  const { playSong } = usePlayer();
  
  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch data');
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (isLoading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          {icon} {title}
        </h2>
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[160px] md:min-w-[200px] space-y-4">
              <Skeleton className="w-full aspect-square rounded-xl bg-background/40" />
              <Skeleton className="h-4 w-3/4 bg-background/40" />
              <Skeleton className="h-3 w-1/2 bg-background/40" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        {icon} {title}
      </h2>
      <div className="flex gap-6 overflow-x-auto pb-6 snap-x">
        {items.map((track: any, idx: number) => (
          <motion.div 
            key={track.id || idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="w-[180px] md:w-[220px] shrink-0 snap-start group cursor-pointer"
            onClick={() => playSong({
              song_uri: track.uri,
              song_title: track.title,
              song_artist: track.artist,
              song_image: track.image
            })}
          >
            <Card className="glass-panel p-4 h-full border-white/5 hover:border-primary/30 transition-all bg-background/40 hover:bg-background/60 shadow-lg">
              <div className="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-xl">
                <img 
                  src={track.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80'} 
                  alt={track.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 bg-secondary/20" 
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80'; }}
                />
                
                {/* Progress Bar for 'Continue Listening' */}
                {track.progress !== undefined && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${track.progress}%` }} 
                    />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <PlayCircle className="w-14 h-14 text-primary fill-primary/20 shadow-xl rounded-full" />
                </div>
              </div>
              <div className="overflow-hidden">
                <h3 className="font-semibold text-sm md:text-base truncate mb-1 text-white" title={track.title}>{track.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground truncate" title={track.artist}>{track.artist}</p>
              </div>
              
              {track.lastListened && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 opacity-70">
                  <Clock className="w-3 h-3" /> {track.lastListened}
                </p>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
