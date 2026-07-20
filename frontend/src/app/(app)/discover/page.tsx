"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Play, Heart, Headphones, Users, Mic2, Disc, Flame, Music, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- MOCK DATA ---
const TRENDING_ROOMS = [
  { id: 1, name: "Late Night Lo-Fi", listeners: 142, host: "chillboy99", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 2, name: "Top Hits 2026", listeners: 89, host: "DJ_Spark", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 3, name: "Synthwave Vibes", listeners: 56, host: "NeonRider", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 4, name: "Acoustic Covers", listeners: 34, host: "SarahG", image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 5, name: "Bollywood Retro", listeners: 210, host: "DesiMelody", image: "https://images.unsplash.com/photo-1588691518385-e23f1ce47b6a?auto=format&fit=crop&q=80&w=300&h=300" },
];

const RECOMMENDED_ALBUMS = [
  { id: 1, title: "Midnight City", artist: "The Synths", image: "https://images.unsplash.com/photo-1619983081563-430f63602796?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 2, title: "Ocean Waves", artist: "Nature Sounds", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 3, title: "Aesthetic Era", artist: "Vaporwave", image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 4, title: "Jazz Lounge", artist: "Smooth Trio", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 5, title: "Pop Anthems", artist: "Various Artists", image: "https://images.unsplash.com/photo-1493225457124-a1a2a4411138?auto=format&fit=crop&q=80&w=300&h=300" },
];

const TRENDING_ARTISTS = [
  { id: 1, name: "The Weeknd", image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=200&h=200" },
  { id: 2, name: "Arijit Singh", image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=200&h=200" },
  { id: 3, name: "Taylor Swift", image: "https://images.unsplash.com/photo-1493225457124-a1a2a4411138?auto=format&fit=crop&q=80&w=200&h=200" },
  { id: 4, name: "Drake", image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200&h=200" },
  { id: 5, name: "Dua Lipa", image: "https://images.unsplash.com/photo-1516575334481-ba3017a4c7e6?auto=format&fit=crop&q=80&w=200&h=200" },
  { id: 6, name: "Ed Sheeran", image: "https://images.unsplash.com/photo-1525362081669-2b476bb628c3?auto=format&fit=crop&q=80&w=200&h=200" },
];

const GENRES = [
  { name: "Pop", color: "from-pink-500 to-rose-500" },
  { name: "Hip-Hop", color: "from-orange-500 to-amber-500" },
  { name: "Electronic", color: "from-blue-500 to-cyan-500" },
  { name: "Rock", color: "from-red-500 to-orange-600" },
  { name: "Lo-Fi", color: "from-purple-500 to-indigo-500" },
  { name: "Classical", color: "from-emerald-500 to-teal-500" },
  { name: "Jazz", color: "from-amber-600 to-yellow-600" },
  { name: "R&B", color: "from-fuchsia-500 to-pink-600" },
];

// --- COMPONENTS ---
const SectionHeader = ({ title, icon: Icon, showMore = true }: { title: string, icon: any, showMore?: boolean }) => (
  <div className="flex items-center justify-between mb-4 mt-8 px-2">
    <h2 className="text-xl font-bold flex items-center gap-2">
      <Icon className="w-5 h-5 text-primary" />
      {title}
    </h2>
    {showMore && (
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white text-xs font-semibold uppercase tracking-wider">
        Show All
      </Button>
    )}
  </div>
);

const HorizontalScroll = ({ children }: { children: React.ReactNode }) => (
  <div className="flex overflow-x-auto pb-4 pt-1 px-2 -mx-2 snap-x snap-mandatory hide-scrollbar gap-4">
    {children}
  </div>
);

const RoomCard = ({ room }: { room: any }) => (
  <div className="group min-w-[240px] max-w-[240px] bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer snap-start shadow-md hover:shadow-xl hover:-translate-y-1">
    <div className="relative h-[120px] w-full overflow-hidden">
      <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute top-2 left-2 bg-red-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-md">
        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        LIVE
      </div>
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium">
          <Users className="w-3.5 h-3.5" />
          {room.listeners}
        </div>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-primary/40">
          <Play className="w-4 h-4 text-white fill-current ml-0.5" />
        </div>
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">{room.name}</h3>
      <p className="text-sm text-muted-foreground truncate mt-0.5 flex items-center gap-1.5">
        <Mic2 className="w-3.5 h-3.5" /> {room.host}
      </p>
    </div>
  </div>
);

const AlbumCard = ({ album }: { album: any }) => (
  <div className="group min-w-[160px] max-w-[160px] cursor-pointer snap-start">
    <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all duration-300">
      <img src={album.image} alt={album.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/40 transform scale-90 group-hover:scale-100 transition-transform duration-300">
          <Play className="w-5 h-5 text-white fill-current ml-1" />
        </div>
      </div>
    </div>
    <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{album.title}</h3>
    <p className="text-xs text-muted-foreground truncate mt-0.5">{album.artist}</p>
  </div>
);

const ArtistCard = ({ artist }: { artist: any }) => (
  <div className="group min-w-[140px] max-w-[140px] flex flex-col items-center cursor-pointer snap-start text-center">
    <div className="relative w-32 h-32 rounded-full overflow-hidden mb-3 shadow-md group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300 ring-2 ring-transparent group-hover:ring-primary/50 ring-offset-4 ring-offset-background">
      <img src={artist.image} alt={artist.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <Play className="w-8 h-8 text-white fill-current opacity-80" />
      </div>
    </div>
    <h3 className="font-semibold text-sm truncate w-full group-hover:text-primary transition-colors">{artist.name}</h3>
    <p className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">Artist</p>
  </div>
);

const GenrePill = ({ genre }: { genre: any }) => (
  <div className={`min-w-[160px] h-[80px] rounded-xl bg-gradient-to-br ${genre.color} p-4 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 snap-start shadow-lg`}>
    <h3 className="text-white font-bold text-lg relative z-10">{genre.name}</h3>
    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-black/20 rounded-full blur-xl" />
    <div className="absolute top-2 right-2 opacity-50 mix-blend-overlay">
      <Disc className="w-12 h-12 rotate-12" />
    </div>
  </div>
);

// --- MAIN PAGE ---
export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-y-auto overflow-x-hidden hide-scrollbar scroll-smooth">
      
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-50 w-full px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-sm">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for artists, songs, podcasts, or rooms..." 
            className="w-full h-12 pl-12 pr-4 bg-white/5 border-white/10 rounded-full focus-visible:ring-primary focus-visible:border-primary text-base shadow-inner transition-all hover:bg-white/10"
          />
        </div>
      </div>

      <div className="px-6 pb-24 max-w-[1400px] mx-auto w-full">
        
        {/* Hero Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mt-6 rounded-3xl overflow-hidden relative shadow-2xl"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-700 to-purple-900" />
          
          {/* Glassmorphism Pattern & Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/40 rounded-full blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4">
              <p className="text-white/80 font-medium tracking-wider text-sm uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Welcome Back
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                Good Evening, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-200">Soniya</span> 👋
              </h1>
              <p className="text-lg text-white/80 max-w-xl">
                Ready to dive back into your world of music? Resume where you left off or discover something entirely new.
              </p>
              
              <div className="flex items-center gap-4 pt-4">
                <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-all shadow-xl font-bold px-8 h-14 text-base">
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Resume Listening
                </Button>
                <Button size="lg" variant="outline" className="rounded-full border-white/20 bg-black/20 hover:bg-black/40 text-white backdrop-blur-md h-14 px-8 text-base transition-all font-semibold hover:border-white/40">
                  Explore New Music
                </Button>
              </div>
            </div>
            
            <div className="hidden lg:block relative shrink-0">
               <div className="w-48 h-48 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl relative">
                  <img src="https://images.unsplash.com/photo-1619983081563-430f63602796?auto=format&fit=crop&q=80&w=400&h=400" alt="Last Played" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-sm">
                    <Music className="w-12 h-12 text-white/50" />
                  </div>
               </div>
               <div className="absolute -bottom-4 -right-4 bg-background border border-white/10 shadow-xl rounded-2xl p-3 flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                 <div className="text-xs font-semibold">Now Playing</div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* --- SECTIONS --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SectionHeader title="Trending Right Now" icon={Flame} />
          <HorizontalScroll>
            {TRENDING_ROOMS.map(room => <RoomCard key={room.id} room={room} />)}
            {TRENDING_ROOMS.map(room => <RoomCard key={room.id + '_dup'} room={room} />)}
          </HorizontalScroll>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SectionHeader title="Recommended For You" icon={Heart} />
          <HorizontalScroll>
            {RECOMMENDED_ALBUMS.map(album => <AlbumCard key={album.id} album={album} />)}
            {RECOMMENDED_ALBUMS.map(album => <AlbumCard key={album.id + '_dup'} album={album} />)}
          </HorizontalScroll>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SectionHeader title="Live Community Rooms" icon={Users} />
          <HorizontalScroll>
            {TRENDING_ROOMS.reverse().map(room => <RoomCard key={room.id} room={room} />)}
          </HorizontalScroll>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <SectionHeader title="Trending Artists" icon={Mic2} />
          <HorizontalScroll>
            {TRENDING_ARTISTS.map(artist => <ArtistCard key={artist.id} artist={artist} />)}
            {TRENDING_ARTISTS.map(artist => <ArtistCard key={artist.id + '_dup'} artist={artist} />)}
          </HorizontalScroll>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <SectionHeader title="Browse by Genre" icon={Disc} showMore={false} />
          <HorizontalScroll>
            {GENRES.map((genre, idx) => <GenrePill key={idx} genre={genre} />)}
          </HorizontalScroll>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <SectionHeader title="Recently Played" icon={Headphones} />
          <HorizontalScroll>
            {RECOMMENDED_ALBUMS.slice().reverse().map(album => <AlbumCard key={album.id} album={album} />)}
          </HorizontalScroll>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <SectionHeader title="Made For You" icon={Heart} />
          <HorizontalScroll>
            {RECOMMENDED_ALBUMS.map(album => <AlbumCard key={album.id} album={album} />)}
          </HorizontalScroll>
        </motion.div>

      </div>
      
      {/* CSS to hide scrollbar but allow scrolling */}
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
