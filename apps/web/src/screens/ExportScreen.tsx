import type { ExportFormat } from '@maysi/shared';
import { Braces, FileText, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { IconButton } from '../components/IconButton';

const formats = [
  { value: 'json', label: 'Export as JSON', description: 'Machine readable format', icon: Braces },
  {
    value: 'markdown',
    label: 'Export as Markdown',
    description: 'Easy to read text format',
    icon: FileText,
  },
] as const;

export function ExportScreen() {
  const navigate = useNavigate();
  const [format, setFormat] = useState<ExportFormat>('json');
  const [requested, setRequested] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between px-4 py-2">
        <h1 className="text-lg font-bold">Export chats</h1>
        <IconButton label="Close" onClick={() => navigate('/maysi/chat')}>
          <X size={20} />
        </IconButton>
      </header>

      <main className="flex flex-1 flex-col px-4 pb-4">
        <fieldset className="mt-2">
          <legend className="text-sm text-muted">
            Choose a format to export your chat history.
          </legend>
          <div className="mt-4 space-y-3">
            {formats.map(({ value, label, description, icon: Icon }) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-line transition has-checked:ring-2 has-checked:ring-brand-500"
              >
                <Icon size={20} aria-hidden="true" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-xs text-muted">{description}</span>
                </span>
                <input
                  type="radio"
                  name="format"
                  value={value}
                  checked={format === value}
                  onChange={() => {
                    setFormat(value);
                    setRequested(false);
                  }}
                  className="size-4 accent-brand-500"
                />
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={() => setRequested(true)}
          className="mt-8 w-full rounded-full bg-brand-500 py-3.5 font-semibold text-white transition hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          Export chats
        </button>
        {requested && (
          <p role="status" className="mt-3 text-center text-xs text-brand-700">
            Export will download your saved chats once on-device history is added.
          </p>
        )}
        <p className="mt-4 text-center text-xs text-muted">
          Your exported chats will be downloaded to this device.
        </p>
      </main>
    </div>
  );
}
