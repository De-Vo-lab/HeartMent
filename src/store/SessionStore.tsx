import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { SessionData, Message } from '../types';

interface SessionContextType {
  sessions: SessionData[];
  messages: Message[];
  addSession: (session: Omit<SessionData, 'id' | 'createdAt'>) => string;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  getSession: (id: string) => SessionData | undefined;
  getSessionMessages: (sessionId: string) => Message[];
  refreshData: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<SessionData[]>(() => {
    const saved = localStorage.getItem('heartmend_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('heartmend_messages');
    return saved ? JSON.parse(saved) : [];
  });

  // Hydrate from SQLite Express backend
  const refreshData = async () => {
    try {
      const sessRes = await fetch('/api/sessions');
      const sessData = await sessRes.json();
      setSessions(sessData);
      
      localStorage.setItem('heartmend_sessions', JSON.stringify(sessData));
    } catch(e) {
      console.warn("Backend down, using local sessions");
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addSession = (sessionData: Omit<SessionData, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    const newSession: SessionData = { ...sessionData, id, createdAt: Date.now() };
    
    // Optimistic update
    setSessions(prev => [newSession, ...prev]);
    localStorage.setItem('heartmend_sessions', JSON.stringify([newSession, ...sessions]));

    // Send to backend
    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSession)
    }).catch(console.error);

    return id;
  };

  const fetchSessionMessages = async (sessionId: string) => {
      try {
        const msgRes = await fetch(`/api/sessions/${sessionId}/messages`);
        const msgData = await msgRes.json();
        setMessages(prev => {
          const others = prev.filter(m => m.sessionId !== sessionId);
          const newArray = [...others, ...msgData];
          localStorage.setItem('heartmend_messages', JSON.stringify(newArray));
          return newArray;
        });
      } catch(e) {}
  };

  const addMessage = async (messageData: Omit<Message, 'id' | 'timestamp'>) => {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const newMessage: Message = { ...messageData, id, timestamp };
    
    // Optimistic UI for user message
    setMessages(prev => {
        const arr = [...prev, newMessage];
        localStorage.setItem('heartmend_messages', JSON.stringify(arr));
        return arr;
    });

    if (newMessage.role === 'user') {
      try {
        // This endpoint both saves the user message AND hits Gemini, then returns Gemini response!
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
        // Just save local/intake ai message
        fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMessage)
        }).catch(console.error);
    }
  };

  const getSession = (id: string) => {
      return sessions.find(s => s.id === id);
  }

  const getSessionMessages = (sessionId: string) => {
      return messages.filter(m => m.sessionId === sessionId);
  }

  return (
    <SessionContext.Provider value={{ sessions, messages, addSession, addMessage, getSession, getSessionMessages, refreshData }}>
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
