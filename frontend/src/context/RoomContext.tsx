'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { RoomManager, RoomSession } from '../managers/RoomManager';
import { LiveRoomProvider } from '../services/room/LiveRoomProvider';

interface RoomContextType {
  session: RoomSession | null;
  provider: LiveRoomProvider | null;
  joinRoom: (roomId: string, roomName?: string) => Promise<void>;
  leaveRoom: () => void;
  resetUnread: () => void;
}

const RoomContext = createContext<RoomContextType | null>(null);

export function useRoomContext() {
  const ctx = useContext(RoomContext);
  if (!ctx) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return ctx;
}

export function RoomProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<RoomSession | null>(null);
  const manager = RoomManager.getInstance();

  useEffect(() => {
    // Initial state from manager
    setSession(manager.getSession());

    // Subscribe to changes
    const unsubscribe = manager.subscribe((newSession) => {
      setSession(newSession ? { ...newSession } : null);
    });

    return () => {
      unsubscribe();
    };
  }, [manager]);

  const joinRoom = async (roomId: string, roomName?: string) => {
    await manager.connect(roomId, roomName);
  };

  const leaveRoom = () => {
    manager.disconnect(true);
  };
  
  const resetUnread = () => {
    manager.resetUnreadMessages();
  };

  return (
    <RoomContext.Provider 
      value={{ 
        session, 
        provider: manager.getProvider(),
        joinRoom, 
        leaveRoom,
        resetUnread
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}
