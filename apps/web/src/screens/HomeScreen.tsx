import {
  Activity,
  ChevronDown,
  ChevronRight,
  CreditCard,
  House,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Smartphone,
} from 'lucide-react';
import { Link } from 'react-router';
import { BetaBadge } from '../components/BetaBadge';
import { MaysiAvatar } from '../components/MaysiAvatar';

const planLinks = [
  { label: 'View usage', icon: Activity },
  { label: 'Replace SIM', icon: Smartphone },
  { label: 'Manage your plan', icon: SlidersHorizontal },
];

const navTabs = [
  { label: 'Payments', icon: CreditCard },
  { label: 'Shop', icon: ShoppingBag },
];

export function HomeScreen() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <main className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="flex items-center justify-between pt-3">
          <span className="text-2xl font-extrabold tracking-tight text-brand-500">amaysim</span>
          <button type="button" aria-label="Settings" className="text-brand-500">
            <Settings size={20} />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex gap-5 font-semibold">
            <span className="border-b-2 border-brand-500 pb-1">mobile</span>
            <span className="pb-1 text-muted">nbn</span>
          </div>
          <span className="flex items-center gap-1 font-semibold text-brand-600">
            0421 354 490 <ChevronDown size={16} aria-hidden="true" />
          </span>
        </div>

        <section className="mt-6 text-center">
          <h1 className="text-5xl font-black tracking-tight text-brand-500">UH-OH!</h1>
          <p className="mt-2 text-lg leading-snug font-bold text-brand-600">
            Your UNLIMITED
            <br />
            plan has expired.
          </p>
          <p className="mt-3 text-sm text-muted">
            You can still receive calls and text but you can't call or text anyone yourself.
          </p>
          <p className="mt-3 text-sm">Restart your plan now for better value.</p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white"
            >
              Restart plan
            </button>
            <button
              type="button"
              className="rounded-full border border-brand-500 px-6 py-2.5 text-sm font-semibold text-brand-600"
            >
              Change plan
            </button>
          </div>
          <p className="mt-3 text-xs text-muted">
            Change payment method?{' '}
            <span className="font-semibold text-brand-600 underline">update your details</span>
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-line p-4">
          <h2 className="text-sm font-bold">UNLIMITED 32GB – expired</h2>
          <ul className="mt-3 space-y-3">
            {planLinks.map(({ label, icon: Icon }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-brand-600">
                <Icon size={16} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </section>

        <Link
          to="/maysi"
          className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-cream p-4 shadow-sm transition hover:border-brand-200 focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <MaysiAvatar size={40} />
          <div className="flex-1">
            <p className="flex items-center gap-2 text-sm font-bold">
              Chat with Maysi <BetaBadge />
            </p>
            <p className="text-xs text-muted">Your AI assistant for everyday questions</p>
          </div>
          <ChevronRight size={18} className="text-muted" aria-hidden="true" />
        </Link>
      </main>

      <nav
        aria-label="Main"
        className="flex items-center justify-between border-t border-line bg-white px-5 py-2"
      >
        <span className="flex flex-col items-center rounded-2xl bg-brand-500 px-4 py-1.5 text-[11px] font-semibold text-white">
          <House size={18} aria-hidden="true" />
          Home
        </span>
        {navTabs.map(({ label, icon: Icon }) => (
          <span key={label} className="flex flex-col items-center text-[11px] text-muted">
            <Icon size={18} aria-hidden="true" />
            {label}
          </span>
        ))}
        <Link
          to="/search"
          aria-label="Search"
          className="flex size-11 items-center justify-center rounded-full bg-neutral-100 transition hover:bg-neutral-200"
        >
          <Search size={20} />
        </Link>
      </nav>
    </div>
  );
}
