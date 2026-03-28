import { useState, useEffect, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
}

interface UseAIChatSessionsReturn {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  loading: boolean;
  error: string | null;
  createSession: (title?: string) => Promise<ChatSession | null>;
  loadSession: (sessionId: string) => Promise<void>;
  updateSession: (sessionId: string, messages: Message[], title?: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

export function useAIChatSessions(): UseAIChatSessionsReturn {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all sessions
  const refreshSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/ai-chat/sessions', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load sessions');
      }

      const data = await response.json();
      setSessions(data.sessions || []);
      setError(null);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load sessions on mount
  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  // Create new session
  const createSession = useCallback(async (title = 'New Chat'): Promise<ChatSession | null> => {
    try {
      const response = await fetch('/api/ai-chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      const newSession = data.session;

      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      setError(null);

      return newSession;
    } catch (err) {
      console.error('Error creating session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create session');
      return null;
    }
  }, []);

  // Load specific session
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/ai-chat/sessions/${sessionId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load session');
      }

      const data = await response.json();
      setCurrentSession(data.session);
      setError(null);
    } catch (err) {
      console.error('Error loading session:', err);
      setError(err instanceof Error ? err.message : 'Failed to load session');
    }
  }, []);

  // Update session with new messages
  const updateSession = useCallback(async (
    sessionId: string,
    messages: Message[],
    title?: string
  ) => {
    try {
      const response = await fetch(`/api/ai-chat/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ messages, title }),
      });

      if (!response.ok) {
        throw new Error('Failed to update session');
      }

      const data = await response.json();
      const updatedSession = data.session;

      // Update current session if it's the one being updated
      if (currentSession?.id === sessionId) {
        setCurrentSession(updatedSession);
      }

      // Update in sessions list
      setSessions(prev =>
        prev.map(s => (s.id === sessionId ? updatedSession : s))
      );

      setError(null);
    } catch (err) {
      console.error('Error updating session:', err);
      setError(err instanceof Error ? err.message : 'Failed to update session');
    }
  }, [currentSession]);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/ai-chat/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      // Remove from list
      setSessions(prev => prev.filter(s => s.id !== sessionId));

      // Clear current session if it's the one being deleted
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }

      setError(null);
    } catch (err) {
      console.error('Error deleting session:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  }, [currentSession]);

  return {
    sessions,
    currentSession,
    loading,
    error,
    createSession,
    loadSession,
    updateSession,
    deleteSession,
    refreshSessions,
  };
}
