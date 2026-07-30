'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlayer } from '@/context/PlayerContext';

export function MasonryModule({ module }: { module: any }) {
  const { playSong } = usePlayer();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['sdui', module.id],
    queryFn: async () => {
      const res = await fetch(module.endpoint);
      if (!res.ok) throw new Error('Failed to fetch data');
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground px-1">{module.title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className={`w-full rounded-3xl glass ${i % 3 === 0 ? 'h-48' : 'h-32'}`} />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="space-y-6 relative py-4">
      <h2 className="text-2xl font-bold tracking-tight text-foreground px-1">{module.title}</h2>
      
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 px-1">
        {items.map((track: any, idx: number) => {
          // Determine varying heights for masonry look
          const heightClass = idx % 4 === 0 ? 'h-56' : idx % 3 === 0 ? 'h-48' : 'h-32';
          
          return (
            <motion.div
              key={track.uri}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: (idx % 4) * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`relative rounded-3xl overflow-hidden cursor-pointer group shadow-glass hover:shadow-glass-hover border border-white/10 ${heightClass} break-inside-avoid`}
              onClick={() => playSong({
                song_uri: track.uri,
                song_title: track.title,
                song_artist: track.artist,
                song_image: track.image
              })}
            >
              <img 
                src={track.image} 
                alt={track.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4">
                <span className="font-bold text-sm text-white group-hover:text-primary transition-colors">{track.title}</span>
                {idx % 2 === 0 && <span className="text-xs text-gray-300 truncate">{track.artist}</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
