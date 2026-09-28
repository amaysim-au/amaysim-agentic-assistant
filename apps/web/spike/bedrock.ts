import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseStreamCommand,
  type Message,
} from '@aws-sdk/client-bedrock-runtime';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const form = $<HTMLFormElement>('form');
const output = $<HTMLPreElement>('output');
const log = $<HTMLPreElement>('log');
let controller: AbortController | null = null;

function write(line: string) {
  log.textContent += `${new Date().toLocaleTimeString()}  ${line}\n`;
}

$<HTMLButtonElement>('stop').addEventListener('click', () => controller?.abort());

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const mode = ((event as SubmitEvent).submitter as HTMLButtonElement | null)?.dataset.mode;
  const apiKey = $<HTMLInputElement>('apiKey').value.trim();
  const region = $<HTMLInputElement>('region').value.trim();
  const modelId = $<HTMLInputElement>('modelId').value.trim();
  const messages: Message[] = [
    { role: 'user', content: [{ text: $<HTMLTextAreaElement>('prompt').value }] },
  ];

  const client = new BedrockRuntimeClient({
    region,
    token: { token: apiKey },
    authSchemePreference: ['httpBearerAuth'],
  });

  controller = new AbortController();
  output.textContent = '';
  const started = performance.now();
  write(`${mode} → ${modelId} in ${region} from ${location.origin}`);

  try {
    if (mode === 'stream') {
      const response = await client.send(
        new ConverseStreamCommand({ modelId, messages, inferenceConfig: { maxTokens: 256 } }),
        { abortSignal: controller.signal },
      );
      let chunks = 0;
      for await (const item of response.stream ?? []) {
        const text = item.contentBlockDelta?.delta?.text;
        if (text) {
          if (chunks === 0)
            write(`first token after ${Math.round(performance.now() - started)} ms`);
          chunks++;
          output.textContent += text;
        }
        if (item.messageStop) write(`stopReason: ${item.messageStop.stopReason}`);
        if (item.metadata?.usage) write(`usage: ${JSON.stringify(item.metadata.usage)}`);
      }
      write(`OK – ${chunks} deltas in ${Math.round(performance.now() - started)} ms`);
    } else {
      const response = await client.send(
        new ConverseCommand({ modelId, messages, inferenceConfig: { maxTokens: 256 } }),
        { abortSignal: controller.signal },
      );
      output.textContent = response.output?.message?.content?.[0]?.text ?? '(no text)';
      write(
        `OK in ${Math.round(performance.now() - started)} ms, usage: ${JSON.stringify(response.usage)}`,
      );
    }
  } catch (error) {
    const err = error as {
      name?: string;
      message?: string;
      $metadata?: { httpStatusCode?: number };
    };
    const status = err.$metadata?.httpStatusCode;
    write(`FAILED – ${err.name ?? 'Error'} (HTTP ${status ?? 'n/a'}): ${err.message}`);
    if (!status) write('No HTTP status usually means CORS or network – check the Network tab.');
  } finally {
    controller = null;
  }
});
