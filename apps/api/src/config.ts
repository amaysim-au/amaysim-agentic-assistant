import { fileURLToPath } from 'node:url';

try {
  process.loadEnvFile(fileURLToPath(new URL('../../../.env', import.meta.url)));
} catch {
  // No root .env; fall back to the process environment.
}

export const config = {
  port: Number(process.env.PORT ?? 8787),
  webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
  awsRegion: process.env.AWS_REGION ?? 'ap-southeast-2',
  bedrockModelId: process.env.BEDROCK_MODEL_ID ?? '',
};
