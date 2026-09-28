# AWS Bedrock Integration Plan – Feature/AI-001

**Status:** Design (ready for execution)
**Branch:** `feature/AI-001-bedrock-integration`
**Scope:** Proof of concept. Real Bedrock replies for demos, not a production experience.
**Auth:** Short-term Bedrock API key, pasted by the developer into an in-app Settings screen.
**Model:** Amazon Nova Lite (exact ID confirmed in Phase 0).
**API:** Bedrock `ConverseStream`, called directly from the browser.

---

## Goals and non-goals

**Goals**

- Optional: with no key saved, the app keeps using mock replies, so everyone else sees the static demo.
- Only the developer's browser holds the key. No server stores, logs or relays it.
- Works on the current Amplify static hosting with no backend deploy.

**Non-goals (this iteration)**

- Multi-user auth, per-user rate limiting, production hardening.
- STS credentials, SSO login in the browser, a server-side proxy (the proxy is a fallback only, see below).
- Guardrails, tool use, server-held system prompts.

---

## Why short-term API keys

- Generated from an existing SSO session: Bedrock console → **API keys** → **Generate short-term API key**, or the `@aws/bedrock-token-generator` package using an SSO profile.
- Expire at the earlier of 12 hours or the SSO session expiry. Nothing to revoke by hand.
- Only work for Bedrock API calls. A leaked key can't touch S3, IAM or anything else the SSO role can reach.
- A single string sent as `Authorization: Bearer <key>`. No SigV4 signing in the browser.
- Region-bound: a key generated in `ap-southeast-2` only works against that region's endpoint.

**Caveats**

- The SSO role needs `bedrock:CallWithBearerToken`. An organisation SCP can block it (checked in Phase 0).
- Keys can't be revoked individually. If one leaks, end the SSO session or wait for it to expire.
- The key carries all of the role's Bedrock permissions, not just one model. The model choice is only enforced in the client, which is acceptable for a PoC.

---

## Architecture

```
Browser (Amplify static site)
├─ Settings screen ─ paste key, region, model ─► localStorage (maysi.bedrock.v1)
├─ Chat screen
│  ├─ key present and unexpired ─► lib/bedrock/converse.ts ─► ConverseStream
│  │                                   HTTPS, Authorization: Bearer <key>
│  │                                   ─► bedrock-runtime.ap-southeast-2.amazonaws.com
│  └─ no key ─► existing mock reply
└─ apps/api (Hono): unchanged, local dev only, never sees the key
```

The key only ever leaves the browser to the AWS Bedrock endpoint, over TLS.

---

## Key handling rules

- **Storage:** localStorage key `maysi.bedrock.v1` holding `{ apiKey, region, modelId, expiresAt }`. Kept separate from `maysi.settings.v1` so resetting one doesn't touch the other.
- **Validate on save:** the key must start with `bedrock-api-key-`. Base64-decode the rest (a presigned URL) and read `X-Amz-Date` + `X-Amz-Expires` to get an upper-bound `expiresAt`. If decoding fails, use now + 12h.
- **On load:** delete the entry if `expiresAt` has passed.
- **On a 401/403 from Bedrock:** delete the entry, show "Key expired – paste a new one", and fall back to mock replies.
- **Display:** after saving, never show the full key. Show `bedrock-api-key-…abcd` and "Valid until HH:MM".
- **Forget key:** a button that removes the entry immediately.
- **Never** put the key in URLs, console output, error messages, analytics or exported chats.

---

## Phase 0 – Spike (verify before building)

- [x] Confirm model access in `ap-southeast-2` and the model ID to use: on-demand `amazon.nova-lite-v1:0`, or the `apac.amazon.nova-lite-v1:0` inference profile.
  - `apac.amazon.nova-lite-v1:0` works. Use it as the default.
