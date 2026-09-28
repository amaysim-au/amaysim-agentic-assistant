import type { Chat, ChatMessage, Role } from '@maysi/shared';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppStateContext, type AppState, type BedrockSettings, type Settings } from './appState';

const STORAGE_KEY = 'maysi.settings.v1';
const BEDROCK_STORAGE_KEY = 'maysi.bedrock.v1';
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

function loadBedrock(): BedrockSettings | null {
  try {
    const raw = localStorage.getItem(BEDROCK_STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<BedrockSettings>;
    if (
      typeof saved.apiKey === 'string' &&
      typeof saved.region === 'string' &&
      typeof saved.modelId === 'string' &&
      typeof saved.expiresAt === 'number' &&
      saved.expiresAt > Date.now()
    ) {
      return saved as BedrockSettings;
    }
  } catch {
    // Unreadable entry; drop it below.
  }
  localStorage.removeItem(BEDROCK_STORAGE_KEY);
  return null;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(loadSettings);
  const [bedrock, setBedrock] = useState(loadBedrock);
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
  const saveBedrock = useCallback((next: BedrockSettings) => {
    localStorage.setItem(BEDROCK_STORAGE_KEY, JSON.stringify(next));
    setBedrock(next);
  }, []);
  const forgetBedrock = useCallback(() => {
    localStorage.removeItem(BEDROCK_STORAGE_KEY);
    setBedrock(null);
  }, []);
  const addMessage = useCallback((role: Role, content: string) => {
    const id = crypto.randomUUID();
    setMessages((prev) => [...prev, { id, role, content, createdAt: new Date().toISOString() }]);
    return id;
  }, []);
  const updateMessage = useCallback((id: string, content: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content } : m)));
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
      bedrock,
      saveBedrock,
      forgetBedrock,
      temporary,
      messages,
      addMessage,
      updateMessage,
      startChat,
      loadChat,
    }),
    [
      settings,
      acceptDisclosure,
      setWebSearch,
      bedrock,
      saveBedrock,
      forgetBedrock,
      temporary,
      messages,
      addMessage,
      updateMessage,
      startChat,
      loadChat,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
