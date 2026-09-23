import { Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { MaysiAvatar } from '../components/MaysiAvatar';
import { useAppState } from '../store/appState';

type Mode = 'chatbot' | 'maysi';

const topics = ['Usage', 'Data', 'Plans', 'Roaming', 'Account', 'eSIM'];
const maysiPrompts = [
  'Plan a weekend away',
  'Explain something to me',
  'Help me write an email',
  'Create a meal plan',
];

export function SearchScreen() {
  const navigate = useNavigate();
  const { startChat, addMessage } = useAppState();
  const [mode, setMode] = useState<Mode>('maysi');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  function submit(text: string) {
    const q = text.trim();
    if (!q) return;
    if (mode === 'maysi') {
      startChat(false);
      addMessage('user', q);
      navigate('/maysi');
    } else {
      setNotice("The amaysim chatbot isn't part of this prototype. Switch to Maysi to ask it.");
    }
  }

  const chips = mode === 'maysi' ? maysiPrompts : topics;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <h1 className="px-5 pt-3 text-2xl font-bold">Search</h1>

      <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 text-center">
        <div className="flex size-36 items-center justify-center rounded-full bg-brand-100">
          {mode === 'maysi' ? (
            <MaysiAvatar size={72} />
          ) : (
            <Search size={56} className="text-brand-500" aria-hidden="true" />
          )}
        </div>
        <h2 className="mt-6 text-lg font-semibold">
          {mode === 'maysi' ? 'Ask Maysi anything' : 'What are you looking for?'}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {mode === 'maysi'
            ? 'Your AI assistant for everyday questions.'
            : 'Search a keyword or choose a popular topic.'}
        </p>
        <div className="mt-5 flex max-w-xs flex-wrap justify-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => submit(chip)}
              className="rounded-full border border-brand-300 px-4 py-1.5 text-sm text-brand-600 transition hover:bg-brand-50"
            >
              {chip}
            </button>
          ))}
        </div>
        {notice && (
          <p role="status" className="mt-4 text-xs text-muted">
            {notice}
          </p>
        )}
      </main>

      <form
        className="flex items-center gap-2 border-t border-line px-3 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
      >
        <Link
          to="/"
          aria-label="Back to home"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-lg font-bold text-white"
        >
          a
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full bg-neutral-100 py-1 pr-1 pl-3">
          <Search size={16} className="shrink-0 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === 'maysi' ? 'Ask Maysi' : 'Search'}
            aria-label="Search"
            className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted"
          />
          <div
            role="radiogroup"
            aria-label="Search with"
            className="flex shrink-0 rounded-full bg-white p-0.5 text-xs"
          >
            <button
              type="button"
              role="radio"
              aria-checked={mode === 'chatbot'}
              onClick={() => {
                setMode('chatbot');
                setNotice(null);
              }}
              className={`rounded-full px-2.5 py-1 ${mode === 'chatbot' ? 'bg-neutral-200 font-semibold' : 'text-muted'}`}
            >
              Chatbot
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={mode === 'maysi'}
              onClick={() => {
                setMode('maysi');
                setNotice(null);
              }}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${mode === 'maysi' ? 'bg-brand-100 font-semibold text-brand-700' : 'text-muted'}`}
            >
              <MaysiAvatar size={14} />
              Maysi
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