- [x] Generate a short-term key and confirm the organisation allows it (`bedrock:CallWithBearerToken`).
  - Allowed. The decoded key carries `X-Amz-Date` and `X-Amz-Expires=43200` (12h), so the planned expiry parsing works.
- [ ] Node check: set `AWS_BEARER_TOKEN_BEDROCK` and run `npm run check:bedrock`. The SDK reads the variable itself, so no code change is expected.
  - Wiring verified with a dummy key (SDK 3.1138.0): bearer auth selected, Bedrock returned "Authentication failed". Needs a real key.
- [x] Browser check: from `localhost:5173` and the Amplify domain, call `ConverseStream` with AWS SDK v3 and the bearer token. This confirms CORS on `bedrock-runtime`, bearer auth in the browser SDK, and event-stream decoding in the browser.
  - Localhost passed with a real key: `Converse` in ~1s, and `ConverseStream` streamed 36 deltas, with the first token at ~1.6s and `end_turn`.
  - Amplify domain passed: a `fetch` from the DevTools console returned 200 with a reply (latency ~0.9s).
- [x] If the browser check fails, stop and switch to the fallback proxy below.
  - Not needed. The browser path works, so no proxy.

**Running the checks**

```powershell
# Node (from repo root)
$env:AWS_BEARER_TOKEN_BEDROCK = '<key>'; $env:BEDROCK_MODEL_ID = 'apac.amazon.nova-lite-v1:0'
npm run check:bedrock
Remove-Item Env:AWS_BEARER_TOKEN_BEDROCK
```

- Browser (localhost): `npm run dev`, open `http://localhost:5173/spike/bedrock.html`, paste the key, try **Converse** then **ConverseStream** with each model ID. The spike page is dev-only and not part of `vite build`.
- Browser (Amplify origin): paste in the DevTools console on the deployed site. Any HTTP status (even 403) means CORS passed; `TypeError: Failed to fetch` means it didn't.

```js
const key = prompt('Bedrock API key');
const modelId = encodeURIComponent('apac.amazon.nova-lite-v1:0');
const res = await fetch(
  `https://bedrock-runtime.ap-southeast-2.amazonaws.com/model/${modelId}/converse`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: [{ text: 'Say ok' }] }],
      inferenceConfig: { maxTokens: 10 },
    }),
  },
);
console.log(res.status, await res.json());
```

Client config for bearer auth (check against the installed SDK version):

```ts
new BedrockRuntimeClient({
  region,
  token: { token: apiKey },
  authSchemePreference: ['httpBearerAuth'],
});
```

---

## Phase 1 – Settings screen and storage

- [x] `apps/web/src/lib/bedrock/apiKey.ts`: `parseApiKey(raw)` returns `{ apiKey, expiresAt }` or an error. `maskApiKey(key)` for display.
- [x] Extend `AppState` with `bedrock: BedrockSettings | null`, `saveBedrock()` and `forgetBedrock()`. Persist in `AppStateProvider` under `maysi.bedrock.v1`, pruning expired entries on load.
- [x] `apps/web/src/screens/SettingsScreen.tsx` at `/maysi/settings`:
  - Password-type key input (`autoComplete="off"`, `spellCheck={false}`).
  - Region (default `ap-southeast-2`) and model ID (default from `VITE_BEDROCK_MODEL_ID`, otherwise Nova Lite).
  - Status: Not connected / Connected until HH:MM / Expired.
  - **Test connection** (one short `Converse` call) and **Forget key** buttons.
  - A short note on how to generate a key.
- [x] Wire the existing Settings item in `MenuDrawer.tsx` and the Settings button in `HomeScreen.tsx` to the new route.

---

## Phase 2 – Streaming chat

- [x] Add `@aws-sdk/client-bedrock-runtime` to `apps/web`. Load it with dynamic `import()` so it's only fetched when a key is saved.
- [x] `lib/bedrock/client.ts`: create the client from the saved settings, reused until the key or region changes.
  - Done in Phase 1 for **Test connection**, along with `describeBedrockError()` (the Phase 3 error mapping).
- [x] `lib/bedrock/converse.ts`: `streamChat({ messages, signal, onDelta })`:
  - Map shared `ChatMessage[]` to Converse messages (text only). Converse needs turns that alternate and start with `user`, so drop leading assistant messages and merge consecutive same-role ones.
  - Send the system prompt and `inferenceConfig: { maxTokens: 1024 }`.
  - Emit text deltas, and resolve with the final text and usage.
  - Honour `AbortSignal` for the stop button.
- [x] `lib/bedrock/systemPrompt.ts`: the default Maysi system prompt as a constant.
- [x] `AppState`: add `updateMessage(id, content)` so the streaming assistant message can grow in place.
- [x] `ChatScreen.tsx`: use `streamChat` when connected, otherwise the existing mock reply. Render tokens as they arrive, add a stop button, and show a friendly error bubble on failure.
  - The error bubble is kept out of `messages`, so it isn't sent back to the model. An expired or invalid key is forgotten, and the bubble links to Settings.

---

## Phase 3 – Hardening (PoC level)

- [ ] Amplify custom headers (Amplify console → Custom headers, or `customHttp.yml`):
  - `Content-Security-Policy: default-src 'self'; connect-src 'self' https://bedrock-runtime.ap-southeast-2.amazonaws.com; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'` (adjust for any fonts or images in use).
  - `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`.
