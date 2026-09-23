interface Props {
  size?: number;
  className?: string;
}

export function MaysiAvatar({ size = 32, className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      className={`text-brand-500 ${className}`}
    >
      <line x1="24" y1="6" x2="24" y2="13" stroke="currentColor" strokeWidth="3" />
      <circle cx="24" cy="6" r="3.5" fill="currentColor" />
      <rect x="4" y="22" width="5" height="10" rx="2.5" fill="currentColor" />
      <rect x="39" y="22" width="5" height="10" rx="2.5" fill="currentColor" />
      <rect x="8" y="12" width="32" height="28" rx="11" fill="currentColor" />
      <rect x="13" y="19" width="22" height="14" rx="7" fill="white" />
      <circle cx="19.5" cy="26" r="2.6" fill="currentColor" />
      <circle cx="28.5" cy="26" r="2.6" fill="currentColor" />
    </svg>
  );
}
