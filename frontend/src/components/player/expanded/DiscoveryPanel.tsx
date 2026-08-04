import React, { useEffect, useState } from 'react';
import { MockDataProvider, DiscoveryItem } from '../../../services/MockDataProvider';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export function DiscoveryPanel() {
  const [data, setData] = useState<{ becauseYouPlayed: DiscoveryItem[], similarArtists: DiscoveryItem[], genres: DiscoveryItem[] } | null>(null);

  useEffect(() => {
    MockDataProvider.getDiscoveryContent().then(setData);
  }, []);

  if (!data) return null;

  return (
    <div className="w-full mt-16 pb-12 flex flex-col gap-10">
      
      {/* Because You Played */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider px-2">Because You Played This</h3>
        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 px-2 -mx-2">
          {data.becauseYouPlayed.map(item => (
            <motion.div 
              key={item.id} 
              className="flex flex-col gap-2 shrink-0 w-[140px] md:w-[160px] group cursor-pointer"
              whileHover={{ y: -5 }}
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-lg">
                {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black shadow-xl scale-75 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">{item.title}</h4>
                <p className="text-xs text-white/50 truncate">{item.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Similar Artists */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider px-2">Similar Artists</h3>
        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 px-2 -mx-2">
          {data.similarArtists.map(item => (
            <motion.div 
              key={item.id} 
              className="flex flex-col items-center gap-3 shrink-0 w-[120px] md:w-[140px] group cursor-pointer"
              whileHover={{ y: -5 }}
            >
              <div className="relative w-full aspect-square rounded-full overflow-hidden bg-white/5 border border-white/10 shadow-lg">
                {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
              </div>
              <h4 className="text-sm font-semibold text-white text-center truncate w-full group-hover:text-primary transition-colors">{item.title}</h4>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Genres */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider px-2">Mood & Genre</h3>
        <div className="flex flex-wrap gap-2 px-2">
          {data.genres.map(item => (
            <motion.div 
              key={item.id} 
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 hover:border-white/30 cursor-pointer transition-colors text-sm font-medium text-white/80 hover:text-white shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.title}
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