- [ ] Render model output as Markdown with raw HTML disabled (for example `react-markdown` without `rehype-raw`).
- [ ] Keep `maysi.bedrock.v1` out of chat export and any debug output.
- [ ] Map errors to messages:
  - 401/403 or expired token → expired-key flow.
  - `AccessDeniedException` on the model → "Model not enabled for this role".
  - `ThrottlingException` → "Busy, try again shortly".
  - Network or CORS failure → "Can't reach Bedrock".

---

## Fallback: stateless proxy (only if the Phase 0 browser check fails)

- Lambda Function URL with response streaming, CORS limited to the Amplify domain and `localhost:5173`.
- The browser sends the key in the `Authorization` header on every request. The Lambda forwards it to Bedrock as the bearer token and keeps no session, cache or storage.
- The proxy has no AWS credentials of its own, so callers without a key get nothing.
- No request logging (drop `hono/logger`), never log headers or bodies, return sanitised errors, and set CloudWatch retention to 1 day.
- Allowlist model IDs and cap `maxTokens` on the server.

---

## Deferred

- Bedrock Guardrails (the key's role would also need `bedrock:ApplyGuardrail`).
- Tool use such as web search (PLAN.md Phase 4).
- Server-side system prompts, model selection and rate limiting.
- STS credential or SSO-based auth.
- Images and documents.

---

## Testing

**Unit**

- `parseApiKey`: valid key, wrong prefix, bad base64, expiry extraction.
- Message mapper: alternation, leading assistant message, empty content.
- Storage: expired entries are pruned on load.

**Manual**

1. No key saved: mock replies behave as they do today.
2. Paste a key, **Test connection** succeeds, chat streams real replies.
3. Stop mid-stream.
4. **Forget key**: mock replies return and the localStorage entry is gone.
5. Expired or garbage key: expired message shown, entry cleared.
6. Deployed Amplify build: repeat step 2, and confirm in DevTools that the only calls carrying the key go to `bedrock-runtime`.

---

## Success criteria

- With a valid key, chat streams real Nova Lite replies on localhost and on Amplify.
- Without a key, behaviour is identical to today.
- The key only appears in localStorage and in the `Authorization` header sent to `bedrock-runtime`.
- No changes to `apps/api` or the `amplify.yml` build.

---

## Links

- [Bedrock API keys](https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html)
- [Bedrock Converse API](https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html)
- [Amazon Nova Models](https://aws.amazon.com/bedrock/nova/)
