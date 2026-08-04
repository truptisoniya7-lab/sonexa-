import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ListPlus, Heart, Share2, Link as LinkIcon, Radio, Flag, User, Disc, EyeOff } from 'lucide-react';
import { PlayerSong } from '../../services/PlayerService';

interface MoreMenuProps {
  song: PlayerSong;
  onLike: () => void;
  isLiked: boolean;
  onAddToPlaylist: () => void;
  onAddToQueue: () => void;
  trigger?: React.ReactNode;
}

export function MoreMenu({ song, onLike, isLiked, onAddToPlaylist, onAddToQueue, trigger }: MoreMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-white">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-zinc-100">
        <DropdownMenuItem onClick={onAddToQueue} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
          <ListPlus className="w-4 h-4 mr-2" />
          Add to queue
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onLike} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
          <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-primary text-primary' : ''}`} />
          {isLiked ? 'Remove from your Liked Songs' : 'Save to your Liked Songs'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddToPlaylist} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
          <ListPlus className="w-4 h-4 mr-2" />
          Add to playlist
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem className="cursor-pointer hover:bg-white/10 focus:bg-white/10 opacity-50">
          <User className="w-4 h-4 mr-2" />
          Go to artist
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-white/10 focus:bg-white/10 opacity-50">
          <Disc className="w-4 h-4 mr-2" />
          Go to album
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-white/10 focus:bg-white/10 opacity-50">
          <Radio className="w-4 h-4 mr-2" />
          Go to song radio
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem onClick={() => {
          navigator.clipboard.writeText(window.location.origin + `/song/${song.song_uri}`);
        }} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
          <LinkIcon className="w-4 h-4 mr-2" />
          Copy Song Link
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
          <EyeOff className="w-4 h-4 mr-2" />
          Hide this song
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
          <Flag className="w-4 h-4 mr-2" />
          Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
