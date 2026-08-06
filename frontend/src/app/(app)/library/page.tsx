'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Heart, Clock, Star, Music2, ListMusic, Mic2, Disc3,
  Search, Plus, Download, Pin, ChevronLeft, ChevronRight, User, Users,
  Lock, Music, MessageSquare, Activity, PlayCircle, ListVideo, Disc, Mic 
} from 'lucide-react';
import { NowPlayingCinematic } from '@/components/room/NowPlayingCinematic';
import { QueuePanel } from '@/components/room/QueuePanel';
import { useDynamicTheme } from '@/components/room/hooks/useDynamicTheme';
import { AnimatedBackground } from '@/components/library/AnimatedBackground';
import { LibraryHeroCanvas } from '@/components/library/3d/LibraryHeroCanvas';
import { AnimatedCounter } from '@/components/library/AnimatedCounter';
import { SongCard } from '@/components/library/cards/SongCard';
import { AlbumCard } from '@/components/library/cards/AlbumCard';
import { PlaylistCard } from '@/components/library/cards/PlaylistCard';
import { ArtistCard } from '@/components/library/cards/ArtistCard';
import { RecommendationCard } from '@/components/library/cards/RecommendationCard';
import { HistoryCard } from '@/components/library/cards/HistoryCard';
import { EmptyVault } from '@/components/library/EmptyVault';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlayer } from '@/context/PlayerContext';
import { PlayerService } from '@/services/PlayerService';

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
  const { currentSong, playSong } = usePlayer();

  const recentScrollRef = useRef<HTMLDivElement>(null);
  const artistScrollRef = useRef<HTMLDivElement>(null);

  const fetchLibraryData = async () => {
    try {
      const res = await fetch('/api/library');
      const d = await res.json();
      
      const localLikes = await PlayerService.getLikedSongs();
      const localPlaylists = await PlayerService.getPlaylists();
      
      d.summary = d.summary || {};
      d.summary.likedSongs = localLikes.length;
      
      const mappedPlaylists = localPlaylists.map((p: any) => ({
          id: p.id,
          type: 'Playlist',
          title: p.name,
          image: p.cover_image || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&q=80',
          count: '0 Songs',
          creator: 'You'
      }));
      
      d.playlists = [...mappedPlaylists, ...(d.playlists || [])];
      d.summary.playlists = d.playlists.length;
      d.likedSongsList = localLikes;
      
      setData(d);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
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

  const [viewMode, setViewMode] = useState<'list'|'grid'|'galaxy'>('grid');

  const bgGradient = useMemo(() => {
    if (currentSong) return currentSong as any;
    if (data?.continueListening) {
      return {
        id: data.continueListening.id || data.continueListening.song_id,
        song_title: data.continueListening.title,
        song_artist: data.continueListening.artist,
        song_image: data.continueListening.image,
        song_url: data.continueListening.song_url || data.continueListening.url,
        progress_ms: data.continueListening.progress_ms,
        duration_ms: data.continueListening.duration_ms,
        progress: data.continueListening.progress
      };
    }
    return null;
  }, [currentSong, data]);

  const heroSong = useMemo(() => {
    if (currentSong) return currentSong as any;
    if (data?.continueListening) {
      return {
        id: data.continueListening.id || data.continueListening.song_id,
        song_title: data.continueListening.title,
        song_artist: data.continueListening.artist,
        song_image: data.continueListening.image,
        song_url: data.continueListening.song_url || data.continueListening.url,
        progress_ms: data.continueListening.progress_ms,
        duration_ms: data.continueListening.duration_ms,
        progress: data.continueListening.progress
      };
    }
    return null;
  }, [currentSong, data]);

  const handlePlay = (item: any) => {
    playSong({
      song_uri: item.uri || item.id || item.song_uri,
      song_title: item.title || item.song_title || item.name || 'Unknown',
      song_artist: item.artist || item.song_artist || 'Unknown',
      song_image: item.image || item.song_image || item.image_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17',
    } as any);
  };

  const theme = useDynamicTheme(heroSong?.song_image);

  const scrollContainer = (ref: any, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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

  if (loading || !data) {
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
    <div className="w-full h-full flex flex-col overflow-y-auto overflow-x-hidden hide-scrollbar scroll-smooth pb-24 relative z-10 text-white" style={{ backgroundColor: 'transparent' }}>
      <AnimatedBackground dominantColor={theme.primary} isDark={theme.isDark} />
      
      <div className="max-w-[1400px] mx-auto w-full px-6 py-8 space-y-12 relative z-10">
        
        {/* Dynamic Hero Section - Two Column Layout */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-[30px] overflow-hidden relative shadow-[0_8px_32px_rgba(0,0,0,0.2)] bg-white/[0.04] p-8 md:p-12 border border-white/[0.08] backdrop-blur-2xl transition-colors duration-1000"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />
          
          <div className="relative z-10 w-full flex flex-col lg:flex-row items-center gap-12">
            
            {/* Left Column: 3D Hero & Context */}
            <div className="flex-1 flex flex-col md:flex-row items-center md:items-start gap-8 w-full">
              <LibraryHeroCanvas currentSong={heroSong} theme={theme} />
              
              <div className="flex flex-col pt-4">
                <h1 className="text-[20px] font-bold text-white/60 mb-2 tracking-widest uppercase flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" /> 
                  {heroSong ? 'Continue Listening' : `Welcome, ${data.greeting}`}
                </h1>
                
                {heroSong ? (
                  <>
                    <h2 className="text-[40px] font-extrabold text-white mb-2 leading-tight">{heroSong.song_title}</h2>
                    <p className="text-[20px] text-white/80 mb-6 font-medium">{heroSong.song_artist}</p>
                    <div className="flex items-center gap-3">
                      <Button size="lg" className="rounded-full bg-primary text-white hover:bg-primary/90 hover:scale-[1.05] transition-all shadow-[0_0_30px_-5px_rgba(var(--primary),0.6)] font-bold px-8 h-12 text-[16px]" onClick={() => playSong(heroSong)}>
                        <Play className="w-5 h-5 mr-2 fill-current" /> Resume
                      </Button>
                      <Button size="icon" variant="outline" className="rounded-full border-white/20 bg-white/5 hover:bg-white/20 hover:text-white w-12 h-12">
                        <Heart className="w-5 h-5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-[18px] text-white/80 mt-2 max-w-md">
                    Start liking songs and creating playlists to build your personal music vault.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Listening Stats */}
            <div className="w-full lg:w-[400px] shrink-0">
              <div className="grid grid-cols-2 gap-4">
                <AnimatedCounter value={data.summary?.likedSongs || 0} label="Favorites" icon={<Heart className="w-4 h-4"/>} onClick={() => setActiveTab('songs')} />
                <AnimatedCounter value={data.summary?.playlists || 0} label="Playlists" icon={<ListVideo className="w-4 h-4"/>} onClick={() => setActiveTab('playlists')} />
                <AnimatedCounter value={data.stats?.totalSongs || 0} label="Songs Played" icon={<Disc className="w-4 h-4"/>} onClick={() => setActiveTab('songs')} />
                <AnimatedCounter value={data.stats?.completionRate || 0} label="Completion %" icon={<Activity className="w-4 h-4"/>} onClick={() => setActiveTab('history')} />
                <div className="col-span-2">
                   <AnimatedCounter value={data.stats?.hoursListened || 0} label="Hours Listened" icon={<Clock className="w-4 h-4"/>} />
                </div>
              </div>
            </div>
            
          </div>
        </motion.div>


        {/* Search & Filters */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl py-4 border-b border-white/[0.05] space-y-4 -mx-6 px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            
            {/* Animated Pills */}
            <div className="flex gap-2 p-1 bg-white/[0.04] rounded-full border border-white/[0.08] backdrop-blur-md overflow-x-auto hide-scrollbar max-w-full">
              {['All', 'Songs', 'Playlists', 'History'].map(tab => {
                const val = tab.toLowerCase();
                const isActive = activeTab === val;
                return (
                  <button
                    key={val}
                    onClick={() => setActiveTab(val)}
                    className={`relative px-6 py-2 rounded-full text-[14px] font-bold transition-colors whitespace-nowrap z-10 ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabIndicator" 
                        className="absolute inset-0 bg-white/10 border border-white/10 rounded-full -z-10 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {tab}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto">
              {/* View Switcher */}
              <div className="hidden sm:flex bg-white/[0.04] p-1 rounded-full border border-white/[0.08]">
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`} title="List View"><ListMusic className="w-4 h-4"/></button>
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`} title="Grid View"><Disc3 className="w-4 h-4"/></button>
                <button onClick={() => setViewMode('galaxy')} className={`p-2 rounded-full transition-all ${viewMode === 'galaxy' ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'text-white/40 hover:text-white/70'}`} title="Galaxy View"><Star className="w-4 h-4"/></button>
              </div>

              {/* Search */}
              <div className="relative flex-1 lg:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input 
                  placeholder="Search Vault..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/[0.04] border-white/[0.08] rounded-full h-11 text-[14px] focus-visible:ring-primary text-white placeholder:text-white/30 transition-all hover:bg-white/[0.06]"
                />
              </div>
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
              (!data.recent?.length && !data.artists?.length && !data.recommendations?.length && !data.activity?.length) ? (
                <div className="py-12">
                  <EmptyVault type="songs" />
                </div>
              ) : (
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
                        <div key={r.id} className="snap-start w-[300px]">
                          <SongCard song={r} onPlay={() => handlePlay(r)} />
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
                              <ArtistCard artist={a} onClick={() => handlePlay(a)} />
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
                            <div key={rec.id} className="group overflow-hidden rounded-2xl p-6 border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer flex flex-col gap-4" onClick={() => handlePlay(rec)}>
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
                    <div className="bg-white/[0.04] rounded-3xl p-6 border border-white/[0.08] flex flex-col h-[400px]">
                      <h3 className="text-[20px] font-bold mb-6 flex items-center gap-2">Listening History</h3>
                      <div className="space-y-6 overflow-y-auto hide-scrollbar pr-2 flex-1">
                        
                        {/* Mock Grouping for the redesign */}
                        <div className="space-y-4">
                          <h4 className="text-[12px] font-bold text-white/40 uppercase tracking-widest sticky top-0 bg-background/90 backdrop-blur-md py-1 z-10">Today</h4>
                          {data.activity?.slice(0,2).map((act:any, index: number) => (
                            <div key={act.id} className="flex gap-4 relative">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 z-10 border border-white/5">
                                {renderTimelineIcon(act.type)}
                              </div>
                              <div className="flex-1 bg-white/[0.02] p-3 rounded-xl border border-white/5 hover:bg-white/[0.06] transition-colors">
                                <p className="text-[12px] text-muted-foreground mb-1">{act.date}</p>
                                <p className="text-[14px] text-white">
                                  <span className="font-semibold text-primary/90">{act.action}</span> {act.detail}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-[12px] font-bold text-white/40 uppercase tracking-widest sticky top-0 bg-background/90 backdrop-blur-md py-1 z-10">Yesterday</h4>
                          {data.activity?.slice(2,4).map((act:any, index: number) => (
                            <div key={act.id} className="flex gap-4 relative">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 z-10 border border-white/5">
                                {renderTimelineIcon(act.type)}
                              </div>
                              <div className="flex-1 bg-white/[0.02] p-3 rounded-xl border border-white/5 hover:bg-white/[0.06] transition-colors">
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
                </div>
              </>
              )
            )}

            {/* Songs Tab (Liked Songs) */}
            {activeTab === 'songs' && (
              <div className="flex flex-col gap-2">
                {(!data.likedSongsList || data.likedSongsList.length === 0) ? (
                  <EmptyVault type="songs" />
                ) : (
                  data.likedSongsList.map((song: any, i: number) => (
                    <SongCard key={i} song={song} onPlay={() => handlePlay(song)} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'playlists' && (
              filteredPlaylists.length === 0 ? <EmptyVault type="playlists" /> :
              <div className={viewMode === 'list' ? "flex flex-col gap-4" : "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5"}>
                {filteredPlaylists.map((p:any) => <PlaylistCard key={p.id} playlist={p} onClick={() => handlePlay(p)} />)}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="flex flex-col gap-8">
                {(!data.recent || data.recent.length === 0) ? (
                  <div className="py-12">
                    <EmptyVault type="songs" />
                  </div>
                ) : (
                  <>
                    {data.historyGrouped?.today?.length > 0 && (
                      <section>
                        <h3 className="text-[18px] font-bold text-white mb-4 px-2">Today</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {data.historyGrouped.today.map((song: any, i: number) => (
                            <HistoryCard key={song.id || i} item={song} onPlay={() => handlePlay(song)} />
                          ))}
                        </div>
                      </section>
                    )}
                    {data.historyGrouped?.yesterday?.length > 0 && (
                      <section>
                        <h3 className="text-[18px] font-bold text-white mb-4 px-2">Yesterday</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {data.historyGrouped.yesterday.map((song: any, i: number) => (
                            <HistoryCard key={song.id || i} item={song} onPlay={() => handlePlay(song)} />
                          ))}
                        </div>
                      </section>
                    )}
                    {data.historyGrouped?.last7Days?.length > 0 && (
                      <section>
                        <h3 className="text-[18px] font-bold text-white mb-4 px-2">Last 7 Days</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {data.historyGrouped.last7Days.map((song: any, i: number) => (
                            <HistoryCard key={song.id || i} item={song} onPlay={() => handlePlay(song)} />
                          ))}
                        </div>
                      </section>
                    )}
                    {data.historyGrouped?.last30Days?.length > 0 && (
                      <section>
                        <h3 className="text-[18px] font-bold text-white mb-4 px-2">Last 30 Days</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {data.historyGrouped.last30Days.map((song: any, i: number) => (
                            <HistoryCard key={song.id || i} item={song} onPlay={() => handlePlay(song)} />
                          ))}
                        </div>
                      </section>
                    )}
                    {data.historyGrouped?.older?.length > 0 && (
                      <section>
                        <h3 className="text-[18px] font-bold text-white mb-4 px-2">Older</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {data.historyGrouped.older.map((song: any, i: number) => (
                            <HistoryCard key={song.id || i} item={song} onPlay={() => handlePlay(song)} />
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
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
