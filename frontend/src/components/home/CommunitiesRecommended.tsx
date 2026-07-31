'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Radio, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export function CommunitiesRecommended() {
  const router = useRouter();
  
  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['recommendedCommunities'],
    queryFn: async () => {
      // Fetching top public rooms
      const res = await fetch('/api/rooms');
      if (!res.ok) throw new Error('Failed to fetch rooms');
      return res.json();
    },
  });

  if (communities.length === 0 && !isLoading) {
    return (
      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Radio className="w-6 h-6 text-purple-500" /> Live Communities
        </h2>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-panel p-12 border-white/5 bg-background/40 hover:bg-background/50 transition-all flex flex-col items-center justify-center text-center relative overflow-hidden group">
            {/* Background effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity delay-75" />
            
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6 relative z-10 border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
            >
              <Radio className="w-10 h-10 text-primary drop-shadow-glow" />
            </motion.div>
            
            <h3 className="text-2xl font-extrabold text-white mb-2 relative z-10 tracking-tight">🎙️ No Live Communities Right Now</h3>
            <p className="text-muted-foreground mb-8 max-w-md relative z-10 text-lg">Be the first to start a listening room and share your vibe with the world.</p>
            
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white shadow-glow relative z-10 rounded-full px-8 text-md font-bold" 
              onClick={() => router.push('/rooms/create')}
            >
              Start Community
            </Button>
          </Card>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="space-y-6 mt-12">
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <Radio className="w-6 h-6 text-purple-500" /> Live Communities
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl bg-background/40" />
          ))
        ) : (
          communities.slice(0, 3).map((room: any) => (
            <Card key={room.id} className="glass-panel p-6 border-white/5 bg-background/40 hover:bg-background/60 hover:border-primary/30 transition-all flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-white">{room.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    Playing: {room.current_song_title || 'Silence'}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium bg-white/10 px-2 py-1 rounded-full text-white/80">
                  <Users className="w-3 h-3" />
                  <span>{Math.floor(Math.random() * 50) + 1}</span>
                </div>
              </div>
              <Button className="w-full bg-primary/20 text-primary hover:bg-primary hover:text-white border border-primary/20" onClick={() => router.push(`/room/${room.id}`)}>
                Join Room
              </Button>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
