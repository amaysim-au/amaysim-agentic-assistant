import {
  CircleHelp,
  FileDown,
  FileUp,
  Ghost,
  Globe,
  Mic,
  Search,
  Settings,
  SquarePen,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppState } from '../store/appState';
import { BetaBadge } from './BetaBadge';
import { IconButton } from './IconButton';
import { MaysiAvatar } from './MaysiAvatar';

const rowClass =
  'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent';

interface ItemProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

function MenuItem({ icon: Icon, label, onClick }: ItemProps) {
  return (
    <button type="button" className={rowClass} onClick={onClick} disabled={!onClick}>
      <Icon size={20} aria-hidden="true" />
      <span className="flex-1">{label}</span>
      {!onClick && <span className="text-[10px] font-semibold text-muted uppercase">Soon</span>}
    </button>
  );
}

interface ToggleProps {
  icon: LucideIcon;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function MenuToggle({ icon: Icon, label, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={rowClass}
      onClick={() => onChange(!checked)}
    >
      <Icon size={20} aria-hidden="true" />
      <span className="flex-1">{label}</span>
      <span
        aria-hidden="true"
        className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-brand-500' : 'bg-neutral-300'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : ''}`}
        />
      </span>
    </button>
  );
}

export function MenuDrawer({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { settings, setWebSearch, temporary, startChat } = useAppState();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function go(path: string) {
    onClose();
    navigate(path);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Maysi menu"
      className="absolute inset-0 z-30 flex flex-col bg-white"
    >
      <header className="flex items-center gap-2 px-4 py-2">
        <MaysiAvatar size={28} />
        <span className="font-semibold">Maysi</span>
        <BetaBadge />
        <IconButton label="Close menu" onClick={onClose} className="ml-auto">
          <X size={20} />
        </IconButton>
      </header>
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <MenuItem
          icon={SquarePen}
          label="New chat"
          onClick={() => {
            startChat(false);
            go('/maysi/chat');
          }}
        />
        <MenuItem icon={Search} label="Search chats" onClick={() => go('/maysi/history')} />
        <MenuItem icon={Mic} label="Voice mode" />
        <MenuToggle
          icon={Globe}
          label="Web search"
          checked={settings.webSearch}
          onChange={setWebSearch}
        />
        <MenuToggle
          icon={Ghost}
          label="Temporary chat (incognito)"
          checked={temporary}
          onChange={(on) => {
            startChat(on);
            go('/maysi/chat');
          }}
        />
        <hr className="mx-3 my-2 border-line" />
        <MenuItem icon={FileUp} label="Import chats" />
        <MenuItem icon={FileDown} label="Export chats" onClick={() => go('/maysi/export')} />
        <hr className="mx-3 my-2 border-line" />
        <MenuItem icon={Settings} label="Settings" />
        <MenuItem icon={CircleHelp} label="Help & feedback" />
      </nav>
    </div>
  );
}
