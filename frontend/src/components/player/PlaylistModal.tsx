import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlayerService, Playlist, PlayerSong } from '../../services/PlayerService';
import { Plus, ListMusic, Check } from 'lucide-react';

interface PlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: PlayerSong;
}

export function PlaylistModal({ open, onOpenChange, song }: PlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [addedTo, setAddedTo] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      loadPlaylists();
      setAddedTo({});
      setIsCreating(false);
      setNewPlaylistName('');
    }
  }, [open]);

  const loadPlaylists = async () => {
    const list = await PlayerService.getPlaylists();
    setPlaylists(list);
  };

  const handleCreate = async () => {
    if (!newPlaylistName.trim()) return;
    const newPlaylist = await PlayerService.createPlaylist(newPlaylistName.trim());
    await handleAddToPlaylist(newPlaylist.id);
    setNewPlaylistName('');
    setIsCreating(false);
    loadPlaylists();
  };

  const handleAddToPlaylist = async (playlistId: string | number) => {
    await PlayerService.addSongToPlaylist(playlistId, song);
    setAddedTo(prev => ({ ...prev, [playlistId]: true }));
    // Automatically close after a short delay
    setTimeout(() => {
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {!isCreating ? (
            <Button 
              variant="outline" 
              className="w-full justify-start border-dashed border-white/20 hover:border-primary/50 text-muted-foreground hover:text-white"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Playlist
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input 
                autoFocus
                placeholder="Playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="bg-white/5 border-white/10"
              />
              <Button onClick={handleCreate}>Create</Button>
            </div>
          )}

          <div className="space-y-2 mt-2">
            {playlists.length === 0 && !isCreating && (
              <p className="text-center text-sm text-muted-foreground py-4">No playlists yet. Create one!</p>
            )}
            {playlists.map(p => (
              <div 
                key={p.id}
                onClick={() => !addedTo[p.id] && handleAddToPlaylist(p.id)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${addedTo[p.id] ? 'bg-primary/20 border-primary/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center shrink-0">
                    <ListMusic className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-white">{p.name}</span>
                </div>
                {addedTo[p.id] && <Check className="w-5 h-5 text-primary" />}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
