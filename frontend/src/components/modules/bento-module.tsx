'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity, Sparkles, Radio } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { FriendsLiveActivity } from '@/components/home/FriendsLiveActivity';

export function BentoModule({ module }: { module: any }) {
  // We can fetch data here for the rooms / recommendations if needed, 
  // but we can also just compose existing components.
  
  return (
    <section className="space-y-6 relative py-4">
      <h2 className="text-2xl font-bold tracking-tight text-foreground px-1">{module.title || 'The Pulse'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
        
        {/* Large Bento Box: Friends Live Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="md:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 shadow-glass relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
          
          <FriendsLiveActivity />
        </motion.div>

        <div className="space-y-6 flex flex-col">
          {/* Small Bento Box 1: Live Rooms */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            className="flex-1 glass-panel p-6 rounded-3xl border border-white/10 shadow-glass relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <h3 className="text-sm font-bold flex items-center gap-2 tracking-wider uppercase mb-4 text-orange-400">
               <Radio className="w-4 h-4" /> Live Rooms
             </h3>
             <div className="space-y-3">
               {/* Mock Live Room */}
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                   <Radio className="w-5 h-5 text-orange-400" />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-foreground">Lo-Fi Study Beats</p>
                   <p className="text-xs text-muted-foreground flex items-center gap-1">
                     <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> 124 listening
                   </p>
                 </div>
               </div>
             </div>
          </motion.div>

          {/* Small Bento Box 2: AI Recommendation */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
            className="flex-1 glass-panel p-6 rounded-3xl border border-white/10 shadow-glass relative overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-colors"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <h3 className="text-sm font-bold flex items-center gap-2 tracking-wider uppercase mb-4 text-purple-400">
               <Sparkles className="w-4 h-4" /> AI Discovery
             </h3>
             <p className="text-sm text-foreground/80 leading-relaxed">
               Because you've been listening to <span className="text-primary font-semibold">Espresso</span>, we think you'd love our new <span className="text-white font-bold italic">Summer Pop</span> mix.
             </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
