import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChatFooter } from '../components/ChatFooter';
import { Composer } from '../components/Composer';
import { MaysiHeader } from '../components/MaysiHeader';
import { MenuDrawer } from '../components/MenuDrawer';
import { MessageBubble } from '../components/MessageBubble';
import { useAppState } from '../store/appState';

const GREETING =
  "Hi! I'm Maysi, your AI assistant. I can help with questions, ideas, research, planning and more.\n\nWhat would you like to chat about?";

// Stand-in until Bedrock streaming is wired up in Phase 2.
const MOCK_REPLY =
  "Thanks for your message! This is a prototype preview, so I can't answer just yet – real responses are coming in the next build phase.";

const suggestions = [
  'Plan a weekend in Japan',
  'Explain something to me',
  'Help me write an email',
  'Compare a few options',
  'Create a meal plan',
];

function Sunglasses() {
  return (
    <svg viewBox="0 0 64 28" width="64" height="28" aria-hidden="true" className="text-ink">
      <path d="M3 6h58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M6 6c0 11 4 17 12 17s11-7 11-17Z" fill="currentColor" />
      <path d="M35 6c0 10 3 17 11 17s12-6 12-17Z" fill="currentColor" />
    </svg>
  );
}

function TemporaryEmptyState({ onEnd }: { onEnd: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="flex size-32 items-center justify-center rounded-full border-2 border-dashed border-neutral-300">
        <Sunglasses />
      </div>
      <h2 className="mt-6 text-xl font-bold">Temporary chat</h2>
      <p className="mt-2 max-w-60 text-sm text-muted">
        Your conversation won't be saved to your chat history.
      </p>
      <button
        type="button"
        onClick={onEnd}
        className="mt-6 rounded-full border border-brand-500 px-6 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
      >
        End temporary chat
      </button>
    </div>
  );
}

export function ChatScreen() {
  const navigate = useNavigate();
  const { messages, addMessage, temporary, startChat } = useAppState();
  const [draft, setDraft] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    if (messages.at(-1)?.role !== 'user') return;
    const timer = setTimeout(() => addMessage('assistant', MOCK_REPLY), 700);
    return () => clearTimeout(timer);
  }, [messages, addMessage]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    addMessage('user', trimmed);
    setDraft('');
  }

  const isEmpty = messages.length === 0;
  const endTemporary = () => startChat(false);

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${temporary ? 'bg-neutral-50' : ''}`}>
      <MaysiHeader onBack={() => navigate('/')} onMenu={() => setMenuOpen(true)} />

      {temporary && !isEmpty && (
        <div className="mx-4 flex items-center justify-between rounded-full bg-neutral-200 px-4 py-1.5 text-xs">
          <span>Temporary chat · not saved</span>
          <button type="button" onClick={endTemporary} className="font-semibold text-brand-600">
            End
          </button>
        </div>
      )}

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {temporary && isEmpty ? (
          <TemporaryEmptyState onEnd={endTemporary} />
        ) : (
          <div className="space-y-4" aria-live="polite">
            {!temporary && <MessageBubble role="assistant" content={GREETING} />}
            {isEmpty && (
              <div className="flex flex-col items-start gap-2 pl-9">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full bg-white px-4 py-2 text-sm shadow-sm ring-1 ring-line transition hover:ring-brand-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} />
            ))}
            <div ref={endRef} />
          </div>
        )}
      </main>

      <div className="px-4 pt-2 pb-3">
        <Composer value={draft} onChange={setDraft} onSubmit={() => send(draft)} />
        <ChatFooter />
      </div>

      {menuOpen && <MenuDrawer onClose={closeMenu} />}
    </div>
  );
}
