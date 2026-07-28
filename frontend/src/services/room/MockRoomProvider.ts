import type { RoomEventType, RoomEventPayload, RoomMember, ChatMessage, ActivityEvent, RoomReaction, RoomEvent } from '../../types/room';
import type { IRoomProvider, RoomEventCallback, UnsubscribeFn } from './RoomProvider';

class RoomSimulationEmitter {
  private listeners: Record<string, ((event: any) => void)[]> = {};

  private addEventListener(event: string, callback: (event: any) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  private removeEventListener(event: string, callback: (event: any) => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: RoomEventType, payload?: RoomEventPayload) {
    if (!this.listeners[event]) return;
    const simulatedEvent = { detail: { type: event, payload } };
    this.listeners[event].forEach(cb => cb(simulatedEvent));
  }

  on(event: RoomEventType, callback: (payload: any) => void) {
    this.addEventListener(event, (e: any) => callback(e.detail.payload));
  }

  off(event: RoomEventType, callback: (payload: any) => void) {
    this.removeEventListener(event, (e: Event) => callback((e as CustomEvent).detail));
  }
}

export class MockRoomProvider implements IRoomProvider {
  private emitter = new RoomSimulationEmitter();
  private isRunning = false;
  private currentRoomId: string | null = null;
  
  // Simulation Timers
  private voiceTimer: NodeJS.Timeout | null = null;
  private chatTimer: NodeJS.Timeout | null = null;
  private reactionTimer: NodeJS.Timeout | null = null;
  private activityTimer: NodeJS.Timeout | null = null;
  private typingTimer: NodeJS.Timeout | null = null;

  // Mock State
  private members: RoomMember[] = [];
  private messages: ChatMessage[] = [];
  private queue: any[] = [];
  private subscribers: Set<RoomEventCallback> = new Set();

