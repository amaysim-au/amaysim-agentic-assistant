import { Globe, Info, ShieldCheck, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { IconButton } from './IconButton';
import { MaysiAvatar } from './MaysiAvatar';

const points = [
  {
    icon: ShieldCheck,
    title: 'Separate from your amaysim account',
    body: "Maysi can't access or manage your amaysim services, plan, usage or personal account details.",
  },
  {
    icon: Globe,
    title: 'A general-purpose AI assistant',
    body: 'Maysi can help with everyday questions, ideas, writing, planning and more.',
  },
  {
    icon: Info,
    title: 'Powered by AWS',
    body: 'Maysi uses leading AI models hosted securely on AWS.',
  },
];

interface Props {
  onClose: () => void;
  onAccept: () => void;
}

export function DisclosureModal({ onClose, onAccept }: Props) {
  const acceptRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    acceptRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-20 flex items-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclosure-title"
        className="relative w-full rounded-3xl bg-cream p-5 shadow-xl"
      >
        <IconButton label="Close" onClick={onClose} className="absolute top-3 right-3">
          <X size={20} />
        </IconButton>
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand-100">
          <MaysiAvatar size={48} />
        </div>
        <h2 id="disclosure-title" className="mt-3 text-center text-xl font-bold">
          A few things to know
        </h2>
        <ul className="mt-4 space-y-2.5">
          {points.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-line">
              <Icon size={22} className="mt-0.5 shrink-0 text-ink" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ul>
        <button
          ref={acceptRef}
          type="button"
          onClick={onAccept}
          className="mt-5 w-full rounded-full bg-brand-500 py-3.5 font-semibold text-white transition hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
