import type { Chat, ChatMessage, Role } from '@maysi/shared';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppStateContext, type AppState, type Settings } from './appState';

const STORAGE_KEY = 'maysi.settings.v1';
const defaultSettings: Settings = { disclosureAccepted: false, webSearch: true };

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) }
      : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(loadSettings);
  const [temporary, setTemporary] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const acceptDisclosure = useCallback(
    () => setSettings((s) => ({ ...s, disclosureAccepted: true })),
    [],
  );
  const setWebSearch = useCallback(
    (webSearch: boolean) => setSettings((s) => ({ ...s, webSearch })),
    [],
  );
  const addMessage = useCallback((role: Role, content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role, content, createdAt: new Date().toISOString() },
    ]);
  }, []);
  const startChat = useCallback((isTemporary: boolean) => {
    setTemporary(isTemporary);
    setMessages([]);
  }, []);
  const loadChat = useCallback((chat: Chat) => {
    setTemporary(false);
    setMessages(chat.messages);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      settings,
      acceptDisclosure,
      setWebSearch,
      temporary,
      messages,
      addMessage,
      startChat,
      loadChat,
    }),
    [
      settings,
      acceptDisclosure,
      setWebSearch,
      temporary,
      messages,
      addMessage,
      startChat,
      loadChat,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
