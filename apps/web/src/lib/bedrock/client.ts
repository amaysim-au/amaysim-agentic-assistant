import type { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import type { BedrockSettings } from '../../store/appState';

export const DEFAULT_REGION = 'ap-southeast-2';

// Inference profile prefix sets where requests may be processed: au, apac or global.
export const MODEL_OPTIONS = [
  { id: 'apac.amazon.nova-lite-v1:0', label: 'Amazon Nova Lite (APAC)' },
  { id: 'apac.amazon.nova-pro-v1:0', label: 'Amazon Nova Pro (APAC)' },
  { id: 'au.anthropic.claude-haiku-4-5-20251001-v1:0', label: 'Claude Haiku 4.5 (Australia)' },
  { id: 'global.amazon.nova-2-lite-v1:0', label: 'Amazon Nova 2 Lite (Global)' },
] as const;

export function isAllowedModel(id: unknown): id is string {
  return MODEL_OPTIONS.some((option) => option.id === id);
}

const envModelId = import.meta.env.VITE_BEDROCK_MODEL_ID as string | undefined;
export const DEFAULT_MODEL_ID: string = isAllowedModel(envModelId)
  ? envModelId
  : MODEL_OPTIONS[0].id;

let cached: { apiKey: string; region: string; client: Promise<BedrockRuntimeClient> } | null = null;

export function isUnexpired(settings: BedrockSettings | null): settings is BedrockSettings {
  return settings !== null && settings.expiresAt > Date.now();
}

export function getBedrockClient({
  apiKey,
  region,
}: BedrockSettings): Promise<BedrockRuntimeClient> {
  if (!cached || cached.apiKey !== apiKey || cached.region !== region) {
    const client = import('@aws-sdk/client-bedrock-runtime').then(
      ({ BedrockRuntimeClient }) =>
        new BedrockRuntimeClient({
          region,
          token: { token: apiKey },
          authSchemePreference: ['httpBearerAuth'],
        }),
    );
    cached = { apiKey, region, client };
  }
  return cached.client;
}

export async function testConnection(settings: BedrockSettings): Promise<void> {
  const [client, { ConverseCommand }] = await Promise.all([
    getBedrockClient(settings),
    import('@aws-sdk/client-bedrock-runtime'),
  ]);
  await client.send(
    new ConverseCommand({
      modelId: settings.modelId,
      messages: [{ role: 'user', content: [{ text: 'Reply with the single word: ok' }] }],
      inferenceConfig: { maxTokens: 10 },
    }),
  );
}

export type BedrockErrorKind = 'auth' | 'model' | 'throttled' | 'network' | 'other';

export function describeBedrockError(error: unknown): { kind: BedrockErrorKind; message: string } {
  const err = error as { name?: string; message?: string; $metadata?: { httpStatusCode?: number } };
  const status = err.$metadata?.httpStatusCode;
  if (status === 401 || /api key|authentication|expired|bearer/i.test(err.message ?? '')) {
    return { kind: 'auth', message: 'Key expired or invalid – paste a new one.' };
  }
  if (err.name === 'AccessDeniedException' || status === 403) {
    return { kind: 'model', message: 'Model not enabled for this role.' };
  }
  if (err.name === 'ThrottlingException' || status === 429) {
    return { kind: 'throttled', message: 'Busy, try again shortly.' };
  }
  if (!status) return { kind: 'network', message: "Can't reach Bedrock." };
  return { kind: 'other', message: err.message || 'Bedrock request failed.' };
}
