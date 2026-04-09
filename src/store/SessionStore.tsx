import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { SessionData, Message, User } from '../types';

interface SessionContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  sessions: SessionData[];
  messages: Message[];
  addSession: (session: Omit<SessionData, 'id' | 'createdAt'>) => string;
  deleteSession: (id: string) => Promise<void>;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  getSession: (id: string) => SessionData | undefined;
  getSessionMessages: (sessionId: string) => Message[];
  refreshData: () => void;
  isLoadingUser: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('heartmend_messages');
    return saved ? JSON.parse(saved) : [];
  });

  // Hydrate user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('heartmend_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoadingUser(false);
  }, []);

  // Hydrate sessions bound to active user or global mock list
  const refreshData = async () => {
    try {
      let fetchUrl = '/api/sessions'; 
      if (currentUser) {
        fetchUrl = `/api/users/${currentUser.id}/sessions`;
      }
      
      const sessRes = await fetch(fetchUrl);
      const sessData = await sessRes.json();
      setSessions(sessData);
      
    } catch(e) {
      console.warn("Backend down");
    }
  };

  useEffect(() => {
    if (!isLoadingUser) {
      refreshData();
    }
  }, [currentUser, isLoadingUser]);

  const addSession = (sessionData: Omit<SessionData, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    const newSession: SessionData = { 
      ...sessionData, 
      id, 
      userId: currentUser?.id,
      createdAt: Date.now() 
    };
    
    setSessions(prev => [newSession, ...prev]);

    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSession)
    }).catch(console.error);

    return id;
  };

  const deleteSession = async (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
    } catch(e) {
      console.error("Failed to sync deletion:", e);
    }
  };

  const addMessage = async (messageData: Omit<Message, 'id' | 'timestamp'>) => {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const newMessage: Message = { ...messageData, id, timestamp };
    
    setMessages(prev => {
        const arr = [...prev, newMessage];
        localStorage.setItem('heartmend_messages', JSON.stringify(arr));
        return arr;
    });

    if (newMessage.role === 'user') {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMessage)
        });
        const aiMessageData = await response.json();
        
        if (aiMessageData && aiMessageData.id) {
          setMessages(prev => {
             const arr = [...prev, aiMessageData];
             localStorage.setItem('heartmend_messages', JSON.stringify(arr));
             return arr;
          });
        }
      } catch(e) {
         console.error("AI Error:", e);
      }
    } else {
        fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMessage)
        }).catch(console.error);
    }
  };

  const getSession = (id: string) => sessions.find(s => s.id === id);
  const getSessionMessages = (sessionId: string) => messages.filter(m => m.sessionId === sessionId);

  return (
    <SessionContext.Provider value={{ 
      currentUser, setCurrentUser, sessions, messages, 
      addSession, deleteSession, addMessage, getSession, getSessionMessages, refreshData, isLoadingUser 
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessions = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessions must be used within a SessionProvider');
  }
  return context;
};
