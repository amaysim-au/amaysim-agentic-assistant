import type { Role } from '@maysi/shared';
import { lazy, Suspense } from 'react';
import { MaysiAvatar } from './MaysiAvatar';

const Markdown = lazy(() => import('./Markdown').then((m) => ({ default: m.Markdown })));

interface Props {
  role: Role;
  content: string;
  tone?: 'error';
}

export function MessageBubble({ role, content, tone }: Props) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[80%] rounded-2xl rounded-br-md bg-brand-100 px-4 py-2.5 text-sm whitespace-pre-wrap">
          {content}
        </p>
      </div>
    );
  }

  const bubbleClass = 'max-w-[85%] rounded-2xl rounded-tl-md px-4 py-2.5 text-sm shadow-sm ring-1';
  return (
    <div className="flex items-start gap-2">
      <MaysiAvatar size={28} className="mt-1 shrink-0" />
      {tone === 'error' ? (
        <p
          role="alert"
          className={`${bubbleClass} bg-brand-50 whitespace-pre-wrap text-brand-700 ring-brand-200`}
        >
          {content}
        </p>
      ) : (
        <div className={`${bubbleClass} min-w-0 bg-white ring-line`}>
          <Suspense fallback={<p className="whitespace-pre-wrap">{content}</p>}>
            <Markdown>{content}</Markdown>
          </Suspense>
        </div>
      )}
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex items-start gap-2">
      <MaysiAvatar size={28} className="mt-1 shrink-0" />
      <p
        role="status"
        aria-label="Maysi is typing"
        className="flex gap-1 rounded-2xl rounded-tl-md bg-white px-4 py-3.5 shadow-sm ring-1 ring-line"
      >
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1.5 animate-bounce rounded-full bg-muted"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </p>
    </div>
  );
}
