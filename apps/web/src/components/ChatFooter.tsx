import { PoweredByAws } from './PoweredByAws';

export function ChatFooter() {
  return (
    <div className="mt-2 space-y-0.5">
      <p className="text-center text-[11px] text-muted">
        Maysi may make mistakes. Check important information.
      </p>
      <PoweredByAws />
    </div>
  );
}
