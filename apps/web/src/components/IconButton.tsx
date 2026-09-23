import type { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({ label, className = '', children, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`flex size-9 shrink-0 items-center justify-center rounded-full transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-brand-500 disabled:opacity-40 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
