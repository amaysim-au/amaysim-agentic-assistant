export type Role = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export type ExportFormat = 'json' | 'markdown';

export interface ChatExport {
  version: 1;
  exportedAt: string;
  chats: Chat[];
}

export interface HealthResponse {
  status: 'ok';
  region: string;
  modelConfigured: boolean;
}
