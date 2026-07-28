import { useState, useEffect, useRef } from 'react';
import type { RoomMember, ChatMessage, ActivityEvent, RoomReaction, RoomEvent } from '../types/room';
import type { IRoomProvider } from '../services/room/RoomProvider';
import { MockRoomProvider } from '../services/room/MockRoomProvider';
import { LiveRoomProvider } from '../services/room/LiveRoomProvider';

// Determine the provider based on the environment flag
const providerType = process.env.NEXT_PUBLIC_ROOM_PROVIDER || 'mock';

// Singleton instance to prevent multiple connections across re-renders
let roomProviderInstance: IRoomProvider | null = null;

const getRoomProvider = (): IRoomProvider => {
  if (!roomProviderInstance) {
    roomProviderInstance = providerType === 'live' ? new LiveRoomProvider() : new MockRoomProvider();
  }
  return roomProviderInstance;
};

export function useRoom(roomId: string | undefined) {
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<RoomReaction[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);

  const providerRef = useRef<IRoomProvider>(getRoomProvider());

  useEffect(() => {
    if (!roomId) return;

    const provider = providerRef.current;
    
    // Connect to room (fetches initial data or starts mock timers)
    provider.connect(roomId).then(() => {
      // Set initial state synchronously after connection
      const initialState = provider.getInitialState();
      setMembers([...initialState.members]);
      setMessages([...initialState.messages]);
      setQueue([...initialState.queue]);
    });

    const unsubscribe = provider.subscribe((event: RoomEvent) => {
      switch (event.type) {
        case 'member_updated':
          setMembers([...event.payload]);
          break;
        case 'message_received':
          setMessages(prev => [...prev, event.payload]);
          break;
        case 'reaction_sent':
          setReactions(prev => [...prev, event.payload]);
          // Clean up reaction after 3s
          setTimeout(() => {
            setReactions(current => current.filter(r => r.id !== event.payload.id));
          }, 3000);
          break;
        case 'activity_logged':
          setActivities(prev => [...prev.slice(-4), event.payload]); // Keep last 5
          break;
        case 'queue_updated':
          setQueue([...event.payload]);
          break;
        case 'typing_changed':
          setTypingUsers(prev => {
            if (event.payload.isTyping) {
              return prev.includes(event.payload.userId) ? prev : [...prev, event.payload.userId];
            } else {
              return prev.filter(id => id !== event.payload.userId);
            }
          });
          break;
      }
    });

    return () => {
      unsubscribe();
      provider.disconnect();
    };
  }, [roomId]);

  return {
    members,
    messages,
    reactions,
    activities,
    queue,
    typingUsers,
    provider: providerRef.current
  };
}
