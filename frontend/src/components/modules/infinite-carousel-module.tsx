'use client';

import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlayer } from '@/context/PlayerContext';

export function InfiniteCarouselModule({ module }: { module: any }) {
  const { playSong } = usePlayer();
  const baseVelocity = -0.5; // Negative to move left
  const baseX = useMotionValue(0);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['sdui', module.id, module.endpoint],
    queryFn: async () => {
      const res = await fetch(module.endpoint);
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      return json.raw || json.items || json;
    },
    staleTime: module.caching?.ttl !== undefined ? module.caching.ttl * 1000 : 60000,
  });

  useAnimationFrame((t, delta) => {
    let moveBy = baseVelocity * (delta / 16);
    
    // Wrap around logic. Assuming each item is ~200px wide + 16px gap = 216px
    // The exact wrapping width depends on item count. We duplicate items in render.
    const width = items.length * 216; 
    
    if (width > 0) {
      let nextX = baseX.get() + moveBy;
      if (nextX <= -width) {
        nextX += width;
      }
      baseX.set(nextX);
    }
  });

  if (isLoading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground px-1">{module.title}</h2>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-[200px] h-64 rounded-2xl glass shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  // We duplicate the items a few times to ensure smooth infinite scrolling
  const displayItems = [...items, ...items, ...items];

  return (
    <section className="space-y-6 relative overflow-hidden py-4">
      <h2 className="text-2xl font-bold tracking-tight text-foreground px-1">{module.title}</h2>
      
      {/* Left/Right Fade Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="overflow-hidden flex -mx-1" style={{ whiteSpace: 'nowrap' }}>
        <motion.div 
          className="flex gap-4 px-1"
          style={{ x: baseX }}
        >
          {displayItems.map((track: any, idx: number) => (
            <motion.div
              key={`${track.uri}-${idx}`}
              whileHover={{ y: -8, scale: 1.02 }}
              className="w-[200px] shrink-0 cursor-pointer group"
              onClick={() => playSong({
                song_uri: track.uri,
                song_title: track.title,
                song_artist: track.artist,
                song_image: track.image
              })}
            >
              <div className="glass-panel p-3 h-full border-white/5 group-hover:border-primary/30 transition-all duration-300 bg-background/40 group-hover:bg-white/10 shadow-glass group-hover:shadow-glass-hover rounded-2xl relative overflow-hidden flex flex-col">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-xl shrink-0">
                  <img 
                    src={track.image} 
                    alt={track.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 bg-secondary/20" 
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-12 h-12 text-primary fill-primary/20" />
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">{track.title}</span>
                  <span className="text-xs text-muted-foreground truncate">{track.artist}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
