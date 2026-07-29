'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Heart, Clock, Star, 
  Music2, ListMusic, Mic2, Disc3,
  Search, Plus, Download, Pin, ChevronLeft, ChevronRight, User, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlayer } from '@/context/PlayerContext';

import { supabase } from '@/lib/supabase';

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-white/10 rounded-md ${className}`} />
);

const FallbackImage = ({ src, alt, className, fallbackType }: { src: string | string[], alt: string, className: string, fallbackType: 'artist' | 'playlist' | 'album' }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 ${className}`}>
        {fallbackType === 'artist' && <User className="w-1/3 h-1/3 text-white/30" />}
        {fallbackType === 'playlist' && <ListMusic className="w-1/3 h-1/3 text-white/30" />}
        {fallbackType === 'album' && <Disc3 className="w-1/3 h-1/3 text-white/30" />}
      </div>
    );
  }

  // Render Playlist Collage
  if (Array.isArray(src) && src.length === 4) {
    return (
      <div className={`grid grid-cols-2 grid-rows-2 ${className}`}>
        {src.map((s, i) => (
          <img key={i} src={s} alt={`${alt} ${i}`} className="w-full h-full object-cover" onError={() => setError(true)} />
        ))}
      </div>
    );
  }

  return (
    <img 
      src={src as string} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)}
    />
  );
};

