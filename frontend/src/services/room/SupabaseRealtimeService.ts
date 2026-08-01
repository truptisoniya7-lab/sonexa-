import { supabase } from '../../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type EventCallback = (payload: any) => void;

export class SupabaseRealtimeService {
  private roomId: string;
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscribers: Map<string, Set<EventCallback>> = new Map();

  constructor(roomId: string) {
    this.roomId = roomId;
    // Clean up any existing channels with this roomId before creating new ones
    supabase.getChannels().forEach(c => {
      if (c.topic.startsWith(`realtime:room:${this.roomId}:`)) {
        supabase.removeChannel(c);
      }
    });
    this.setupChannels();
  }

  private setupChannels() {
    // 1. Chat Channel (Postgres Changes for paginated/persisted chat)
    const chatChannel = supabase.channel(`room:${this.roomId}:chat`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${this.roomId}` },
        (payload) => this.notify('chat:message', payload.new)
      );

    // 2. Queue & Events Channel (Postgres Changes)
    const queueChannel = supabase.channel(`room:${this.roomId}:data`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue', filter: `room_id=eq.${this.roomId}` },
        (payload) => this.notify('queue:update', payload)
      );

    // 3. Ephemeral Broadcasts Channel (Reactions, Typing, Player Scrubbing)
    const broadcastChannel = supabase.channel(`room:${this.roomId}:broadcast`, {
      config: { broadcast: { self: false } }
    })
      .on('broadcast', { event: 'reaction' }, ({ payload }) => this.notify('broadcast:reaction', payload))
      .on('broadcast', { event: 'typing' }, ({ payload }) => this.notify('broadcast:typing', payload))
      .on('broadcast', { event: 'player_sync' }, ({ payload }) => this.notify('broadcast:player', payload));

    // 4. Presence Channel
    const presenceChannel = supabase.channel(`room:${this.roomId}:presence`, {
      config: { presence: { key: '' } }
    })
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        this.notify('presence:sync', state);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        this.notify('presence:join', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        this.notify('presence:leave', leftPresences);
      });

    this.channels.set('chat', chatChannel);
    this.channels.set('queue', queueChannel);
    this.channels.set('broadcast', broadcastChannel);
    this.channels.set('presence', presenceChannel);
  }

  public async connect(userPresenceData: any) {
    // Subscribe to all channels
    for (const [name, channel] of this.channels.entries()) {
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && name === 'presence') {
          await channel.track(userPresenceData);
        }
      });
    }
  }

  public disconnect() {
    this.channels.forEach(channel => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.subscribers.clear();
  }

  // --- PUB/SUB SYSTEM ---
  public subscribe(event: string, callback: EventCallback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)!.add(callback);
    return () => {
      this.subscribers.get(event)?.delete(callback);
    };
  }

  private notify(event: string, payload: any) {
    this.subscribers.get(event)?.forEach(cb => cb(payload));
  }

  // --- ACTIONS ---
  public broadcastReaction(emoji: string) {
    const reaction = { id: Math.random().toString(), emoji, right: 10 + Math.random() * 80 };
    this.channels.get('broadcast')?.send({ type: 'broadcast', event: 'reaction', payload: reaction });
    return reaction;
  }

  public broadcastTyping(userId: string, isTyping: boolean) {
    this.channels.get('broadcast')?.send({ type: 'broadcast', event: 'typing', payload: { userId, isTyping } });
  }

  public broadcastPlayerSync(state: any) {
    this.channels.get('broadcast')?.send({ type: 'broadcast', event: 'player_sync', payload: state });
  }
}
