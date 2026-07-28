import type { RoomEventType, RoomMember, ChatMessage, RoomEvent } from '../../types/room';
import type { IRoomProvider, RoomEventCallback, UnsubscribeFn } from './RoomProvider';
import { supabase } from '../../lib/supabase';
import { getCurrentUser } from '../../lib/currentUser';
import { RealtimeChannel } from '@supabase/supabase-js';

export class LiveRoomProvider implements IRoomProvider {
  private currentRoomId: string | null = null;
  private channel: RealtimeChannel | null = null;
  
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

    // 1. Initial Data Fetch
    try {
      // Fetch members
      const roomRes = await fetch(`/api/rooms/\${roomId}`);
      if (roomRes.ok) {
        const roomData = await roomRes.json();
        this.members = roomData.members?.map((m: any) => ({
          id: m.id,
          name: m.name,
          avatar: m.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=\${m.id}`,
          role: 'Listener',
          isSpeaking: false,
          isMuted: true,
          isTyping: false
        })) || [];
        this.notify('member_updated', this.members);
      }

      // Fetch queue
      const queueRes = await fetch(`/api/rooms/\${roomId}/queue`);
      if (queueRes.ok) {
        const queueData = await queueRes.json();
        this.queue = Array.isArray(queueData) ? queueData : [];
        this.notify('queue_updated', this.queue);
      }

      // Fetch messages
      const msgRes = await fetch(`/api/rooms/\${roomId}/messages`);
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        this.messages = Array.isArray(msgData) ? msgData.map((m: any) => ({
          id: m.id.toString(),
          user_id: m.user_id,
          user_name: m.user_name || 'Unknown',
          content: m.content,
          type: m.type,
          timestamp: new Date(m.created_at).getTime()
        })) : [];
        this.messages.forEach(m => this.notify('message_received', m));
      }
    } catch (error) {
      console.error('LiveRoomProvider: Error fetching initial data', error);
    }

    // 2. Supabase Realtime Connection
    this.channel = supabase.channel(`room:\${roomId}`);

    // Chat Sync
    this.channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'Messages', filter: `room_id=eq.\${roomId}` },
      (payload: any) => {
        // Fetch the user_name from the backend or append it if the DB payload doesn't include joined data
        // For now, we assume simple mapping
        const msg = payload.new;
        const chatMsg: ChatMessage = {
          id: msg.id.toString(),
          user_id: msg.user_id,
          user_name: 'User ' + msg.user_id, // We'd ideally join this or cache users
          content: msg.content,
          type: msg.type || 'text',
          timestamp: new Date(msg.created_at).getTime()
        };
        this.messages.push(chatMsg);
        this.notify('message_received', chatMsg);
      }
    );

    // Queue Sync
    this.channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'Queue', filter: `room_id=eq.\${roomId}` },
      (payload: any) => {
        const song = payload.new;
        this.queue.push(song);
        this.notify('queue_updated', this.queue);
      }
    );

    this.channel.on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'Queue', filter: `room_id=eq.\${roomId}` },
      (payload: any) => {
        this.queue = this.queue.filter(s => s.id !== payload.old.id);
        this.notify('queue_updated', this.queue);
      }
    );

    // Broadcasts (Reactions, Typing, Activities - Phase 2 simulated)
    this.channel.on('broadcast', { event: 'reaction' }, ({ payload }) => {
      this.notify('reaction_sent', payload);
    });

    this.channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      this.notify('typing_changed', payload);
    });

    // Presence Sync
    this.channel.on('presence', { event: 'sync' }, () => {
      const state = this.channel!.presenceState();
      // Map presence state to members (Simplified for Phase 1)
      const activeIds = Object.keys(state).map(k => (state[k][0] as any)?.user_id);
      
      // We can update online status here, for now we just log
      console.log('Presence sync:', activeIds);
    });

    // Join room
    this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await this.channel!.track({
          user_id: user.id,
          user_name: user.name,
          joined_at: new Date().toISOString()
        });
      }
    });
  }

  disconnect(): void {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    this.currentRoomId = null;
    this.subscribers.clear();
  }

  async sendMessage(content: string, type: 'text' | 'system' = 'text'): Promise<void> {
    if (!this.currentRoomId) return;
    const user = getCurrentUser();
    
    // Optimistic UI update
    const optimisticMsg: ChatMessage = {
      id: Math.random().toString(),
      user_id: parseInt(user.id) || 1,
      user_name: user.name,
      content,
      type,
      timestamp: Date.now()
    };
    // Don't push to array yet to avoid duplicates if we listen to INSERT, 
    // or we can push and rely on deduplication. For now we just wait for the Postgres event, 
    // or just POST it and let the UI refresh.
    
    try {
      await fetch(`/api/rooms/\${this.currentRoomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: this.currentRoomId,
          user_id: parseInt(user.id) || 1,
          content,
          type
        })
      });
    } catch (error) {
      console.error('Failed to send message', error);
    }
  }

  async addSong(song: any): Promise<void> {
    if (!this.currentRoomId) return;
    const user = getCurrentUser();
    
    try {
      await fetch(`/api/rooms/\${this.currentRoomId}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...song,
          added_by: parseInt(user.id) || 1
        })
      });
    } catch (error) {
      console.error('Failed to add song', error);
    }
  }

  async voteSong(songId: string, direction: 'up' | 'down'): Promise<void> {
    // Phase 3 feature: No-op for now in Live mode or fallback
    console.log(`LiveRoomProvider: Vote \${direction} for song \${songId} not implemented yet in backend`);
  }

  async sendReaction(emoji: string): Promise<void> {
    if (!this.channel) return;
    const reaction = {
      id: Math.random().toString(),
      emoji,
      right: 10 + Math.random() * 40
    };
    // Optimistic update
    this.notify('reaction_sent', reaction);
    // Broadcast to others
    this.channel.send({
      type: 'broadcast',
      event: 'reaction',
      payload: reaction
    });
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
