'use client';

import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Clock, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

import { useRouter } from 'next/navigation';
import { usePlayer } from '@/context/PlayerContext';

interface CarouselSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  queryKey: string[];
  endpoint: string;
}

export function CarouselSection({ title, subtitle, icon, queryKey, endpoint }: CarouselSectionProps) {
  const router = useRouter();
  const { playSong } = usePlayer();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: items = [], isLoading } = useQuery({
    queryKey: [...queryKey, endpoint],
    queryFn: async () => {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      return json.raw || json.items || json;
    },
    staleTime: 60000, // 1 minute instead of 1 hour
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 50 : scrollLeft + clientWidth - 50;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-end justify-between px-2 mb-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-[28px] md:text-3xl font-black tracking-tight flex items-center gap-2">
              {icon && icon} {title}
            </h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>
        <div className="flex gap-4 md:gap-6 lg:gap-8 overflow-x-auto pb-6 scrollbar-none snap-x">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[240px] sm:min-w-[280px] md:min-w-[200px] xl:min-w-[220px] space-y-4">
              <Skeleton className="w-full aspect-square rounded-[16px] bg-background/40" />
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
    <section className="space-y-6 relative group/section">
      <div className="flex items-end justify-between px-2 mb-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-[28px] md:text-3xl font-black tracking-tight flex items-center gap-2 text-foreground">
            {icon && icon} {title}
          </h2>
          {subtitle && <p className="text-sm text-muted-foreground font-medium">{subtitle}</p>}
        </div>
        {items.length > 5 && (
          <Button 
            variant="link" 
            className="text-muted-foreground hover:text-primary pr-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'See All \u2192'}
          </Button>
        )}
      </div>
      
      {/* Scroll Controls (Hidden when expanded) */}
      {!isExpanded && (
        <>
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute left-0 top-[55%] -translate-y-1/2 z-10 opacity-0 group-hover/section:opacity-100 transition-opacity -ml-4 shadow-xl hidden md:flex"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute right-0 top-[55%] -translate-y-1/2 z-10 opacity-0 group-hover/section:opacity-100 transition-opacity -mr-4 shadow-xl hidden md:flex"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      <div 
        ref={scrollRef} 
        className={
          isExpanded 
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 px-1" 
            : "flex gap-4 md:gap-6 lg:gap-8 overflow-x-auto pb-6 snap-x scrollbar-none px-1"
        }
      >
        {items.map((track: any, idx: number) => (
          <motion.div 
            key={track.id || idx}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: idx * 0.05 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className={isExpanded ? "w-full cursor-pointer group" : "w-[240px] sm:w-[280px] md:w-[200px] xl:w-[220px] shrink-0 snap-start group cursor-pointer"}
            onClick={() => {
              if (track.type === 'Room' || track.type === 'ROOM') {
                router.push(`/rooms`);
              } else if (track.type === 'Artist' || track.type === 'ARTIST') {
                router.push(`/search?q=${track.title}`);
              } else {
                playSong({
                  song_uri: track.uri,
                  song_title: track.title,
                  song_artist: track.artist,
                  song_image: track.image
                });
              }
            }}
          >
            <div className="glass-panel p-3 h-full border border-white/10 group-hover:border-white/20 transition-all duration-300 bg-background/40 group-hover:bg-white/10 shadow-lg group-hover:shadow-2xl rounded-[24px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[24px] pointer-events-none" />
              
              <div className="relative aspect-square rounded-[18px] overflow-hidden mb-3 shadow-xl">
                <motion.img 
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  src={track.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80'} 
                  alt={track.title} 
                  className="w-full h-full object-cover transition-all duration-500 bg-secondary/20" 
                  onError={(e: any) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80'; }}
                />

                <div className="absolute top-2 left-2 z-20">
                  <button className="p-1.5 rounded-full bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all shadow-lg text-white/70 hover:text-red-500 hover:scale-110" onClick={(e) => { e.stopPropagation(); console.log('Liked'); }}>
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                
                {track.progress !== undefined && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60 z-20">
                    <div 
                      className="h-full bg-primary rounded-r-full" 
                      style={{ width: `${track.progress}%` }} 
                    />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-y-4 group-hover:translate-y-0 z-10">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                    <PlayCircle className="w-8 h-8 text-white fill-white shadow-inner" />
                  </div>
                </div>
              </div>
              <div className="overflow-hidden">
                <h3 className="font-semibold text-sm md:text-base truncate mb-1 text-foreground group-hover:text-primary transition-colors" title={track.title}>{track.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground truncate" title={track.artist}>{track.artist}</p>
                {track.reason && (
                  <p className="text-[10px] text-muted-foreground/70 truncate mt-1">{track.reason}</p>
                )}
              </div>
              
              {track.lastListened && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 opacity-70">
                  <Clock className="w-3 h-3" /> {track.lastListened}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
