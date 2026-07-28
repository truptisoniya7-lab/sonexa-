'use client';

import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Users, Activity, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { usePlayer } from '@/context/PlayerContext';

export function HeroSection() {
  const router = useRouter();
  const { playSong } = usePlayer();
  const [heroIndex, setHeroIndex] = useState(0);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['heroRecommendations'],
    queryFn: async () => {
      const res = await fetch('/api/recommendations/hero');
      if (!res.ok) throw new Error('Failed to fetch hero recommendations');
      return res.json();
    },
  });

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % items.length);
    }, 10000); // rotate every 10 seconds
    return () => clearInterval(interval);
  }, [items]);

  if (isLoading) {
    return <Skeleton className="w-full h-72 md:h-[400px] rounded-3xl bg-background/40 shadow-2xl" />;
  }

  if (items.length === 0) return null;

  const currentItem = items[heroIndex];

  const handleAction = () => {
    if (currentItem.uri?.startsWith('room:')) {
      router.push(`/room/${currentItem.uri.split(':')[1]}`);
    } else if (currentItem.uri?.startsWith('spotify:') || currentItem.uri?.startsWith('https:')) {
      playSong({
        song_uri: currentItem.uri,
        song_title: currentItem.title,
        song_artist: currentItem.artist,
        song_image: currentItem.image
      });
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl h-72 md:h-[400px] shadow-2xl group cursor-pointer border border-white/5" onClick={handleAction}>
      {/* Immersive Ambient Glow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentItem.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-125 saturate-150" 
            style={{ backgroundImage: `url(${currentItem.image})` }} 
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-10" />

      <div className="absolute inset-0 p-8 md:p-12 flex justify-between items-center z-20">
        {/* Left Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={`content-${currentItem.id}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col justify-center h-full w-full sm:w-2/3"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),1)]" /> 
               {currentItem.type.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-2xl">
              {currentItem.title}
            </h2>
            <p className="text-white/80 max-w-xl mb-8 line-clamp-2 text-base md:text-lg font-medium drop-shadow-md">
              {currentItem.subtitle}
            </p>
            
            <div className="flex gap-4">
              <Button className="w-fit rounded-full px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_rgba(var(--primary),0.3)] group/btn overflow-hidden relative border border-white/10" onClick={(e) => { e.stopPropagation(); handleAction(); }}>
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center font-bold text-lg">
                  {currentItem.type.includes('Party') || currentItem.type.includes('Room') ? (
                    <Users className="w-6 h-6 mr-2 group-hover/btn:scale-110 transition-transform" />
                  ) : (
                    <PlayCircle className="w-6 h-6 mr-2 group-hover/btn:scale-110 transition-transform" />
                  )}
                  {currentItem.actionLabel}
                </span>
              </Button>
              <Button variant="outline" className="rounded-full px-6 py-6 border-white/20 text-white hover:bg-white/10" onClick={(e) => { e.stopPropagation(); }}>
                <Plus className="w-5 h-5 mr-2" /> Save
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Floating Artwork */}
        <div className="hidden sm:flex w-1/3 h-full relative perspective-[1000px] items-center justify-end">
          <AnimatePresence mode="wait">
            <motion.div
              key={`art-${currentItem.id}`}
              initial={{ opacity: 0, rotateY: 15, scale: 0.9 }}
              animate={{ opacity: 1, rotateY: -5, scale: 1, y: [0, -10, 0] }}
              exit={{ opacity: 0, rotateY: -25, scale: 0.9 }}
              transition={{ 
                 opacity: { duration: 0.5 },
                 scale: { duration: 0.5 },
                 rotateY: { duration: 0.5 },
                 y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative z-10"
            >
              <div className="w-56 h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/20 relative bg-black">
                 <img src={currentItem.image} className="w-full h-full object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)]" alt="Artwork" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
