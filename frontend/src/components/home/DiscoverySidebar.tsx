'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, BarChart3, ArrowRight, Mic, Disc, Users, Sparkles } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { motion } from 'framer-motion';

function DiscoveryWidget({ title, icon, queryParams }: { title: string, icon: React.ReactNode, queryParams: string }) {
  const { playSong } = usePlayer();
  
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['discovery-widget', queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/music/discover?section=${encodeURIComponent(queryParams)}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      return res.json();
    },
  });

  if (!isLoading && items.length === 0) return null;

  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5 group cursor-pointer">
        <h4 className="font-bold flex items-center gap-2 text-white/90 text-sm tracking-wide uppercase group-hover:text-primary transition-colors">
          {icon}
          {title}
        </h4>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-white group-hover:translate-x-1 transition-all" />
      </div>
      
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-[12px] bg-white/5" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4 bg-white/5" />
                <Skeleton className="h-3 w-1/2 bg-white/5" />
              </div>
            </div>
          ))
        ) : (
          items.slice(0, 3).map((item: any, idx: number) => (
            <motion.div 
              whileHover={{ scale: 1.02, x: 4 }}
              key={item.id || idx} 
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/10"
              onClick={() => {
                if (item.uri) {
                  playSong({
                    song_uri: item.uri,
                    song_title: item.title,
                    song_artist: item.artist,
                    song_image: item.image
                  });
                }
              }}
            >
              <img 
                src={item.image || item.image_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80'} 
                alt={item.title} 
                className="w-12 h-12 rounded-[12px] object-cover shadow-md" 
                onError={(e: any) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80'; }}
              />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white line-clamp-1">{item.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.artist || item.subtitle}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export function DiscoverySidebar() {
  return (
    <aside className="sticky top-24">
      <Card className="glass-panel p-6 border border-white/10 bg-background/60 shadow-2xl rounded-[32px] relative overflow-hidden backdrop-blur-2xl">
        {/* Subtle background glow for the whole hub */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="mb-8 relative z-10">
          <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
            Discovery Hub
          </h3>
          <p className="text-sm text-muted-foreground font-medium mt-1">Your daily mix of music.</p>
        </div>

        <div className="relative z-10">
          <DiscoveryWidget 
            title="Trending Now" 
            icon={<Flame className="w-4 h-4 text-red-500" />} 
            queryParams="Trending Songs" 
          />
          <DiscoveryWidget 
            title="Top Charts" 
            icon={<BarChart3 className="w-4 h-4 text-blue-500" />} 
            queryParams="Top Charts" 
          />
          <DiscoveryWidget 
            title="Featured Artist" 
            icon={<Mic className="w-4 h-4 text-yellow-500" />} 
            queryParams="Artist of the Day" 
          />
          <DiscoveryWidget 
            title="Today's Pick" 
            icon={<Sparkles className="w-4 h-4 text-purple-500" />} 
            queryParams="Today's Pick" 
          />
          <DiscoveryWidget 
            title="Community Picks" 
            icon={<Users className="w-4 h-4 text-green-500" />} 
            queryParams="Community Pick" 
          />
        </div>
      </Card>
    </aside>
  );
}
