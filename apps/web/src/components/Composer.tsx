import { ArrowUp, Mic, Plus } from 'lucide-react';
import { IconButton } from './IconButton';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function Composer({ value, onChange, onSubmit }: Props) {
  const hasText = value.trim().length > 0;

  return (
    <form
      className="flex items-end gap-1 rounded-3xl bg-white p-1.5 shadow-sm ring-1 ring-line"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <IconButton label="Add files (coming soon)" disabled>
        <Plus size={20} />
      </IconButton>
      <textarea
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="Message Maysi..."
        aria-label="Message Maysi"
        className="field-sizing-content max-h-32 min-h-9 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted"
      />
      {hasText ? (
        <button
          type="submit"
          aria-label="Send message"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <ArrowUp size={18} />
        </button>
      ) : (
        <IconButton
          label="Voice mode (coming soon)"
          disabled
          className="bg-brand-100 text-brand-600"
        >
          <Mic size={18} />
        </IconButton>
      )}
    </form>
  );
}
