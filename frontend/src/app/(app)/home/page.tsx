'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { FriendsLiveActivity } from '@/components/home/FriendsLiveActivity';
import { HeroPlayer } from '@/components/music/hero-player';
import { CarouselSection } from '@/components/home/CarouselSection';
import { CoverFlowModule } from '@/components/modules/cover-flow-module';
import { InfiniteCarouselModule } from '@/components/modules/infinite-carousel-module';
import { MasonryModule } from '@/components/modules/masonry-module';

function SDUIModule({ module }: { module: any }) {
  switch (module.type) {
    case 'HERO':
      return <HeroPlayer />;
    case 'CAROUSEL':
      return (
        <CarouselSection 
          title={module.title} 
          subtitle="" 
          icon={null} 
          queryKey={['sdui', module.id]} 
          endpoint={module.endpoint} 
        />
      );
    case 'COVER_FLOW':
      return <CoverFlowModule module={module} />;
    case 'INFINITE_CAROUSEL':
      return <InfiniteCarouselModule module={module} />;
    case 'MASONRY':
      return <MasonryModule module={module} />;
    default:
      return null;
  }
}

export default function HomePage() {
  const { data: sduiData, isLoading } = useQuery({
    queryKey: ['home', 'sdui-layout'],
    queryFn: async () => {
      const res = await fetch('/api/home/layout');
      if (!res.ok) throw new Error('Failed to fetch home layout');
      return res.json();
    }
  });

  return (
    <div className="max-w-[1600px] mx-auto pb-12 relative z-10 preserve-3d perspective-1000">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-3 w-full space-y-12">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-2xl glass" />
              <Skeleton className="h-48 w-full rounded-2xl glass" />
              <Skeleton className="h-48 w-full rounded-2xl glass" />
            </div>
          ) : (
            sduiData?.layout?.map((module: any) => (
              <SDUIModule key={module.id} module={module} />
            ))
          )}
        </div>

        {/* Right Sidebar: Friends Activity */}
        <aside className="lg:col-span-1 hidden lg:block border-l border-white/5 pl-8 pt-2">
           <FriendsLiveActivity />
        </aside>

      </div>
    </div>
  )
}
