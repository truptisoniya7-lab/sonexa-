import type { RoomEventType, RoomMember, ChatMessage, RoomEvent } from '../../types/room';
import type { IRoomProvider, RoomEventCallback, UnsubscribeFn } from './RoomProvider';
import { supabase } from '../../lib/supabase';
import { getCurrentUser } from '../../lib/currentUser';
import { SupabaseRealtimeService } from './SupabaseRealtimeService';

export class LiveRoomProvider implements IRoomProvider {
  private currentRoomId: string | null = null;
  private realtimeService: SupabaseRealtimeService | null = null;
  
  private members: RoomMember[] = [];
  private messages: ChatMessage[] = [];
  private queue: any[] = [];
  private subscribers: Set<RoomEventCallback> = new Set();
  
  private notify(type: RoomEventType, payload: any) {
    this.subscribers.forEach(cb => cb({ type, payload }));
  }

  async connect(roomId: string): Promise<void> {
    if (this.currentRoomId === roomId) return;
    this.disconnect();
    this.currentRoomId = roomId;

    const user = getCurrentUser();

    // 1. Initial Data Fetch via Supabase JS
    try {
      // Fetch queue
      const { data: queueData, error: queueError } = await supabase
        .from('room_queue')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
        
      if (!queueError && queueData) {
        this.queue = queueData;
        this.notify('queue_updated', this.queue);
      }

      // Fetch messages (paginated chat - last 50)
      const { data: msgData, error: msgError } = await supabase
        .from('room_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (!msgError && msgData) {
        this.messages = msgData.reverse().map((m: any) => ({
          id: m.id.toString(),
          user_id: m.user_id,
          user_name: m.user_name || 'Unknown',
          content: m.content,
          type: m.type,
          timestamp: new Date(m.created_at).getTime()
        }));
        this.messages.forEach(m => this.notify('message_received', m));
      }
      
      // Fetch members from presence or roles if needed. For now, rely on presence events.
    } catch (error) {
      console.error('LiveRoomProvider: Error fetching initial data', error);
    }

    // 2. Realtime Service Connection
    this.realtimeService = new SupabaseRealtimeService(roomId);
    
    // Subscribe to chat
    this.realtimeService.subscribe('chat:message', (msg: any) => {
      // Avoid duplicating optimistic messages by checking ID
      if (!this.messages.find(m => m.id === msg.id.toString())) {
        const chatMsg: ChatMessage = {
          id: msg.id.toString(),
          user_id: msg.user_id,
          user_name: msg.user_name || 'User ' + msg.user_id,
          content: msg.content,
          type: msg.type || 'text',
          timestamp: new Date(msg.created_at).getTime()
        };
        this.messages.push(chatMsg);
        this.notify('message_received', chatMsg);
      }
    });

    // Subscribe to queue
    this.realtimeService.subscribe('queue:update', (payload: any) => {
      if (payload.eventType === 'INSERT') {
        if (!this.queue.find(q => q.id === payload.new.id)) {
            this.queue.push(payload.new);
        }
      } else if (payload.eventType === 'UPDATE') {
        this.queue = this.queue.map(q => q.id === payload.new.id ? payload.new : q);
      } else if (payload.eventType === 'DELETE') {
        this.queue = this.queue.filter(q => q.id !== payload.old.id);
      }
      this.notify('queue_updated', this.queue);
    });

    // Subscribe to broadcasts
    this.realtimeService.subscribe('broadcast:reaction', (reaction: any) => {
      this.notify('reaction_sent', reaction);
    });
    
    this.realtimeService.subscribe('broadcast:typing', (payload: any) => {
      this.notify('typing_changed', payload);
    });

    // Subscribe to presence
    this.realtimeService.subscribe('presence:sync', (state: any) => {
      console.log('Presence sync:', state);
      // Map to members if needed
    });

    // Start connection
    await this.realtimeService.connect({
      user_id: user.id,
      user_name: user.name,
      joined_at: new Date().toISOString()
    });
  }

  disconnect(): void {
    if (this.realtimeService) {
      this.realtimeService.disconnect();
      this.realtimeService = null;
    }
    this.currentRoomId = null;
    this.subscribers.clear();
  }

  async sendMessage(content: string, type: 'text' | 'system' = 'text'): Promise<void> {
    if (!this.currentRoomId) return;
    const user = getCurrentUser();
    
    // Optimistic UI update (using local timestamp ID to prevent duplication logic issues)
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      user_id: parseInt(user.id) || 1,
      user_name: user.name,
      content,
      type,
      timestamp: Date.now()
    };
    
    this.messages.push(optimisticMsg);
    this.notify('message_received', optimisticMsg);
    
    try {
      await supabase.from('room_messages').insert({
          room_id: this.currentRoomId,
          user_id: parseInt(user.id) || 1,
          user_name: user.name,
          content,
          type
      });
      // Realtime channel handles the rest
    } catch (error) {
      console.error('Failed to send message', error);
    }
  }

  async addSong(song: any): Promise<void> {
    if (!this.currentRoomId) return;
    const user = getCurrentUser();
    
    // Optimistic update
    const optimisticSong = {
        ...song,
        id: `temp-${Date.now()}`,
        added_by: parseInt(user.id) || 1,
        votes: 0,
        state: 'queued'
    };
    this.queue.push(optimisticSong);
    this.notify('queue_updated', this.queue);

    try {
      await supabase.from('room_queue').insert({
          room_id: this.currentRoomId,
          song_uri: song.song_uri,
          song_title: song.song_title,
          song_artist: song.song_artist,
          song_image: song.song_image,
          added_by: parseInt(user.id) || 1,
          state: 'queued'
      });
    } catch (error) {
      console.error('Failed to add song', error);
    }
  }

  async voteSong(songId: string, direction: 'up' | 'down'): Promise<void> {
    // Optimistic update
    this.queue = this.queue.map(s => {
      if (s.id.toString() === songId.toString()) {
        return { ...s, votes: (s.votes || 0) + (direction === 'up' ? 1 : -1) };
      }
      return s;
    });
    this.notify('queue_updated', this.queue);

    // In a full implementation, we'd hit the API here:
    // await fetch(`/api/rooms/${this.currentRoomId}/queue/${songId}/vote`, { method: 'POST', body: JSON.stringify({ direction }) });
  }

  async sendReaction(emoji: string): Promise<void> {
    if (!this.realtimeService) return;
    // Broadcast via Ephemeral channel (instant, no DB interaction)
    const reaction = this.realtimeService.broadcastReaction(emoji);
    // Optimistically update our own UI
    this.notify('reaction_sent', reaction);
  }

  async joinVoice(): Promise<void> {
    console.log('LiveRoomProvider: Join voice not implemented in Phase 1');
  }

  async leaveVoice(): Promise<void> {
    console.log('LiveRoomProvider: Leave voice not implemented in Phase 1');
  }

  subscribe(callback: RoomEventCallback): UnsubscribeFn {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  getInitialState() {
    return {
      members: this.members,
      queue: this.queue,
      messages: this.messages
    };
  }
}
