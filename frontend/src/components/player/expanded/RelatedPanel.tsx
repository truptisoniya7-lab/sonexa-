import React, { useEffect, useState } from 'react';
import { MockDataProvider, DiscoveryItem } from '../../../services/MockDataProvider';
import { motion } from 'framer-motion';
import { Play, Disc, User, Radio, ListMusic, Music2 } from 'lucide-react';
import { PlayerSong } from '../../../services/PlayerService';

interface RelatedPanelProps {
  song: PlayerSong;
}

export function RelatedPanel({ song }: RelatedPanelProps) {
  const [data, setData] = useState<{ becauseYouPlayed: DiscoveryItem[], similarArtists: DiscoveryItem[], genres: DiscoveryItem[] } | null>(null);

  useEffect(() => {
    MockDataProvider.getDiscoveryContent().then(setData);
  }, [song]);

  if (!data) return null;

  // Mix items to simulate a rich discovery feed (Songs, Albums, Artists, Radio)
  const mixedItems = [
    { ...data.similarArtists[0], type: 'Artist', icon: User },
    { ...data.becauseYouPlayed[0], type: 'Song', icon: Music2 },
    { ...data.becauseYouPlayed[1], type: 'Album', icon: Disc },
    { ...data.similarArtists[1], type: 'Radio', icon: Radio },
    { ...data.becauseYouPlayed[2], type: 'Playlist', icon: ListMusic },
  ].filter(i => i.id); // Filter out any undefined

  return (
    <div className="w-full flex flex-col h-full overflow-hidden px-4">
      <div className="flex items-center gap-2 mb-4 text-white">
        <Disc className="w-5 h-5 text-white/50" />
        <h3 className="font-bold text-xl">Explore</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-24">
        
        {/* Mixed Related Content */}
        <div className="flex flex-col gap-3">
          {mixedItems.map((item, idx) => (
            <motion.div 
              key={`${item.id}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <div className={`relative w-14 h-14 overflow-hidden shrink-0 ${item.type === 'Artist' ? 'rounded-full' : 'rounded-lg'}`}>
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                  <Play className="w-6 h-6 fill-current text-white ml-1" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-bold text-white truncate group-hover:text-primary transition-colors">{item.title}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">
                    {item.type}
                  </span>
                  <p className="text-[13px] text-white/50 truncate">{item.subtitle}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tags */}
        <div className="mt-8">
          <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Related Tags</h4>
          <div className="flex flex-wrap gap-2">
            {data.genres.map(item => (
              <span key={item.id} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer">
                {item.title}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
