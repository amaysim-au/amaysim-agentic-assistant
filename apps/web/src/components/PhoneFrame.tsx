import { BatteryFull, Signal, Wifi } from 'lucide-react';
import type { ReactNode } from 'react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full items-center justify-center md:py-8">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-cream md:aspect-[390/844] md:h-[min(844px,calc(100dvh_-_4rem))] md:w-auto md:rounded-[44px] md:border-[10px] md:border-neutral-900 md:shadow-2xl">
        <div
          aria-hidden="true"
          className="hidden items-center justify-between px-7 pt-3 pb-1 text-xs font-semibold md:flex"
        >
          <span>15:35</span>
          <span className="flex items-center gap-1">
            <Signal size={14} />
            <Wifi size={14} />
            <BatteryFull size={16} />
          </span>
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
