'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Radio, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

  if (communities.length === 0 && !isLoading) return null;

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