const formatMs = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const { currentSong } = usePlayer();

  const recentScrollRef = useRef<HTMLDivElement>(null);
  const artistScrollRef = useRef<HTMLDivElement>(null);

  const fetchLibraryData = () => {
    fetch('/api/library')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLibraryData();

    // Supabase Realtime Subscription
    const channel = supabase.channel('library_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'listening_history' },
        (payload) => {
          console.log('Realtime listening_history change received!', payload);
          fetchLibraryData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'playlists' },
        (payload) => {
          console.log('Realtime playlists change received!', payload);
          fetchLibraryData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'likes' },
        (payload) => {
          console.log('Realtime likes change received!', payload);
          fetchLibraryData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const heroSong = useMemo(() => {
    if (currentSong) return currentSong as any;
    if (data?.continueListening) {
      return {
        song_title: data.continueListening.title,
        song_artist: data.continueListening.artist,
        song_image: data.continueListening.image,
        progress_ms: data.continueListening.progress_ms,
        duration_ms: data.continueListening.duration_ms,
        progress: data.continueListening.progress
      };
    }
    return null;
  }, [currentSong, data]);

  const bgGradient = useMemo(() => {
    if (!heroSong) return 'from-indigo-900/40 via-purple-900/40 to-fuchsia-900/40';
    const colors = [
      'from-purple-900/40 via-indigo-900/40 to-blue-900/40',
      'from-rose-900/40 via-orange-900/40 to-amber-900/40',
      'from-emerald-900/40 via-teal-900/40 to-cyan-900/40',
      'from-fuchsia-900/40 via-pink-900/40 to-rose-900/40'
    ];
    const hash = heroSong.song_title.length % colors.length;
    return colors[hash];
  }, [heroSong]);

  const scrollContainer = (ref: any, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const renderRecentCard = (item: any) => (
    <div key={item.id} className="min-w-[180px] w-[180px] group p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden flex flex-col hover:scale-[1.03] hover:border-primary/30 hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.3)]">
      <div className={`relative aspect-square w-full mb-3 overflow-hidden shadow-lg ${item.type === 'Artist' ? 'rounded-full' : 'rounded-md'}`}>
        <FallbackImage src={item.image} alt={item.title} fallbackType={item.type === 'Artist' ? 'artist' : 'playlist'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:blur-[2px]" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.6)] transform translate-y-4 group-hover:translate-y-0 transition-transform">
            <Play className="w-6 h-6 ml-1" />
          </div>
        </div>
      </div>
      
      <h3 className="font-bold text-white text-[16px] truncate mb-1">{item.title}</h3>
      <p className="text-[12px] text-muted-foreground truncate mb-2">{item.type} • {item.lastPlayed}</p>
      
      {/* Progress Bar */}
      {item.progress !== undefined && item.progress > 0 && item.progress < 100 && (
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-auto">
          <div className="h-full bg-primary" style={{ width: `${item.progress}%` }} />
        </div>
      )}
    </div>
  );

  const renderArtistCard = (artist: any) => (
    <div key={artist.id} className="min-w-[180px] w-[180px] flex flex-col items-center group cursor-pointer hover:scale-[1.03] transition-all">
      <div className="w-36 h-36 rounded-full overflow-hidden mb-4 relative shadow-lg group-hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)] transition-all">
        <FallbackImage src={artist.image} alt={artist.title} fallbackType="artist" className="w-full h-full object-cover group-hover:scale-110 group-hover:blur-[2px] transition-all duration-500" />
        
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
          <Play className="w-10 h-10 text-white fill-white" />
          <span className="text-[12px] font-bold tracking-widest uppercase text-white/80">View Profile</span>
        </div>
      </div>
      <h3 className="font-bold text-white text-[18px] text-center mb-1">{artist.title}</h3>
      <p className="text-[12px] text-primary font-medium text-center mb-1">{artist.status}</p>
      <p className="text-[12px] text-muted-foreground text-center">{artist.plays}</p>
    </div>
  );

  const renderPlaylistCard = (playlist: any) => (
    <div key={playlist.id} className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer flex flex-col hover:scale-[1.03] hover:border-primary/30 hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.3)]">
      <div className="relative aspect-square w-full mb-4 overflow-hidden rounded-md shadow-lg">
        <FallbackImage src={playlist.image} alt={playlist.title} fallbackType="playlist" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:blur-[2px]" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.6)] transform translate-y-4 group-hover:translate-y-0 transition-transform">
            <Play className="w-6 h-6 ml-1" />
          </div>
        </div>
      </div>
      <h3 className="font-bold text-white text-[18px] truncate mb-1">{playlist.title}</h3>
      <div className="flex flex-col text-[14px] text-muted-foreground gap-0.5">
        <span>{playlist.count} • {playlist.duration}</span>
        <span>{playlist.updated}</span>
        <span className="text-white/60">By {playlist.creator}</span>
      </div>
    </div>
  );

  const renderTimelineIcon = (type: string) => {
    switch(type) {
      case 'heart': return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'plus': return <Plus className="w-4 h-4 text-emerald-500" />;
      case 'music': return <Music2 className="w-4 h-4 text-indigo-400" />;
      case 'list': return <ListMusic className="w-4 h-4 text-purple-400" />;
      case 'download': return <Download className="w-4 h-4 text-sky-400" />;
      default: return <Star className="w-4 h-4 text-yellow-400" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full p-8 space-y-8 bg-background">
        <Skeleton className="w-full h-64 rounded-[2rem]" />
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-64 h-20 rounded-xl" />)}
        </div>
        <Skeleton className="w-48 h-8" />
        <div className="flex gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="w-48 aspect-square rounded-xl" />)}
        </div>
      </div>
    );
  }

  const filteredPlaylists = data.playlists?.filter((p:any) => p.title.toLowerCase().includes(searchQuery.toLowerCase())) || [];
  const filteredAlbums = data.albums?.filter((p:any) => p.title.toLowerCase().includes(searchQuery.toLowerCase())) || [];
  const filteredArtists = data.artists?.filter((a:any) => a.title.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-y-auto overflow-x-hidden hide-scrollbar scroll-smooth pb-24">
      <div className="max-w-[1400px] mx-auto w-full px-6 py-8 space-y-12">
        
        {/* Dynamic Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full rounded-[2rem] overflow-hidden relative shadow-2xl bg-gradient-to-br ${bgGradient} p-8 md:p-12 border border-white/10 backdrop-blur-md transition-colors duration-1000`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-[32px] md:text-[40px] font-extrabold text-white mb-2 tracking-tight drop-shadow-md">
              {heroSong ? '🎵 Continue Listening' : `👋 ${data.greeting}`}
            </h1>
            <p className="text-[16px] text-white/70 mb-8 font-medium">
              {data.greetingSubtitle}
            </p>
            
            {heroSong ? (
              <div className="flex items-center gap-6 mb-8">
                <img src={heroSong.song_image} alt="cover" className="w-24 h-24 rounded-lg shadow-2xl object-cover" />
                <div className="flex-1">
                  <h2 className="text-[28px] font-bold text-white mb-1">{heroSong.song_title}</h2>
                  <p className="text-[18px] text-white/80 mb-3">{heroSong.song_artist}</p>
                  
                  {heroSong.progress_ms !== undefined && (
                    <div className="w-full max-w-[300px]">
                      <div className="flex justify-between text-[12px] font-mono text-white/60 mb-1.5">
                        <span>{formatMs(heroSong.progress_ms)}</span>
                        <span>{formatMs(heroSong.duration_ms)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-primary shadow-[0_0_10px_rgba(139,92,246,0.8)]" style={{ width: `${heroSong.progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-[18px] text-white/80 mb-8 font-medium">
                Start liking songs and creating playlists. We'll organize everything here automatically.
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-3 text-[14px] font-semibold text-white/80 mb-8 tracking-wide">
              <span className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">{data.summary?.likedSongs || 0} Liked Songs</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">{data.summary?.playlists || 0} Playlists</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">{data.summary?.downloaded || 0} Downloaded</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">{data.summary?.followingArtists || 0} Artists</span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full bg-primary text-white hover:bg-primary/90 hover:scale-[1.05] transition-all shadow-[0_0_30px_-5px_rgba(139,92,246,0.6)] font-bold px-8 h-14 text-[16px]">
                <Play className="w-5 h-5 mr-2 fill-current" />
                {heroSong ? 'Resume' : 'Discover Music'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Pinned Section */}
        {data.pinned?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.pinned.map((pin: any) => (
              <div key={pin.id} className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.02]">
                <FallbackImage src={pin.image} alt={pin.title} fallbackType="playlist" className="w-16 h-16 rounded-md shadow-md shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Pin className="w-3 h-3 text-primary fill-primary rotate-45 shrink-0" />
                    <h3 className="font-bold text-[16px] text-white truncate">{pin.title}</h3>
                  </div>
                  <p className="text-[12px] text-muted-foreground truncate">{pin.type} • {pin.count}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all mr-2 shadow-[0_0_15px_rgba(139,92,246,0.4)] shrink-0">
                   <Play className="w-5 h-5 text-primary fill-primary ml-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search & Filters */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl py-4 border-b border-white/5 space-y-4 -mx-6 px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent border-none p-0 w-full justify-start overflow-x-auto hide-scrollbar gap-2">
                {['All', 'Songs', 'Playlists', 'Albums', 'Artists'].map(tab => {
                  const val = tab.toLowerCase();
                  return (
                    <TabsTrigger 
                      key={val} 
                      value={val} 
                      className="rounded-full px-6 py-2.5 h-auto text-[14px] font-semibold border border-transparent data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-white/20 hover:bg-white/5 transition-all"
                    >
                      {tab}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search Library..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 rounded-full h-10 text-[14px] focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
          >
            {activeTab === 'all' && (
              <>
                {/* Recently Played Horizontal Carousel */}
                {data.recent?.length > 0 && (
                  <section className="relative">
                    <div className="flex justify-between items-end mb-6">
                      <h2 className="text-[28px] font-bold text-white">Recently Played</h2>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => scrollContainer(recentScrollRef, 'left')}>
                          <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => scrollContainer(recentScrollRef, 'right')}>
                          <ChevronRight className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                    
                    <div 
                      ref={recentScrollRef} 
                      className="flex overflow-x-auto hide-scrollbar gap-5 pb-8 -mx-6 px-6 snap-x"
                    >
                      {data.recent.map((r:any) => (
                        <div key={r.id} className="snap-start">
                          {renderRecentCard(r)}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-12">
                    {/* Favorite Artists Horizontal Carousel */}
                    {data.artists?.length > 0 && (
                      <section className="relative">
                        <div className="flex justify-between items-end mb-6">
                          <h2 className="text-[24px] font-bold text-white">Favorite Artists</h2>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => scrollContainer(artistScrollRef, 'left')}>
                              <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => scrollContainer(artistScrollRef, 'right')}>
                              <ChevronRight className="w-6 h-6" />
                            </Button>
                          </div>
                        </div>
                        
                        <div 
                          ref={artistScrollRef} 
                          className="flex overflow-x-auto hide-scrollbar gap-6 pb-8 -mx-2 px-2 snap-x"
                        >
                          {data.artists.map((a:any) => (
                            <div key={a.id} className="snap-start">
                              {renderArtistCard(a)}
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Recommendations */}
                    {data.recommendations?.length > 0 && (
                      <section className="pt-8 border-t border-white/5">
                        <h2 className="text-[28px] font-bold text-white mb-2">Recommendations</h2>
                        <p className="text-[16px] text-muted-foreground mb-8">Crafted for your taste</p>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                          {data.recommendations.map((rec:any) => (
                            <div key={rec.id} className="group overflow-hidden rounded-2xl p-6 border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer flex flex-col gap-4">
                              <div className="flex items-center gap-6">
                                <FallbackImage src={rec.image} alt={rec.title} fallbackType="playlist" className="w-20 h-20 rounded-lg shadow-md group-hover:scale-105 transition-transform shrink-0" />
                                <div>
                                  <p className="text-[12px] text-primary font-bold uppercase tracking-wider mb-1">{rec.reason}</p>
                                  <h3 className="text-[20px] font-bold text-white">{rec.title}</h3>
                                </div>
                                <div className="ml-auto w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                                  <Play className="w-5 h-5 text-primary fill-primary ml-1" />
                                </div>
                              </div>

                              {/* Sub items inside Recommendation */}
                              {rec.subItems && (
                                <div className="flex gap-4 pt-4 border-t border-white/5">
                                  {rec.subItems.map((sub: any, i: number) => (
                                    <div key={i} className="flex flex-col items-center gap-2">
                                      <FallbackImage src={sub.image} alt={sub.title} fallbackType="album" className="w-16 h-16 rounded-md shadow-sm" />
                                      <span className="text-[10px] text-muted-foreground truncate w-16 text-center">{sub.title}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                  
                  {/* Right Column: Social & Activity */}
                  <div className="space-y-8">
                    {/* Friends Activity */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col">
                      <h3 className="text-[20px] font-bold mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-indigo-400" /> Friends Activity</h3>
                      <div className="space-y-4">
                        {data.friendsActivity?.map((fa:any) => (
                          <div key={fa.id} className="flex items-start gap-3 group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                               <span className="font-bold text-white text-[14px]">{fa.user.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-[14px] text-white/90">
                                <span className="font-bold text-white">{fa.user}</span> {fa.action}
                              </p>
                              <p className="text-[14px] font-semibold text-primary/90 truncate">{fa.detail}</p>
                              <p className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3 h-3"/> {fa.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col h-[400px]">
                      <h3 className="text-[20px] font-bold mb-6 flex items-center gap-2">Your Activity</h3>
                      <div className="space-y-0 overflow-y-auto hide-scrollbar pr-4 flex-1">
                        {data.activity?.map((act:any, index: number) => (
                          <div key={act.id} className="flex gap-4 relative pb-6">
                            {/* Vertical Line */}
                            {index !== data.activity.length - 1 && (
                              <div className="absolute left-4 top-8 bottom-0 w-px bg-white/10" />
                            )}
                            
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 z-10 border border-white/5">
                              {renderTimelineIcon(act.type)}
                            </div>
                            
                            <div className="flex-1 bg-white/[0.02] p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                              <p className="text-[12px] text-muted-foreground mb-1">{act.date}</p>
                              <p className="text-[14px] text-white">
                                <span className="font-semibold text-primary/90">{act.action}</span> {act.detail}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Empty States for other tabs */}
            {['songs', 'albums'].includes(activeTab) && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                <Music2 className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-[24px] font-bold mb-2 text-white">No items found</h3>
                <p className="text-[14px] text-muted-foreground">Try clearing your search or checking another tab.</p>
              </div>
            )}
            
            {activeTab === 'playlists' && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {filteredPlaylists.map((p:any) => renderPlaylistCard(p))}
              </div>
            )}

            {activeTab === 'artists' && (
              <div className="flex flex-wrap gap-6 pt-4">
                {filteredArtists.map((a:any) => renderArtistCard(a))}
              </div>
            )}
            
          </motion.div>
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
