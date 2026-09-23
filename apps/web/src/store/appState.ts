import type { Chat, ChatMessage, Role } from '@maysi/shared';
import { createContext, useContext } from 'react';

export interface Settings {
  disclosureAccepted: boolean;
  webSearch: boolean;
}

export interface AppState {
  settings: Settings;
  acceptDisclosure: () => void;
  setWebSearch: (enabled: boolean) => void;
  temporary: boolean;
  messages: ChatMessage[];
  addMessage: (role: Role, content: string) => void;
  startChat: (temporary: boolean) => void;
  loadChat: (chat: Chat) => void;
}

export const AppStateContext = createContext<AppState | null>(null);

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
