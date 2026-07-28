import { RoomEventType, RoomEventPayload, RoomMember, ChatMessage, ActivityEvent, RoomReaction } from '@/types/room';

// Native EventEmitter-like behavior using EventTarget
class RoomSimulationEmitter extends EventTarget {
  emit(event: RoomEventType, payload?: RoomEventPayload) {
    this.dispatchEvent(new CustomEvent(event, { detail: payload }));
  }

  on(event: RoomEventType, callback: (payload: any) => void) {
    this.addEventListener(event, (e: Event) => callback((e as CustomEvent).detail));
  }

  off(event: RoomEventType, callback: (payload: any) => void) {
    this.removeEventListener(event, (e: Event) => callback((e as CustomEvent).detail));
  }
}

class RoomSimulationService {
  public emitter = new RoomSimulationEmitter();
  
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
  
  start(roomId: string, initialMembers: RoomMember[]) {
    if (this.isRunning && this.currentRoomId === roomId) return;
    this.stop();
    
    this.currentRoomId = roomId;
    this.isRunning = true;
    this.members = [...initialMembers];

    this.startVoiceSimulation();
    this.startChatSimulation();
    this.startReactionSimulation();
    this.startActivitySimulation();
  }

  stop() {
    this.isRunning = false;
    this.currentRoomId = null;
    if (this.voiceTimer) clearInterval(this.voiceTimer);
    if (this.chatTimer) clearTimeout(this.chatTimer);
    if (this.reactionTimer) clearTimeout(this.reactionTimer);
    if (this.activityTimer) clearTimeout(this.activityTimer);
    if (this.typingTimer) clearTimeout(this.typingTimer);
    
    // reset timers
    this.voiceTimer = null;
    this.chatTimer = null;
    this.reactionTimer = null;
    this.activityTimer = null;
    this.typingTimer = null;
  }

  private startVoiceSimulation() {
    this.voiceTimer = setInterval(() => {
      // Logic to toggle speaking states realistically
      const updatedMembers = this.members.map(m => {
        // Only random listeners might speak
        if (m.id !== 1 && Math.random() > 0.7) {
           return { ...m, isSpeaking: !m.isSpeaking };
        }
        // Sometimes they just stop
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
      
      // Select a random member to speak (excluding Host/User 1)
      const others = this.members.filter(m => m.id !== 1);
      if (others.length === 0) return;
      
      const speaker = others[Math.floor(Math.random() * others.length)];
      
      // Simulate typing
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
        
        this.emitter.emit('message_received', message);
        
        // Schedule next message
        this.chatTimer = setTimeout(chatLoop, 10000 + Math.random() * 20000); // 10-30s
      }, 2000 + Math.random() * 3000); // Typing for 2-5s
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
      
      this.reactionTimer = setTimeout(reactionLoop, 3000 + Math.random() * 15000); // 3-18s
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
      
      this.activityTimer = setTimeout(activityLoop, 20000 + Math.random() * 40000); // 20-60s
    };
    
    this.activityTimer = setTimeout(activityLoop, 15000);
  }
}

export const roomSimulation = new RoomSimulationService();
