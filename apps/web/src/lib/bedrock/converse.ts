import type { Message, TokenUsage } from '@aws-sdk/client-bedrock-runtime';
import type { ChatMessage } from '@maysi/shared';
import type { BedrockSettings } from '../../store/appState';
import { getBedrockClient } from './client';
import { SYSTEM_PROMPT } from './systemPrompt';

// Converse needs alternating turns that start with the user.
export function toConverseMessages(messages: ChatMessage[]): Message[] {
  const out: Message[] = [];
  for (const { role, content } of messages) {
    const text = content.trim();
    if (!text || (out.length === 0 && role !== 'user')) continue;
    const last = out.at(-1);
    if (last?.role === role) last.content?.push({ text });
    else out.push({ role, content: [{ text }] });
  }
  return out;
}

interface StreamChatOptions {
  settings: BedrockSettings;
  messages: ChatMessage[];
  signal: AbortSignal;
  onDelta: (text: string) => void;
}

export async function streamChat({
  settings,
  messages,
  signal,
  onDelta,
}: StreamChatOptions): Promise<{ text: string; usage?: TokenUsage }> {
  const [client, { ConverseStreamCommand }] = await Promise.all([
    getBedrockClient(settings),
    import('@aws-sdk/client-bedrock-runtime'),
  ]);
  const response = await client.send(
    new ConverseStreamCommand({
      modelId: settings.modelId,
      system: [{ text: SYSTEM_PROMPT }],
      messages: toConverseMessages(messages),
      inferenceConfig: { maxTokens: 1024 },
    }),
    { abortSignal: signal },
  );

  let text = '';
  let usage: TokenUsage | undefined;
  for await (const event of response.stream ?? []) {
    if (signal.aborted) break;
    const delta = event.contentBlockDelta?.delta?.text;
    if (delta) {
      text += delta;
      onDelta(delta);
    }
    if (event.metadata?.usage) usage = event.metadata.usage;
  }
  return { text, usage };
}
