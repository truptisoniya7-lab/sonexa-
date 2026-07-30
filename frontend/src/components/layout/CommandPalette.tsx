"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, X, Clock, Music, ListMusic, PlayCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { usePlayer } from "@/context/PlayerContext"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"

export function CommandPalette() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { playSong } = usePlayer()

  // Shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 500)
    return () => clearTimeout(timer)
  }, [query])

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return null
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      if (!res.ok) throw new Error('Search failed')
      return res.json()
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  })

  const [selectedIndex, setSelectedIndex] = useState(-1)
  const allItems = React.useMemo(() => {
    if (!searchResults) return []
    return [
      ...(searchResults.songs || []),
      ...(searchResults.artists || []),
      ...(searchResults.playlists || []),
      ...(searchResults.rooms || [])
    ]
  }, [searchResults])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < allItems.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < allItems.length) {
        const item = allItems[selectedIndex]
        if ('uri' in item) handlePlaySong(item)
      } else {
        handleSelectText(query)
      }
    }
  }

  useEffect(() => {
    setSelectedIndex(-1)
  }, [debouncedQuery])

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch (e) {}
    }
  }, [])

  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSelectText = (text: string) => {
    saveRecentSearch(text)
    setQuery(text)
  }

  const handlePlaySong = (song: any) => {
    saveRecentSearch(song.title)
    setIsOpen(false)
    playSong({
      song_uri: song.uri,
      song_title: song.title,
      song_artist: song.artist,
      song_image: song.image
    })
  }

  const removeRecent = (e: React.MouseEvent, text: string) => {
    e.stopPropagation()
    const updated = recentSearches.filter(s => s !== text)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    const regex = new RegExp(`(${q})`, 'gi');
    return text.split(regex).map((part, i) => 
      part.toLowerCase() === q.toLowerCase() ? <strong key={i} className="text-primary">{part}</strong> : part
    );
  }

  let globalIndex = -1;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 md:px-4 h-12 w-full max-w-md rounded-full glass hover:bg-white/5 transition-all text-muted-foreground group">
          <Search className="w-5 h-5 group-hover:text-primary transition-colors shrink-0" />
          <span className="text-[15px] flex-1 text-left truncate">Search music, artists...</span>
          <kbd className="hidden md:inline-flex h-6 items-center gap-1 rounded border border-border/50 bg-white/5 px-2 font-mono text-[11px] font-medium text-muted-foreground opacity-100 shrink-0">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-background/40 backdrop-blur-3xl border-white/10 shadow-glow-lg rounded-2xl">
        <DialogTitle className="sr-only">Search Command Palette</DialogTitle>
        <div className="flex items-center px-4 py-3 border-b border-white/10">
          <Search className="w-5 h-5 text-primary/70 mr-3" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type to search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg px-0 placeholder:text-muted-foreground/60 h-10 shadow-none"
          />
          {query && (
            <X 
              className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-white transition-colors ml-2" 
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            />
          )}
        </div>

        <ScrollArea className="max-h-[60vh]">
          <AnimatePresence mode="popLayout">
            {!debouncedQuery ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-4 space-y-4"
              >
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Searches</h3>
                {recentSearches.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No recent searches.</p>
                ) : (
                  <div className="space-y-1">
                    {recentSearches.map((recent, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                        key={idx} 
                        onClick={() => handleSelectText(recent)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium">{recent}</span>
                        </div>
                        <X 
                          className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all" 
                          onClick={(e) => removeRecent(e, recent)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-4 space-y-6"
              >
                {isLoading && (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
                
                {!isLoading && searchResults && (
                  <>
                    {searchResults.songs?.length > 0 && (
                      <section>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Songs</h3>
                        <div className="space-y-1">
                          {searchResults.songs.map((song: any, idx: number) => {
                            globalIndex++;
                            const isActive = globalIndex === selectedIndex;
                            return (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                key={song.uri} 
                                onClick={() => handlePlaySong(song)} 
                                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer group transition-all ${isActive ? 'bg-primary/20 border-primary/50' : 'hover:bg-white/10'}`}
                              >
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-lg">
                                  <img src={song.image} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><PlayCircle className="w-6 h-6 text-white" /></div>
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{highlightMatch(song.title, debouncedQuery)}</span>
                                  <span className="text-xs text-muted-foreground truncate">{highlightMatch(song.artist, debouncedQuery)}</span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </section>
                    )}

                    {searchResults.playlists?.length > 0 && (
                      <section>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-6">Playlists</h3>
                        <div className="space-y-1">
                          {searchResults.playlists.map((pl: any, idx: number) => {
                            globalIndex++;
                            const isActive = globalIndex === selectedIndex;
                            return (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                key={pl.id} 
                                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer group transition-all ${isActive ? 'bg-primary/20 border-primary/50' : 'hover:bg-white/10'}`}
                              >
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{highlightMatch(pl.title, debouncedQuery)}</span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </section>
                    )}
                    
                    {allItems.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p className="text-lg font-medium text-foreground">No results found</p>
                        <p className="text-sm text-muted-foreground">Try a different search term</p>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
