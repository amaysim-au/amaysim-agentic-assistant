import { X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { IconButton } from '../components/IconButton';
import { maskApiKey, parseApiKey } from '../lib/bedrock/apiKey';
import {
  DEFAULT_MODEL_ID,
  DEFAULT_REGION,
  describeBedrockError,
  testConnection,
} from '../lib/bedrock/client';
import { useAppState } from '../store/appState';

const inputClass =
  'mt-1 w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-line outline-none focus:ring-2 focus:ring-brand-500';
const secondaryButtonClass =
  'flex-1 rounded-full border border-brand-500 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50';

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function SettingsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bedrock, saveBedrock, forgetBedrock } = useAppState();
  const [apiKey, setApiKey] = useState('');
  const [region, setRegion] = useState(bedrock?.region ?? DEFAULT_REGION);
  const [modelId, setModelId] = useState(bedrock?.modelId ?? DEFAULT_MODEL_ID);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const expired = bedrock !== null && bedrock.expiresAt <= now;
  const connected = bedrock !== null && !expired;

  function handleSave(event: FormEvent) {
    event.preventDefault();
    const nextRegion = region.trim() || DEFAULT_REGION;
    const nextModelId = modelId.trim() || DEFAULT_MODEL_ID;
    if (!apiKey.trim() && connected) {
      saveBedrock({ ...bedrock, region: nextRegion, modelId: nextModelId });
      setNotice({ tone: 'ok', text: 'Settings saved.' });
      return;
    }
    const parsed = parseApiKey(apiKey);
    if (!parsed.ok) {
      setNotice({ tone: 'error', text: parsed.error });
      return;
    }
    saveBedrock({
      apiKey: parsed.apiKey,
      region: nextRegion,
      modelId: nextModelId,
      expiresAt: parsed.expiresAt,
    });
    setApiKey('');
    setNow(Date.now());
    setNotice({ tone: 'ok', text: 'Key saved.' });
  }

  async function handleTest() {
    if (!bedrock) return;
    setTesting(true);
    setNotice(null);
    try {
      await testConnection(bedrock);
      setNotice({ tone: 'ok', text: `Connected – ${bedrock.modelId} replied.` });
    } catch (error) {
      const { kind, message } = describeBedrockError(error);
      if (kind === 'auth') forgetBedrock();
      setNotice({ tone: 'error', text: message });
    } finally {
      setTesting(false);
    }
  }

  function handleForget() {
    forgetBedrock();
    setNotice({ tone: 'ok', text: 'Key forgotten. Maysi is back to demo replies.' });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between px-4 py-2">
        <h1 className="text-lg font-bold">Settings</h1>
        <IconButton
          label="Close"
          onClick={() => (location.key === 'default' ? navigate('/') : navigate(-1))}
        >
          <X size={20} />
        </IconButton>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        <h2 className="mt-2 text-sm font-semibold">Amazon Bedrock</h2>
        <section className="mt-2 rounded-2xl bg-white p-4 ring-1 ring-line" aria-live="polite">
          {connected ? (
            <>
              <p className="text-sm font-semibold text-green-700">
                Connected until {formatTime(bedrock.expiresAt)}
              </p>
              <p className="mt-1 font-mono text-xs text-muted">{maskApiKey(bedrock.apiKey)}</p>
              <p className="mt-1 text-xs text-muted">
                {bedrock.modelId} · {bedrock.region}
              </p>
            </>
          ) : expired ? (
            <p className="text-sm font-semibold text-brand-700">Expired – paste a new key.</p>
          ) : (
            <p className="text-sm">
              <span className="font-semibold">Not connected.</span>{' '}
              <span className="text-muted">Maysi uses demo replies.</span>
            </p>
          )}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleTest}
              disabled={!connected || testing}
              className={secondaryButtonClass}
            >
              {testing ? 'Testing…' : 'Test connection'}
            </button>
            <button
              type="button"
              onClick={handleForget}
              disabled={!bedrock}
              className={secondaryButtonClass}
            >
              Forget key
            </button>
          </div>
        </section>

        {notice && (
          <p
            role={notice.tone === 'error' ? 'alert' : 'status'}
            className={`mt-3 text-center text-xs ${notice.tone === 'error' ? 'text-brand-700' : 'text-green-700'}`}
          >
            {notice.text}
          </p>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-3">
          <label className="block text-sm font-semibold">
            {connected ? 'Replace API key' : 'Short-term API key'}
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="bedrock-api-key-…"
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-semibold">
            Region
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-semibold">
            Model ID
            <input
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            disabled={!apiKey.trim() && !connected}
            className="w-full rounded-full bg-brand-500 py-3.5 font-semibold text-white transition hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </form>

        <p className="mt-4 text-xs leading-relaxed text-muted">
          Generate a key in the AWS Bedrock console (region {DEFAULT_REGION}) under{' '}
          <span className="font-semibold">API keys → Generate short-term API key</span>. Keys last
          up to 12 hours and stay in this browser only.
        </p>
      </main>
    </div>
  );
}
