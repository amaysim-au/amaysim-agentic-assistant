import type { Chat, ChatMessage, Role } from '@maysi/shared';
import { createContext, useContext } from 'react';

export interface Settings {
  disclosureAccepted: boolean;
  webSearch: boolean;
}

export interface BedrockSettings {
  apiKey: string;
  region: string;
  modelId: string;
  expiresAt: number;
}

export interface AppState {
  settings: Settings;
  acceptDisclosure: () => void;
  setWebSearch: (enabled: boolean) => void;
  bedrock: BedrockSettings | null;
  saveBedrock: (settings: BedrockSettings) => void;
  forgetBedrock: () => void;
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
