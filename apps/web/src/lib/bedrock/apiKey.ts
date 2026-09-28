const PREFIX = 'bedrock-api-key-';
const FALLBACK_TTL_MS = 12 * 60 * 60 * 1000;

export type ParsedApiKey =
  { ok: true; apiKey: string; expiresAt: number } | { ok: false; error: string };

// The key is the prefix plus a base64-encoded presigned URL; its X-Amz-Date + X-Amz-Expires bound the lifetime.
function readExpiry(apiKey: string): number | null {
  try {
    const url = atob(apiKey.slice(PREFIX.length));
    const params = new URLSearchParams(url.slice(url.indexOf('?') + 1));
    const date = params.get('X-Amz-Date')?.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
    const seconds = Number(params.get('X-Amz-Expires'));
    if (!date || !seconds) return null;
    const [, y, mo, d, h, mi, s] = date.map(Number);
    return Date.UTC(y, mo - 1, d, h, mi, s) + seconds * 1000;
  } catch {
    return null;
  }
}

export function parseApiKey(raw: string, now = Date.now()): ParsedApiKey {
  const apiKey = raw.trim();
  if (!apiKey.startsWith(PREFIX) || apiKey.length === PREFIX.length) {
    return {
      ok: false,
      error: `That doesn't look like a Bedrock API key. It should start with "${PREFIX}".`,
    };
  }
  const expiresAt = readExpiry(apiKey) ?? now + FALLBACK_TTL_MS;
  if (expiresAt <= now)
    return { ok: false, error: 'That key has already expired. Generate a new one.' };
  return { ok: true, apiKey, expiresAt };
}

export function maskApiKey(apiKey: string): string {
  return `${PREFIX}…${apiKey.slice(-4)}`;
}
