import { CircleCheck, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { DisclosureModal } from '../components/DisclosureModal';
import { MaysiAvatar } from '../components/MaysiAvatar';
import { MaysiHeader } from '../components/MaysiHeader';
import { PoweredByAws } from '../components/PoweredByAws';
import { useAppState } from '../store/appState';

const features = [
  'Get answers to any question',
  'Search the web for the latest information',
  'Summarise, plan, write and brainstorm',
  'Voice conversations',
  'Upload and analyse images and files',
];

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { acceptDisclosure } = useAppState();
  const [showDisclosure, setShowDisclosure] = useState(false);
  const closeDisclosure = useCallback(() => setShowDisclosure(false), []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MaysiHeader onBack={() => navigate('/')} />
      <main className="flex flex-1 flex-col items-center overflow-y-auto px-6 pb-4 text-center">
        <div className="relative mt-4 flex size-40 shrink-0 items-center justify-center rounded-full bg-brand-100">
          <MaysiAvatar size={96} />
          <Sparkles className="absolute top-6 right-6 text-brand-500" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Meet Maysi</h1>
        <p className="mt-2 text-muted">
          Your personal AI assistant
          <br />
          for everyday questions.
        </p>
        <ul className="mt-6 w-full space-y-3 text-left text-sm">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <CircleCheck size={20} className="shrink-0 text-brand-500" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-auto w-full pt-8">
          <button
            type="button"
            onClick={() => setShowDisclosure(true)}
            className="w-full rounded-full bg-brand-500 py-3.5 font-semibold text-white transition hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            Start chatting
          </button>
          <PoweredByAws className="mt-4" />
        </div>
      </main>

      {showDisclosure && (
        <DisclosureModal
          onClose={closeDisclosure}
          onAccept={() => {
            acceptDisclosure();
            navigate({ pathname: '/maysi/chat', search }, { replace: true });
          }}
        />
      )}
    </div>
  );
}
