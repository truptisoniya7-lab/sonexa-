'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, BarChart3, Clock, ArrowRight } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { motion } from 'framer-motion';

function Widget({ title, icon, queryParams }: { title: string, icon: React.ReactNode, queryParams: string }) {
  const { playSong } = usePlayer();
  
  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['discovery-widget', queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/music/discover?section=${encodeURIComponent(queryParams)}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      return res.json();
    },
  });

  return (
    <Card className="glass-panel p-4 border-white/5 bg-background/40">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
        <h3 className="font-bold flex items-center gap-2 text-white/90">
          {icon}
          {title}
        </h3>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : (
          songs.slice(0, 4).map((song: any) => (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              key={song.id} 
              className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
              onClick={() => playSong(song)}
            >
              <img src={song.image_url} alt={song.title} className="w-10 h-10 rounded-md object-cover" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white line-clamp-1">{song.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{song.artist}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
}

export function DiscoverySidebar() {
  return (
    <aside className="space-y-6 sticky top-24">
      <Widget 
        title="Trending Now" 
        icon={<Flame className="w-4 h-4 text-red-500" />} 
        queryParams="Trending Songs" 
      />
      <Widget 
        title="Top Charts" 
        icon={<BarChart3 className="w-4 h-4 text-blue-500" />} 
        queryParams="Top Trending Artists" 
      />
      <Widget 
        title="Recently Played Vibes" 
        icon={<Clock className="w-4 h-4 text-green-500" />} 
        queryParams="Songs similar to recently played" 
      />
    </aside>
  );
}
