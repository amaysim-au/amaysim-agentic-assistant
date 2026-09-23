import type { HealthResponse } from '@maysi/shared';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { config } from './config';

export const app = new Hono().basePath('/api');

app.use('*', logger());
app.use('*', cors({ origin: config.webOrigin }));

app.get('/health', (c) =>
  c.json<HealthResponse>({
    status: 'ok',
    region: config.awsRegion,
    modelConfigured: Boolean(config.bedrockModelId),
  }),
);
