import { BatteryFull, Signal, Wifi } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

// Outer frame size incl. 10px border, so the screen itself is 390x844.
const FRAME_WIDTH = 410;
const FRAME_HEIGHT = 864;
const MARGIN = 64;

function useFrameZoom() {
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const update = () => {
      setZoom(
        desktop.matches
          ? Math.min(
              1,
              (window.innerHeight - MARGIN) / FRAME_HEIGHT,
              (window.innerWidth - MARGIN) / FRAME_WIDTH,
            )
          : 1,
      );
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return zoom;
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  const zoom = useFrameZoom();
  return (
    <div className="flex min-h-full items-center justify-center">
      <div
        style={zoom === 1 ? undefined : { zoom }}
        className="relative flex h-dvh w-full flex-col overflow-hidden bg-cream md:h-[864px] md:w-[410px] md:rounded-[44px] md:border-[10px] md:border-neutral-900 md:shadow-2xl"
      >
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
