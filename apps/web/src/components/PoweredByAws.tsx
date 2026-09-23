export function PoweredByAws({ className = '' }: { className?: string }) {
  return (
    <p className={`flex items-center justify-center gap-1 text-[11px] text-muted ${className}`}>
      Powered by <span className="font-bold text-ink">aws</span>
    </p>
  );
}
