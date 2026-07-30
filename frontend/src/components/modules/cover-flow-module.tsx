'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/context/PlayerContext';

export function CoverFlowModule({ module }: { module: any }) {
  const { playSong } = usePlayer();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['sdui', module.id],
    queryFn: async () => {
      const res = await fetch(module.endpoint);
      if (!res.ok) throw new Error('Failed to fetch data');
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
  });

  const next = () => setCurrentIndex((i) => (i + 1) % items.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + items.length) % items.length);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{module.title}</h2>
        <div className="flex justify-center h-64 items-center">
           <Skeleton className="w-64 h-64 rounded-2xl glass" />
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="space-y-6 relative overflow-hidden preserve-3d py-4">
      <h2 className="text-2xl font-bold tracking-tight text-foreground px-1">{module.title}</h2>
      
      <div className="relative h-80 flex items-center justify-center perspective-1000 group">
        {/* Navigation */}
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
          onClick={prev}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
          onClick={next}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>

        {/* Cover Flow Items */}
        <div className="relative w-full max-w-3xl flex justify-center items-center h-full">
          <AnimatePresence initial={false}>
            {items.map((track: any, i: number) => {
              const isActive = i === currentIndex;
              const offset = (i - currentIndex + items.length) % items.length;
              const isPrev = offset === items.length - 1;
              const isNext = offset === 1;
              
              if (!isActive && !isPrev && !isNext) return null; // Only render 3 at a time for performance

              let x = 0;
              let z = -100;
              let rotateY = 0;
              let scale = 0.8;
              let zIndex = 0;
              let opacity = 0.6;

              if (isActive) {
                x = 0; z = 0; rotateY = 0; scale = 1; zIndex = 10; opacity = 1;
              } else if (isPrev) {
                x = -200; z = -100; rotateY = 40; scale = 0.8; zIndex = 5;
              } else if (isNext) {
                x = 200; z = -100; rotateY = -40; scale = 0.8; zIndex = 5;
              }

              return (
                <motion.div
                  key={track.uri}
                  initial={false}
                  animate={{ x, z, rotateY, scale, zIndex, opacity }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  className="absolute cursor-pointer rounded-2xl shadow-glass-hover"
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => {
                    if (isActive) {
                      playSong({
                        song_uri: track.uri,
                        song_title: track.title,
                        song_artist: track.artist,
                        song_image: track.image
                      });
                    } else if (isPrev) {
                      prev();
                    } else {
                      next();
                    }
                  }}
                >
                  <div className="relative w-64 h-64 rounded-2xl overflow-hidden glass-panel border border-white/10 group/card">
                    <img 
                      src={track.image} 
                      alt={track.title} 
                      className="w-full h-full object-cover transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                      <h3 className="text-lg font-bold text-white truncate">{track.title}</h3>
                      <p className="text-sm text-gray-300 truncate">{track.artist}</p>
                    </div>
                    {isActive && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                        <PlayCircle className="w-16 h-16 text-primary drop-shadow-glow" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
