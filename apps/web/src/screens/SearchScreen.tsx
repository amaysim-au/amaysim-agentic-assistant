import { Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { MaysiAvatar } from '../components/MaysiAvatar';

const topics = ['Usage', 'Data', 'Plans', 'Roaming', 'Account', 'eSIM'];

export function SearchScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  function submit(text: string) {
    if (!text.trim()) return;
    setNotice("The amaysim chatbot isn't part of this prototype. Switch to Maysi to try it.");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <h1 className="px-5 pt-3 text-2xl font-bold">Search</h1>

      <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 text-center">
        <div className="flex size-36 items-center justify-center rounded-full bg-brand-100">
          <Search size={56} className="text-brand-500" aria-hidden="true" />
        </div>
        <h2 className="mt-6 text-lg font-semibold">What are you looking for?</h2>
        <p className="mt-1 text-sm text-muted">Search a keyword or choose a popular topic.</p>
        <div className="mt-5 flex max-w-xs flex-wrap justify-center gap-2">
          {topics.map((chip) => (
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
            placeholder="Search"
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
              aria-checked="true"
              className="rounded-full bg-neutral-200 px-2.5 py-1 font-semibold"
            >
              Chatbot
            </button>
            <button
              type="button"
              role="radio"
              aria-checked="false"
              onClick={() => navigate('/maysi/welcome')}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-muted"
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
