import type { Chat } from '@maysi/shared';

const DAY_MS = 86_400_000;

export interface ChatGroup {
  label: string;
  chats: Chat[];
}

export function groupChatsByDate(chats: Chat[], now = new Date()): ChatGroup[] {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfToday - 7 * DAY_MS;
  const groups: ChatGroup[] = [
    { label: 'Today', chats: [] },
    { label: 'Previous 7 days', chats: [] },
    { label: 'Older', chats: [] },
  ];

  const sorted = [...chats].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  for (const chat of sorted) {
    const time = Date.parse(chat.updatedAt);
    const index = time >= startOfToday ? 0 : time >= startOfWeek ? 1 : 2;
    groups[index].chats.push(chat);
  }
  return groups.filter((g) => g.chats.length > 0);
}

export function formatChatTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}
