import React, { useEffect, useState } from 'react';
import { MockDataProvider, DiscoveryItem } from '../../../services/MockDataProvider';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export function MiniCarousel() {
  const [items, setItems] = useState<DiscoveryItem[]>([]);

  useEffect(() => {
    MockDataProvider.getDiscoveryContent().then(data => {
      setItems(data.becauseYouPlayed);
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="w-full h-[140px] flex flex-col shrink-0 border-t border-white/5 bg-black/20 backdrop-blur-md pt-3 overflow-hidden">
      <div className="px-8 mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">Because You Played This</h3>
      </div>
      
      <div className="flex gap-4 overflow-x-auto custom-scrollbar px-8 pb-4 h-full items-center">
        {items.map(item => (
          <motion.div 
            key={item.id} 
            className="flex items-center gap-3 shrink-0 w-[240px] group cursor-pointer bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10"
            whileHover={{ y: -2 }}
          >
            <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 bg-white/10">
              {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-5 h-5 fill-current text-white ml-0.5" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-semibold text-white truncate group-hover:text-primary transition-colors">{item.title}</h4>
              <p className="text-[11px] text-white/50 truncate">{item.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
