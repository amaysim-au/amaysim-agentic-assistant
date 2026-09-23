import type { Role } from '@maysi/shared';
import { MaysiAvatar } from './MaysiAvatar';

interface Props {
  role: Role;
  content: string;
}

export function MessageBubble({ role, content }: Props) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[80%] rounded-2xl rounded-br-md bg-brand-100 px-4 py-2.5 text-sm whitespace-pre-wrap">
          {content}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <MaysiAvatar size={28} className="mt-1 shrink-0" />
      <p className="max-w-[85%] rounded-2xl rounded-tl-md bg-white px-4 py-2.5 text-sm whitespace-pre-wrap shadow-sm ring-1 ring-line">
        {content}
      </p>
    </div>
  );
}
