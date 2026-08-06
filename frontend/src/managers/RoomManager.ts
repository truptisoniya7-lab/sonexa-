import { LiveRoomProvider } from '../services/room/LiveRoomProvider';
import type { RoomMember, ChatMessage, RoomEvent, RoomEventType } from '../types/room';

export interface RoomSession {
  roomId: string;
  roomName: string;
  roomImage?: string;
  hostId?: string;
  isHost?: boolean;
  joinedAt: string;
  playbackState: 'playing' | 'paused';
  queue: any[];
  members: RoomMember[];
  unreadMessages: number;
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected';
  reconnectAttempts: number;
}

type SessionChangeCallback = (session: RoomSession) => void;

export class RoomManager {
  private static instance: RoomManager | null = null;
  
  private provider: LiveRoomProvider;
  private session: RoomSession | null = null;
  private subscribers: Set<SessionChangeCallback> = new Set();
  
  private reconnectInterval: NodeJS.Timeout | null = null;
  private unsubscribeProvider: (() => void) | null = null;

  private constructor() {
    this.provider = new LiveRoomProvider();
    this.loadSessionFromStorage();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  public static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  private loadSessionFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem('sonexa_room_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only restore if it hasn't expired (e.g. 10 mins)
        const joinedAt = new Date(parsed.joinedAt).getTime();
        const now = Date.now();
        // If we want a grace period on close, we can check last updated time instead.
        // For now, if it exists in sessionStorage (which survives refresh), restore it.
        this.session = {
          ...parsed,
          connectionStatus: 'disconnected', // Will reconnect automatically
          reconnectAttempts: 0
        };
        // Auto-reconnect
        this.connect(this.session!.roomId, this.session!.roomName);
      }
    } catch (e) {
      console.error("Failed to load room session", e);
    }
  }

  private saveSessionToStorage() {
    if (typeof window === 'undefined') return;
    if (this.session) {
      sessionStorage.setItem('sonexa_room_session', JSON.stringify(this.session));
    } else {
      sessionStorage.removeItem('sonexa_room_session');
    }
  }

  public subscribe(callback: SessionChangeCallback) {
    this.subscribers.add(callback);
    if (this.session) {
      callback(this.session);
    }
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify() {
    if (this.session) {
      this.saveSessionToStorage();
      const sessionCopy = { ...this.session };
      this.subscribers.forEach(cb => cb(sessionCopy));
    }
  }

  public getSession() {
    return this.session;
  }

  public getProvider() {
    return this.provider;
  }

  public async connect(roomId: string, roomName: string = `Room ${roomId}`) {
    if (this.session && this.session.roomId === roomId && this.session.connectionStatus === 'connected') {
      return; // Already connected
    }

    if (this.session && this.session.roomId !== roomId) {
      this.disconnect(true); // Hard disconnect old room
    }

    if (!this.session) {
      this.session = {
        roomId,
        roomName,
        joinedAt: new Date().toISOString(),
        playbackState: 'paused',
        queue: [],
        members: [],
        unreadMessages: 0,
        connectionStatus: 'reconnecting',
        reconnectAttempts: 0
      };
    } else {
      this.session.connectionStatus = 'reconnecting';
    }
    
    this.notify();

    try {
      await this.provider.connect(roomId);
      
      this.session.connectionStatus = 'connected';
      this.session.reconnectAttempts = 0;
      
      const initialState = this.provider.getInitialState();
      this.session.members = initialState.members;
      this.session.queue = initialState.queue;
      
      if (this.unsubscribeProvider) {
        this.unsubscribeProvider();
      }
      
      this.unsubscribeProvider = this.provider.subscribe(this.handleRoomEvent);
      this.notify();

      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }
    } catch (e) {
      console.error("Failed to connect to room", e);
      this.handleConnectionDrop();
    }
  }

  public disconnect(force: boolean = false) {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    if (this.unsubscribeProvider) {
      this.unsubscribeProvider();
      this.unsubscribeProvider = null;
    }
    
    this.provider.disconnect();
    
    if (force) {
      this.session = null;
      this.saveSessionToStorage();
      // Notify with null equivalent (handled by components unmounting or reacting)
      this.subscribers.forEach(cb => cb(null as any));
    } else if (this.session) {
      this.session.connectionStatus = 'disconnected';
      this.notify();
    }
  }

  private handleConnectionDrop = () => {
    if (!this.session) return;
    
    if (this.session.reconnectAttempts >= 5) {
      this.disconnect(true); // Give up
      return;
    }

    this.session.connectionStatus = 'reconnecting';
    this.session.reconnectAttempts += 1;
    this.notify();

    if (!this.reconnectInterval) {
      this.reconnectInterval = setTimeout(() => {
        this.reconnectInterval = null;
        if (this.session) {
          this.connect(this.session.roomId, this.session.roomName);
        }
      }, Math.min(1000 * Math.pow(2, this.session.reconnectAttempts), 10000)); // Exponential backoff max 10s
    }
  }

  private handleOnline = () => {
    if (this.session && this.session.connectionStatus !== 'connected') {
      this.connect(this.session.roomId, this.session.roomName);
    }
  }

  private handleOffline = () => {
    if (this.session) {
      this.session.connectionStatus = 'disconnected';
      this.notify();
    }
  }

  private handleRoomEvent = (event: RoomEvent) => {
    if (!this.session) return;

    switch (event.type) {
      case 'member_updated':
        this.session.members = event.payload;
        break;
      case 'queue_updated':
        this.session.queue = event.payload;
        break;
      case 'message_received':
        // If we are not currently viewing the chat (this would be complex to track precisely without UI hints,
        // but we can just increment unread for now).
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/room/')) {
           this.session.unreadMessages += 1;
        }
        break;
    }
    this.notify();
  }
  
  public resetUnreadMessages() {
    if (this.session) {
      this.session.unreadMessages = 0;
      this.notify();
    }
  }
}
