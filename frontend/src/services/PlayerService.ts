import { supabase } from '../lib/supabase';

export interface PlayerSong {
  id?: string;
  song_uri: string;
  song_title: string;
  song_artist: string;
  song_image: string;
  song_album?: string;
  
  // Smart Queue Metadata
  queueSource?: 'manual' | 'auto';
  matchScore?: number;
  recommendationReason?: string;
}

export interface Playlist {
  id: number | string;
  name: string;
  description?: string;
  cover_image?: string;
}

export class PlayerService {
  // Temporary boolean to flip when Supabase endpoints are ready
  private static useSupabase = false;

  // LIKED SONGS
  static async getLikedSongs(): Promise<PlayerSong[]> {
    if (this.useSupabase) {
      // Future Supabase implementation
      return [];
    } else {
      const stored = localStorage.getItem('sonexa_likes');
      return stored ? JSON.parse(stored) : [];
    }
  }

  static async isLiked(songUri: string): Promise<boolean> {
    const likes = await this.getLikedSongs();
    return likes.some(s => s.song_uri === songUri);
  }

  static async toggleLike(song: PlayerSong): Promise<boolean> {
    if (this.useSupabase) {
      // Future Supabase implementation
      return false;
    } else {
      let likes = await this.getLikedSongs();
      const exists = likes.some(s => s.song_uri === song.song_uri);
      
      if (exists) {
        likes = likes.filter(s => s.song_uri !== song.song_uri);
      } else {
        likes.push(song);
      }
      
      localStorage.setItem('sonexa_likes', JSON.stringify(likes));
      return !exists;
    }
  }

  // PLAYLISTS
  static async getPlaylists(): Promise<Playlist[]> {
    if (this.useSupabase) {
      return [];
    } else {
      const stored = localStorage.getItem('sonexa_playlists');
      return stored ? JSON.parse(stored) : [];
    }
  }

  static async createPlaylist(name: string, description?: string): Promise<Playlist> {
    if (this.useSupabase) {
      return {} as Playlist;
    } else {
      const playlists = await this.getPlaylists();
      const newPlaylist: Playlist = {
        id: Date.now().toString(),
        name,
        description,
      };
      playlists.push(newPlaylist);
      localStorage.setItem('sonexa_playlists', JSON.stringify(playlists));
      return newPlaylist;
    }
  }

  static async addSongToPlaylist(playlistId: string | number, song: PlayerSong): Promise<void> {
    if (this.useSupabase) {
      // Future Supabase implementation
    } else {
      const stored = localStorage.getItem(`sonexa_playlist_songs_${playlistId}`);
      const songs: PlayerSong[] = stored ? JSON.parse(stored) : [];
      if (!songs.some(s => s.song_uri === song.song_uri)) {
        songs.push(song);
        localStorage.setItem(`sonexa_playlist_songs_${playlistId}`, JSON.stringify(songs));
      }
    }
  }
}
