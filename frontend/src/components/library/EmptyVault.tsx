import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Music, Plus, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyVault: React.FC<{ type?: 'songs' | 'albums' | 'playlists' | 'artists' }> = ({ type = 'songs' }) => {
  const stars = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
  })), []);

  return (
    <div className="w-full flex flex-col items-center justify-center py-24 text-center bg-white/[0.02] rounded-3xl border border-white/[0.05] relative overflow-hidden group">
      
      {/* Animated Constellation Background */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        {stars.map((s) => (
          <motion.div
            key={s.id}
            className="absolute w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_rgba(var(--primary),0.8)]"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_40px_rgba(var(--primary),0.2)] transition-all duration-500">
          <Music className="w-10 h-10 text-white/40 group-hover:text-primary transition-colors duration-500" />
        </div>
        
        <h3 className="text-[28px] font-extrabold mb-3 text-white">Your Vault is Empty</h3>
        <p className="text-[15px] text-white/50 max-w-md mb-8">
          You haven't added any {type} to your library yet. Explore the universe of music and start collecting your favorites.
        </p>

        <div className="flex gap-4">
          <Button className="rounded-full bg-primary text-white hover:bg-primary/90 px-8 h-12 font-bold shadow-[0_0_20px_rgba(var(--primary),0.4)]">
            <Compass className="w-4 h-4 mr-2" /> Discover Music
          </Button>
          <Button variant="outline" className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 hover:text-white px-8 h-12 font-bold text-white/70">
            <Plus className="w-4 h-4 mr-2" /> Create Playlist
          </Button>
        </div>
      </div>
      
    </div>
  );
};
