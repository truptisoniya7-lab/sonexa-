'use client';

import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Users, Activity, Plus, Headphones } from 'lucide-react';
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
    }, 25000); // rotate every 25 seconds
    return () => clearInterval(interval);
  }, [items]);

  if (isLoading) {
    return <Skeleton className="w-full h-72 md:h-[450px] rounded-[32px] bg-background/40 shadow-2xl" />;
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
    <section className="relative overflow-hidden rounded-[32px] h-72 md:h-[450px] shadow-2xl group cursor-pointer border border-white/10" onClick={handleAction}>
      
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
            className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-125 saturate-150" 
            style={{ backgroundImage: `url(${currentItem.image})` }} 
          />
        </motion.div>
      </AnimatePresence>

      {/* Radial Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      {/* Floating Music Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-50">
        <div className="absolute top-[20%] left-[30%] w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute top-[70%] left-[60%] w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute top-[40%] right-[20%] w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }} />
      </div>

      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />

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
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2 drop-shadow-md">
               <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),1)]" /> 
               {currentItem.type.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight drop-shadow-2xl leading-tight">
              {currentItem.title}
            </h2>
            
            {/* Dynamic Metadata based on content type */}
            <div className="flex items-center gap-4 mb-6">
              {currentItem.artistAvatar && (
                <div className="flex items-center gap-2">
                  <img src={currentItem.artistAvatar} alt={currentItem.artist} className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg object-cover" />
                  <span className="text-white font-medium text-sm md:text-base">{currentItem.artist}</span>
                </div>
              )}
              {currentItem.artist && !currentItem.artistAvatar && (
                <span className="text-white/90 font-medium text-sm md:text-base">Featuring {currentItem.artist}</span>
              )}
            </div>

            {(currentItem.trackCount || currentItem.plays) && (
              <div className="flex items-center gap-4 text-xs md:text-sm text-white/60 font-medium mb-8 bg-black/20 w-fit px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                {currentItem.trackCount && (
                  <span>{currentItem.trackCount} Songs {currentItem.updatedAt && `• ${currentItem.updatedAt}`}</span>
                )}
                {currentItem.trackCount && currentItem.plays && <span className="w-1 h-1 rounded-full bg-white/30" />}
                {currentItem.plays && (
                  <span className="flex items-center gap-1.5"><Headphones className="w-3.5 h-3.5" /> {currentItem.plays} Plays This Week</span>
                )}
              </div>
            )}
            
            {(!currentItem.trackCount && !currentItem.plays) && (
              <p className="text-white/80 max-w-xl mb-8 line-clamp-2 text-base md:text-lg font-medium drop-shadow-md">
                {currentItem.subtitle}
              </p>
            )}
            
            <div className="flex gap-4">
              <Button className="w-fit rounded-full px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_rgba(var(--primary),0.3)] group/btn overflow-hidden relative border border-white/10" onClick={(e) => { e.stopPropagation(); handleAction(); }}>
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center font-bold text-lg tracking-wide">
                  {currentItem.type.includes('Party') || currentItem.type.includes('Room') ? (
                    <Users className="w-6 h-6 mr-2 group-hover/btn:scale-110 transition-transform" />
                  ) : (
                    <PlayCircle className="w-6 h-6 mr-2 group-hover/btn:scale-110 transition-transform" />
                  )}
                  {currentItem.actionLabel || 'Listen Now'}
                </span>
              </Button>
              <Button variant="outline" className="rounded-full px-6 py-6 border-white/20 text-white hover:bg-white/10 bg-white/5 backdrop-blur-md" onClick={(e) => { e.stopPropagation(); }}>
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
              className="relative z-10 group/artwork cursor-pointer"
            >
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-[32px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10 relative bg-black group-hover/artwork:shadow-[0_0_40px_rgba(var(--primary),0.4)] transition-all duration-500">
                 <img src={currentItem.image} className="w-full h-full object-cover transition-transform duration-700 group-hover/artwork:scale-105" alt="Artwork" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
