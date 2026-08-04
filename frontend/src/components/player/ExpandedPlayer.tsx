import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Heart, ListPlus, Mic2, MonitorSpeaker, ListMusic, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePlayer } from '../../context/PlayerContext';
import { PlayerSong } from '../../services/PlayerService';
import { useDominantColor } from '../../hooks/useDominantColor';
import { QueuePanel } from './QueuePanel';
import { LyricsPanel } from './LyricsPanel';
import { CreditsPanel } from './expanded/CreditsPanel';
import { RelatedPanel } from './expanded/RelatedPanel';
import { MoreMenu } from './MoreMenu';
import { BadgeCheck, Sparkles } from 'lucide-react';

const TABS = [
  { id: 'queue', label: 'Queue', icon: ListMusic },
  { id: 'lyrics', label: 'Lyrics', icon: Mic2 },
  { id: 'related', label: 'Related', icon: Sparkles },
  { id: 'credits', label: 'Credits', icon: Info }
] as const;

interface ExpandedPlayerProps {
  currentSong: PlayerSong;
  isMobile: boolean;
  onClose: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
  onAddToPlaylist: () => void;
  onAddToQueue: () => void;
}

export function ExpandedPlayer({
  currentSong,
  isMobile,
  onClose,
  isLiked,
  onToggleLike,
  onAddToPlaylist,
  onAddToQueue
}: ExpandedPlayerProps) {
  const { isPlaying, togglePlay, progress, duration, seekTo, volume, setVolume, nextTrack, prevTrack, isReady, queue, playSong, removeFromQueue, reorderQueue } = usePlayer();
  
  const [activeTab, setActiveTab] = useState<'queue' | 'lyrics' | 'related' | 'credits'>('queue');
  const { color: dominantColor } = useDominantColor(currentSong?.song_image, 'hsl(var(--primary))');

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    if (offset.y > 100 || velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        drag={isMobile ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={isMobile ? handleDragEnd : undefined}
        className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col overflow-hidden"
        style={{ 
          '--player-accent': dominantColor,
          '--player-glow': `${dominantColor}40` // 25% opacity for glow
        } as React.CSSProperties}
      >
        {/* Dynamic Background with Cinematic Layers */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#0a0a0a]">
          <motion.div 
            key={currentSong.song_uri + '-bg'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 blur-[120px] scale-[1.8] saturate-[1.5]"
            style={{ backgroundImage: `url(${currentSong.song_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#0a0a0a]/80 to-[#0a0a0a]" />
          {/* Noise texture for cinematic feel */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
          {/* Animated Soft Lighting */}
          <motion.div 
            animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--player-accent) 0%, transparent 70%)' }}
          />
        </div>
        
        {/* Header (Slimmer) */}
        <div className="relative z-10 flex justify-between items-center px-6 pt-6 md:px-8 md:pt-6 shrink-0 h-20">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <ChevronDown className="w-8 h-8" />
          </Button>
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Now Playing</span>
            <span className="text-sm font-semibold text-white truncate max-w-[200px]">{currentSong.song_title}</span>
          </div>
          <MoreMenu 
            song={currentSong} 
            isLiked={isLiked} 
            onLike={onToggleLike} 
            onAddToPlaylist={onAddToPlaylist} 
            onAddToQueue={onAddToQueue} 
          />
        </div>

        {/* Main Content Area - 3 Column Layout */}
        <div className="relative z-10 flex-1 flex flex-col lg:flex-row w-full max-w-[1700px] mx-auto overflow-hidden px-4 md:px-8 pb-4">
          
          {/* LEFT COLUMN: Artwork (32% -> 28%) */}
          <div className="hidden lg:flex flex-col w-[32%] xl:w-[30%] 2xl:w-[28%] items-center justify-center pr-6 h-full shrink-0 group perspective-1000">
            {/* Live Atmosphere & Artwork Container */}
            <div className="relative w-full max-w-[520px] aspect-square flex items-center justify-center mb-8 transform-gpu transition-transform duration-500 hover:rotate-y-[-2deg] hover:rotate-x-[2deg]">
              {/* Soft animated particles behind artwork */}
              <motion.div 
                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-10%] blur-[60px] opacity-30 rounded-full z-0 pointer-events-none"
                style={{ background: `radial-gradient(circle, var(--player-accent) 0%, transparent 70%)` }}
              />
              
              <motion.div 
                layoutId="album-art"
                className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:shadow-[0_30px_60px_var(--player-glow)] transition-shadow duration-700"
              >
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentSong.song_uri}
                    src={currentSong.song_image} 
                    alt={currentSong.song_title} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full h-full object-cover" 
                  />
                </AnimatePresence>
              </motion.div>
            </div>
            
            {/* Secondary Actions under artwork */}
            <div className="flex items-center justify-center gap-6 w-full opacity-80 hover:opacity-100 transition-opacity">
               <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={onToggleLike}>
                 <Heart className={`w-6 h-6 ${isLiked ? 'fill-primary text-primary' : ''}`} />
               </Button>
               <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                 <ListPlus className="w-6 h-6" />
               </Button>
               <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                 <MonitorSpeaker className="w-6 h-6" />
               </Button>
            </div>
          </div>

          {/* CENTER COLUMN: Hero Controls (36% -> 44%) */}
          <div className="flex-1 lg:w-[36%] xl:w-[40%] 2xl:w-[44%] flex flex-col items-center justify-center shrink-0 h-full overflow-hidden px-4 lg:px-8">
            
            {/* Mobile Artwork (Hidden on desktop) */}
            <div className="lg:hidden relative w-full max-w-[320px] aspect-square flex items-center justify-center mb-8 mx-auto mt-auto">
              <motion.div 
                layoutId="album-art-mobile"
                className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              >
                 <img src={currentSong.song_image} alt={currentSong.song_title} className="w-full h-full object-cover" />
              </motion.div>
            </div>

            {/* Song Info */}
            <div className="w-full max-w-[600px] flex flex-col items-center text-center mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 flex items-center gap-2">
                  <div className="flex items-end gap-[2px] h-3">
                    <motion.div animate={{ height: isPlaying ? ["20%", "80%", "40%"] : "20%" }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} className="w-0.5 bg-primary rounded-t-sm" />
                    <motion.div animate={{ height: isPlaying ? ["60%", "30%", "100%"] : "20%" }} transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }} className="w-0.5 bg-primary rounded-t-sm" />
                    <motion.div animate={{ height: isPlaying ? ["30%", "100%", "50%"] : "20%" }} transition={{ duration: 1.0, repeat: Infinity, ease: "easeInOut" }} className="w-0.5 bg-primary rounded-t-sm" />
                  </div>
                  Now Playing
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold truncate text-white mb-2 tracking-tight w-full drop-shadow-md">{currentSong.song_title}</h2>
              <p className="text-lg md:text-xl text-white/70 truncate w-full font-medium">{currentSong.song_artist}</p>
              <p className="text-sm text-white/40 truncate w-full mt-1">{currentSong.song_album || 'Single'}</p>
            </div>

            {/* Progress Bar & Controls */}
            <div className="w-full max-w-[600px] flex flex-col items-center">
              <div className="w-full mb-8 group flex items-center gap-4">
                <span className="text-[11px] font-semibold text-white/50 tracking-wider w-10 text-right">{formatTime(progress)}</span>
                <Slider 
                  value={[progress]} 
                  max={duration || 100} 
                  step={1}
                  onValueChange={(val) => seekTo(val[0])}
                  className="flex-1 cursor-pointer py-2 [&_[role=slider]]:opacity-0 group-hover:[&_[role=slider]]:opacity-100 transition-opacity"
                  style={{ '--primary': 'var(--player-accent)' } as any}
                />
                <span className="text-[11px] font-semibold text-white/50 tracking-wider w-10">{formatTime(duration)}</span>
              </div>

              <div className="w-full flex justify-center items-center gap-6 md:gap-8 mb-8">
                <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-10 w-10">
                  <Shuffle className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={prevTrack} className="text-white hover:bg-white/10 rounded-full h-14 w-14">
                  <SkipBack className="w-7 h-7 md:w-8 md:h-8 fill-current" />
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={togglePlay} 
                    className="rounded-full h-20 w-20 md:h-24 md:w-24 bg-white text-black hover:bg-gray-200 transition-all duration-300 shadow-[0_0_30px_var(--player-glow)]"
                  >
                    {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
                  </Button>
                </motion.div>
                <Button variant="ghost" size="icon" onClick={nextTrack} className="text-white hover:bg-white/10 rounded-full h-14 w-14">
                  <SkipForward className="w-7 h-7 md:w-8 md:h-8 fill-current" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-10 w-10">
                  <Repeat className="w-5 h-5" />
                </Button>
              </div>

              {/* Volume & Quality (Desktop) */}
              <div className="hidden lg:flex w-full justify-between items-center px-4 mt-4">
                <div className="flex items-center gap-3 w-48">
                  <Volume2 className="w-4 h-4 text-white/50 shrink-0" />
                  <Slider value={[volume * 100]} max={100} step={1} onValueChange={(val) => setVolume(val[0] / 100)} className="w-full" />
                </div>
                <div className="flex items-center gap-2 text-white/50">
                  <span className="text-[10px] uppercase font-bold tracking-widest border border-white/10 px-2 py-0.5 rounded-sm">High Quality</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Tab Panel (32% -> 28%) */}
          {!isMobile && (
            <div className="w-[32%] xl:w-[30%] 2xl:w-[28%] h-full flex flex-col shrink-0 pl-6 border-l border-white/5">
              {/* Tab Navigation */}
              <div className="flex items-center justify-between px-2 py-2 shrink-0 mb-4 bg-white/5 rounded-full p-1 border border-white/5">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center justify-center gap-1.5 flex-1 py-2 px-1 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all ${
                      activeTab === tab.id 
                        ? 'bg-white/10 text-white shadow-sm' 
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content with Transitions */}
              <div className="flex-1 relative overflow-hidden bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 pt-4"
                  >
                    {activeTab === 'queue' && (
                      <QueuePanel 
                        queue={queue} 
                        currentSongIndex={queue.findIndex(s => s.song_uri === currentSong.song_uri)} 
                        onPlaySong={(idx) => {
                          const s = queue[idx];
                          if (s) playSong(s, false, 'auto');
                        }}
                        onRemove={removeFromQueue}
                        onReorder={() => {}}
                      />
                    )}
                    {activeTab === 'lyrics' && <LyricsPanel song={currentSong} />}
                    {activeTab === 'related' && <RelatedPanel song={currentSong} />}
                    {activeTab === 'credits' && <CreditsPanel song={currentSong} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>



        {/* Mobile Bottom Navigation for Panels */}
        {isMobile && (
          <div className="relative z-10 w-full flex items-center justify-center gap-2 py-4 px-4 mt-auto bg-black/20 backdrop-blur-md">
            <Button variant={activeTab === 'related' ? 'secondary' : 'ghost'} className={`rounded-full flex-1 text-[11px] ${activeTab === 'related' ? 'text-black' : 'text-white'}`} onClick={() => setActiveTab('related')}>
               Related
            </Button>
            <Button variant={activeTab === 'lyrics' ? 'secondary' : 'ghost'} className={`rounded-full flex-1 text-[11px] ${activeTab === 'lyrics' ? 'text-black' : 'text-white'}`} onClick={() => setActiveTab('lyrics')}>
               Lyrics
            </Button>
            <Button variant={activeTab === 'queue' ? 'secondary' : 'ghost'} className={`rounded-full flex-1 text-[11px] ${activeTab === 'queue' ? 'text-black' : 'text-white'}`} onClick={() => setActiveTab('queue')}>
               Queue
            </Button>
            <Button variant={activeTab === 'credits' ? 'secondary' : 'ghost'} className={`rounded-full flex-1 text-[11px] ${activeTab === 'credits' ? 'text-black' : 'text-white'}`} onClick={() => setActiveTab('credits')}>
               Credits
            </Button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
