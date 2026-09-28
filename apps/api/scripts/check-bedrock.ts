import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { config } from '../src/config';

const { awsRegion, bedrockModelId } = config;

if (!bedrockModelId) {
  console.error('BEDROCK_MODEL_ID is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

// The SDK switches to bearer auth on its own when this variable is set.
const auth = process.env.AWS_BEARER_TOKEN_BEDROCK ? 'bearer token' : 'AWS credentials';
const client = new BedrockRuntimeClient({ region: awsRegion });

try {
  const response = await client.send(
    new ConverseCommand({
      modelId: bedrockModelId,
      messages: [{ role: 'user', content: [{ text: 'Reply with the single word: ok' }] }],
      inferenceConfig: { maxTokens: 10 },
    }),
  );
  const reply = response.output?.message?.content?.[0]?.text ?? '(no text)';
  console.log(`Bedrock OK – ${bedrockModelId} in ${awsRegion} via ${auth} replied: ${reply}`);
} catch (error) {
  console.error(`Bedrock check failed (${auth}):`, error instanceof Error ? error.message : error);
  process.exit(1);
}
