import { ChevronLeft, ChevronRight, MessageSquare, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { IconButton } from '../components/IconButton';
import { formatChatTime, groupChatsByDate } from '../lib/chatDates';
import { mockChats } from '../lib/mockData';
import { useAppState } from '../store/appState';

export function HistoryScreen() {
  const navigate = useNavigate();
  const { loadChat } = useAppState();
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? mockChats.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.messages.some((m) => m.content.toLowerCase().includes(q)),
        )
      : mockChats;
    return groupChatsByDate(matches);
  }, [query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <header className="flex items-center gap-1 px-3 py-2">
        <IconButton label="Back to chat" onClick={() => navigate('/maysi/chat')}>
          <ChevronLeft size={22} />
        </IconButton>
        <h1 className="text-xl font-bold">Chat history</h1>
      </header>

      <div className="px-4 pb-2">
        <label className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2">
          <Search size={16} className="text-muted" aria-hidden="true" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            aria-label="Search chats"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </label>
      </div>

      <main className="flex-1 overflow-y-auto px-2 pb-4">
        {groups.length === 0 ? (
          <p role="status" className="mt-16 text-center text-sm text-muted">
            {query ? `No chats match "${query.trim()}"` : 'No chats yet'}
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.label} className="mt-3">
              <h2 className="px-3 pb-1 text-xs font-semibold text-muted">{group.label}</h2>
              <ul>
                {group.chats.map((chat) => (
                  <li key={chat.id}>
                    <button
                      type="button"
                      onClick={() => {
                        loadChat(chat);
                        navigate('/maysi/chat');
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-black/5"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                        <MessageSquare size={18} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{chat.title}</span>
                        <span className="block text-xs text-muted">
                          {formatChatTime(chat.updatedAt)}
                        </span>
                      </span>
                      <ChevronRight size={18} className="text-muted" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
