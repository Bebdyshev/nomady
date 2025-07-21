"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Conversation } from '@/types/chat';

interface ConversationsContextType {
  conversations: Conversation[];
  loading: boolean;
  loadConversations: () => Promise<void>;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export const ConversationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.getConversations();
      if (data) {
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <ConversationsContext.Provider value={{ conversations, loading, loadConversations }}>
      {children}
    </ConversationsContext.Provider>
  );
};

export const useConversations = () => {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error('useConversations must be used within a ConversationsProvider');
  }
  return context;
}; 