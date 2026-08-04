// This provider wraps mock data generation so it can easily be swapped with real backend calls later.

export interface SongStats {
  plays: string;
  likes: string;
  releaseYear: number;
  genre: string;
  isVerifiedArtist: boolean;
  isLossless: boolean;
}

export interface DiscoveryItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  type: 'album' | 'artist' | 'genre' | 'playlist';
}

export class MockDataProvider {
  // Simulate fetching stats for a specific song
  static async getSongStats(songUri: string): Promise<SongStats> {
    // Return realistic placeholder values
    return {
      plays: '18.2M',
      likes: '1.3M',
      releaseYear: 2024,
      genre: 'Punjabi Pop',
      isVerifiedArtist: true,
      isLossless: true,
    };
  }

  // Simulate fetching discovery content
  static async getDiscoveryContent(): Promise<{
    becauseYouPlayed: DiscoveryItem[];
    similarArtists: DiscoveryItem[];
    genres: DiscoveryItem[];
  }> {
    return {
      becauseYouPlayed: [
        { id: '1', title: 'Making Memories', subtitle: 'Karan Aujla', type: 'album', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' },
        { id: '2', title: 'Moosetape', subtitle: 'Sidhu Moose Wala', type: 'album', image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5ea3761?w=500&q=80' },
        { id: '3', title: 'Two Hearts', subtitle: 'AP Dhillon', type: 'album', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' },
        { id: '4', title: 'Drive', subtitle: 'Diljit Dosanjh', type: 'album', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80' },
      ],
      similarArtists: [
        { id: 'a1', title: 'AP Dhillon', type: 'artist', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80' },
        { id: 'a2', title: 'Sidhu Moose Wala', type: 'artist', image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5ea3761?w=500&q=80' },
        { id: 'a3', title: 'Shubh', type: 'artist', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' },
        { id: 'a4', title: 'Diljit Dosanjh', type: 'artist', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' },
      ],
      genres: [
        { id: 'g1', title: 'Punjabi', type: 'genre' },
        { id: 'g2', title: 'Romantic', type: 'genre' },
        { id: 'g3', title: 'Pop', type: 'genre' },
        { id: 'g4', title: 'Acoustic', type: 'genre' },
        { id: 'g5', title: 'Upbeat', type: 'genre' },
      ]
    };
  }
}