  private INITIAL_MEMBERS: RoomMember[] = [
    { id: 1, name: 'You (Host)', avatar: 'https://i.pravatar.cc/150?u=1', role: 'Host', isSpeaking: false, isMuted: true, isTyping: false },
    { id: 2, name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=2', role: 'Listener', isSpeaking: false, isMuted: false, isTyping: false },
    { id: 3, name: 'Alex', avatar: 'https://i.pravatar.cc/150?u=3', role: 'Listener', isSpeaking: false, isMuted: true, isTyping: false },
    { id: 4, name: 'Mike', avatar: 'https://i.pravatar.cc/150?u=4', role: 'Listener', isSpeaking: false, isMuted: true, isTyping: false },
    { id: 5, name: 'Emma', avatar: 'https://i.pravatar.cc/150?u=5', role: 'Listener', isSpeaking: false, isMuted: true, isTyping: false },
  ];

  async connect(roomId: string): Promise<void> {
    if (this.isRunning && this.currentRoomId === roomId) return;
    this.disconnect();
    
    this.currentRoomId = roomId;
    this.isRunning = true;
    this.members = [...this.INITIAL_MEMBERS];
    
    // Listen to internal emitter and broadcast to standard subscribers
    const events: RoomEventType[] = ['member_updated', 'message_received', 'typing_changed', 'reaction_sent', 'activity_logged', 'queue_updated'];
    
    events.forEach(event => {
      this.emitter.on(event, (payload) => {
        this.subscribers.forEach(cb => cb(payload as RoomEvent));
      });
    });

    this.startVoiceSimulation();
    this.startChatSimulation();
    this.startReactionSimulation();
    this.startActivitySimulation();
  }

  disconnect(): void {
    this.isRunning = false;
    this.currentRoomId = null;
    if (this.voiceTimer) clearInterval(this.voiceTimer);
    if (this.chatTimer) clearTimeout(this.chatTimer);
    if (this.reactionTimer) clearTimeout(this.reactionTimer);
    if (this.activityTimer) clearTimeout(this.activityTimer);
    if (this.typingTimer) clearTimeout(this.typingTimer);
    
    this.voiceTimer = null;
    this.chatTimer = null;
    this.reactionTimer = null;
    this.activityTimer = null;
    this.typingTimer = null;
  }

  async sendMessage(content: string, type: 'text' | 'system' = 'text'): Promise<void> {
    const newMessage: ChatMessage = {
      id: Math.random().toString(),
      user_id: 1, // Simulated current user id
      user_name: 'You (Host)',
      content,
      type,
      timestamp: Date.now()
    };
    this.messages.push(newMessage);
    this.emitter.emit('message_received', newMessage);
  }

  async addSong(song: any): Promise<void> {
    const newSong = { ...song, id: Math.random().toString(), votes: 0 };
    this.queue.push(newSong);
    this.emitter.emit('queue_updated', this.queue);
    
    this.emitter.emit('activity_logged', {
      id: Math.random().toString(),
      type: 'add_song',
      user_name: 'You (Host)',
      timestamp: Date.now()
    });
  }

  async voteSong(songId: string, direction: 'up' | 'down'): Promise<void> {
    this.queue = this.queue.map(s => {
      if (s.id === songId) {
        return { ...s, votes: (s.votes || 0) + (direction === 'up' ? 1 : -1) };
      }
      return s;
    });
    this.emitter.emit('queue_updated', this.queue);
  }

  async sendReaction(emoji: string): Promise<void> {
    const reaction: RoomReaction = {
      id: Math.random().toString(),
      emoji,
      right: 10 + Math.random() * 40
    };
    this.emitter.emit('reaction_sent', reaction);
  }

  async joinVoice(): Promise<void> {
    this.members = this.members.map(m => m.id === 1 ? { ...m, isMuted: false, isSpeaking: false } : m);
    this.emitter.emit('member_updated', this.members);
  }

  async leaveVoice(): Promise<void> {
    this.members = this.members.map(m => m.id === 1 ? { ...m, isMuted: true, isSpeaking: false } : m);
    this.emitter.emit('member_updated', this.members);
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

  // --- INTERNAL SIMULATION LOGIC ---

  private startVoiceSimulation() {
    this.voiceTimer = setInterval(() => {
      const updatedMembers = this.members.map(m => {
        if (m.id !== 1 && Math.random() > 0.7) {
           return { ...m, isSpeaking: !m.isSpeaking };
        }
        if (m.isSpeaking && Math.random() > 0.4) {
           return { ...m, isSpeaking: false };
        }
        return m;
      });
      this.members = updatedMembers;
      this.emitter.emit('member_updated', updatedMembers);
    }, 3000);
  }

  private startChatSimulation() {
    const chatLoop = () => {
      if (!this.isRunning) return;
      
      const others = this.members.filter(m => m.id !== 1);
      if (others.length === 0) return;
      const speaker = others[Math.floor(Math.random() * others.length)];
      
      this.emitter.emit('typing_changed', { userId: speaker.id, isTyping: true });
      
      this.typingTimer = setTimeout(() => {
        this.emitter.emit('typing_changed', { userId: speaker.id, isTyping: false });
        
        const mockMessages = [
          "This track is insane 🔥",
          "I wasn't expecting that transition.",
          "Queue something upbeat next ❤️",
          "Perfect!",
          "Can we get some Kendrick?",
          "Who added this? It's amazing",
          "Vibes are immaculate ✨"
        ];
        
        const message: ChatMessage = {
          id: Math.random().toString(),
          user_id: speaker.id,
          user_name: speaker.name,
          content: mockMessages[Math.floor(Math.random() * mockMessages.length)],
          type: 'text',
          timestamp: Date.now()
        };
        
        this.messages.push(message);
        this.emitter.emit('message_received', message);
        this.chatTimer = setTimeout(chatLoop, 10000 + Math.random() * 20000);
      }, 2000 + Math.random() * 3000);
    };
    this.chatTimer = setTimeout(chatLoop, 5000);
  }

  private startReactionSimulation() {
    const reactionLoop = () => {
      if (!this.isRunning) return;
      const emojis = ['🔥', '❤️', '🎉', '😂', '✨'];
      const reaction: RoomReaction = {
        id: Math.random().toString(),
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        right: 10 + Math.random() * 40
      };
      this.emitter.emit('reaction_sent', reaction);
      this.reactionTimer = setTimeout(reactionLoop, 3000 + Math.random() * 15000);
    };
    this.reactionTimer = setTimeout(reactionLoop, 4000);
  }

  private startActivitySimulation() {
    const activityLoop = () => {
      if (!this.isRunning) return;
      const events: ActivityEvent['type'][] = ['join', 'leave', 'upvote'];
      const type = events[Math.floor(Math.random() * events.length)];
      const others = this.members.filter(m => m.id !== 1);
      const user = others.length > 0 ? others[Math.floor(Math.random() * others.length)] : { name: 'Someone' };
      
      const activity: ActivityEvent = {
        id: Math.random().toString(),
        type,
        user_name: user.name,
        timestamp: Date.now()
      };
      
      this.emitter.emit('activity_logged', activity);
      this.activityTimer = setTimeout(activityLoop, 20000 + Math.random() * 40000);
    };
    this.activityTimer = setTimeout(activityLoop, 15000);
  }
}
