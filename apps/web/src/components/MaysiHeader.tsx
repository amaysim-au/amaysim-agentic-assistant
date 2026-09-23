import { ChevronLeft, Menu } from 'lucide-react';
import { BetaBadge } from './BetaBadge';
import { IconButton } from './IconButton';
import { MaysiAvatar } from './MaysiAvatar';

interface Props {
  onBack?: () => void;
  onMenu?: () => void;
}

export function MaysiHeader({ onBack, onMenu }: Props) {
  return (
    <header className="flex items-center gap-2 px-3 py-2">
      {onBack && (
        <IconButton label="Back to amaysim" onClick={onBack} className="-mr-1">
          <ChevronLeft size={22} />
        </IconButton>
      )}
      <MaysiAvatar size={28} />
      <span className="font-semibold">Maysi</span>
      <BetaBadge />
      {onMenu && (
        <IconButton label="Open menu" onClick={onMenu} className="ml-auto">
          <Menu size={20} />
        </IconButton>
      )}
    </header>
  );
}
