import type { RoomMember, ChatMessage, RoomEvent } from '../../types/room';

export type UnsubscribeFn = () => void;
export type RoomEventCallback = (event: RoomEvent) => void;

export interface IRoomProvider {
  /** Connect to the room and initialize data/subscriptions */
  connect(roomId: string): Promise<void>;
  
  /** Disconnect and cleanup */
  disconnect(): void;
  
  /** Send a chat message */
  sendMessage(content: string, type?: 'text' | 'system'): Promise<void>;
  
  /** Upvote or downvote a song in the queue */
  voteSong(songId: string, direction: 'up' | 'down'): Promise<void>;
  
  /** Add a song to the queue */
  addSong(song: any): Promise<void>;
  
  /** Remove a song from the queue */
  removeSong(songId: string): Promise<void>;
  
  /** Send an ephemeral reaction */
  sendReaction(emoji: string): Promise<void>;
  
  /** Join Voice */
  joinVoice(): Promise<void>;
  
  /** Leave Voice */
  leaveVoice(): Promise<void>;
  
  /** Subscribe to room events (chat, queue updates, presence, reactions) */
  subscribe(callback: RoomEventCallback): UnsubscribeFn;
  
  /** Expose current state directly for initial fetch */
  getInitialState(): {
    members: RoomMember[];
    queue: any[];
    messages: ChatMessage[];
  };
}
