# AWS Bedrock Integration Plan - Feature/AI-001

**Status:** Design phase (ready for execution)
**Branch:** `feature/AI-001-bedrock-integration`
**Target Model:** Amazon Nova Lite (configurable backend selection)
**API Style:** Bedrock Converse API with SSE streaming

---

## Overview

This plan integrates AWS Bedrock as the primary LLM backend for the Maysi agentic assistant. The implementation emphasizes:

- **Provider neutrality** — frontend and API use a simple, Bedrock-agnostic request/response schema
- **Configurable model selection** — backend controls which model runs; frontend never chooses
- **Streaming-first** — SSE for real-time response streaming to the web client
- **Tool architecture** — design for agent tool use but defer implementation until "Hello LLM" succeeds
- **Safety by design** — Bedrock Guardrails for content filtering
- **Graceful extensibility** — system prompts and user prompts architected for DB persistence, not yet implemented

---

## Architecture

### Component Overview

```
┌─ Frontend (React/Vite)
│  └─ Chat UI → sends provider-neutral JSON to /api/chat
│
├─ API (Hono/Node.js)
│  ├─ /api/chat POST+SSE
│  │  ├─ Validate and normalize request
│  │  ├─ Load system prompt + Guardrails config
│  │  ├─ Map to Bedrock Converse format
│  │  └─ Stream responses as SSE events
│  │
│  └─ Bedrock integration layer
│     ├─ Converse client (configured model from env)
│     ├─ Message mapping (frontend schema ↔ Bedrock schema)
│     ├─ Streaming event emitter
│     ├─ Usage tracking
│     └─ Guardrails middleware
│
└─ Configuration
   ├─ .env: BEDROCK_MODEL_ID, BEDROCK_GUARDRAILS_ID, etc.
   ├─ system-prompts/ directory (future: DB-backed)
   └─ guardrails config (Bedrock console)
```

### Request/Response Schema (Frontend ↔ API)

**Request:** `POST /api/chat`

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, what is Amaysim?"
    }
  ]
}
```

**Response:** SSE stream with newline-delimited JSON events

```
event: chunk
data: {"type":"content_block_start","content_block":{"type":"text"}}

event: chunk
data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hello!"}}

event: chunk
data: {"type":"content_block_delta","delta":{"type":"text_delta","text":" How can I help?"}}

event: message
data: {"type":"message_stop","message":{"role":"assistant","content":"Hello! How can I help?"},"usage":{"inputTokens":10,"outputTokens":12}}
```

**Error Response (also SSE):**

```
event: error
data: {"code":"rate_limit","message":"Too many requests. Try again in 60 seconds."}
```

---

## Phase 1: Core Chat Integration

### Deliverables

1. **Bedrock client initialization** (`src/bedrock/client.ts`)
   - Initialize BedrockRuntime client with configured region and credentials
   - Load model ID from env (default: `amazon.nova-lite-v1:0`)
   - Health check that verifies model access

2. **Message schema mapping** (`src/bedrock/converseMapper.ts`)
   - Convert frontend `{ role, content }` messages to Bedrock Converse format
   - Handle text-only content first; image/document support deferred
   - Map roles: `user` ↔ `user`, `assistant` ↔ `assistant`

3. **System prompt management** (`src/bedrock/systemPrompt.ts`)
   - Load default system prompt from env or file
   - Validate prompt length against Bedrock limits
   - Design for future DB injection (placeholder only)

4. **Bedrock Guardrails integration** (`src/bedrock/guardrails.ts`)
   - Configure Bedrock Guardrails via config (Bedrock console first)
   - Pass guardrailConfig in Converse requests
   - Log and expose guardrail violations in responses

5. **SSE streaming handler** (`src/routes/chat.ts`)
   - `POST /api/chat` endpoint accepting normalized message schema
   - Stream Bedrock Converse responses as SSE events
   - Convert Bedrock streaming events to client events (chunk, message, error)
   - Include usage metrics (input/output tokens)
   - Proper error handling and stream termination

6. **Type definitions** (`packages/shared/src/types/chat.ts`)
   - `ChatRequest`, `ChatMessage`, `ChatResponse`
   - `StreamEvent` union type (content_block_start, content_block_delta, message_stop, error)
   - `Usage` metrics

### File Structure

```
apps/api/src/
├── bedrock/
│  ├── client.ts          (Bedrock Runtime client, health check)
│  ├── converseMapper.ts  (frontend schema → Bedrock Converse)
│  ├── systemPrompt.ts    (system prompt loading, validation)
│  ├── guardrails.ts      (Bedrock Guardrails config + apply)
│  └── types.ts           (internal Bedrock types)
├── routes/
│  └── chat.ts            (POST /api/chat SSE handler)
└── index.ts              (register /api/chat route)

packages/shared/src/
└── types/
   └── chat.ts            (ChatRequest, ChatMessage, StreamEvent, etc.)
```

### Configuration

Add to `.env.example` and `.env` (when available):

```bash
# Bedrock model selection (backend-controlled)
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0

# Bedrock Guardrails
BEDROCK_GUARDRAILS_ID=                  # Leave empty if not using; enable in Phase 1.5
BEDROCK_GUARDRAILS_VERSION=LATEST       # Or specific version

# System prompt
SYSTEM_PROMPT_FILE=./prompts/default.txt
# OR inline (precedence):
SYSTEM_PROMPT="You are Maysi, an Amaysim assistant. Be helpful and concise."

# AWS region (already exists)
AWS_REGION=ap-southeast-2
```

### Dependencies

Ensure installed (check `package.json`):

```json
"dependencies": {
  "@aws-sdk/client-bedrock-runtime": "^3.x",
  "hono": "^4.x"
}
```

---

## Phase 1.5: Bedrock Guardrails Safety

### Deliverables

1. **Guardrails configuration** (Bedrock console)
   - Create a custom Bedrock Guardrails policy via the console
   - Configure policies for:
     - Topic filtering (e.g., block account/billing inquiry redirects)
     - PII detection and redaction
     - Harmful content filtering
   - Capture guardrails ID and version

2. **Guardrails middleware** (in `src/bedrock/guardrails.ts`)
   - Pass guardrailConfig and guardrailVersion to Converse API
   - Log violations (not exposed to client in Phase 1)
   - Design for Phase 2 safety dashboard (future)

### Notes

- Guardrails are **optional** but recommended for safety in production
- Can be toggled via env; leave `BEDROCK_GUARDRAILS_ID` empty to skip
- User-facing content moderation and account-query redirects are Phase 2+

---

## Phase 2: Tool Definitions & Architecture

### Scope

Design (but do not implement) tool use infrastructure to support agent capabilities post-Phase 1.

### Deliverables

1. **Tool schema definition** (`src/bedrock/tools.ts`)
   - Define tool structure matching Bedrock Converse `toolUseBlock` format
   - Plan tool registry (hardcoded or config-based)
   - Example tools (placeholders):
     - `web_search` — invoke external search API
     - `get_customer_info` — query customer data (Amaysim-specific)
     - `check_service_status` — network/service status

2. **Tool execution framework** (`src/tools/executor.ts`) — skeleton only
   - Define `ToolExecutor` interface
   - Placeholder implementations (return mock responses)
   - Design for async tool invocation and re-prompting

3. **Converse loop with tool use** (`src/bedrock/converseWithTools.ts`) — skeleton
   - Detect tool_use blocks in responses
   - Route to executor
   - Re-prompt model with results
   - Design (do not implement loop flow)

### Notes

- No tool invocation until Phase 1 is complete and tested
- Execution order: "Hello LLM" → tool architecture → tool implementation

---

## Phase 3: Streaming & Frontend Integration

### Scope

Ensure frontend can consume SSE streams correctly and render them in real-time.

### Deliverables (frontend, not API)

1. **SSE client hook** (`apps/web/src/hooks/useChat.ts`)
   - Handle EventSource / fetch with streaming
   - Parse newline-delimited JSON events
   - Buffer and reconstruct message content

2. **Streaming UI updates**
   - Render tokens as they arrive
   - Show usage stats on completion
   - Stop button to abort stream

---

## Testing Strategy

### Unit Tests

- **Message mapper**: Frontend schema → Bedrock schema and back
- **System prompt loader**: Valid/invalid cases, missing files
- **Guardrails config**: Correct passthrough to Converse

### Integration Tests

1. **Health check**
   - `npm run check:bedrock` verifies model access
   - Returns model ID, available tokens, region

2. **Chat endpoint**
   - Simple request → response (no tool use)
   - Verify SSE event sequence
   - Verify usage metrics are present

3. **Error cases**
   - Invalid messages format
   - Model not accessible
   - Guardrails violation (if enabled)
   - Timeout / stream interruption

### Manual Testing

```bash
# Start API
npm run dev -w @maysi/api

# In another terminal, test chat endpoint
curl -N -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}' \
  http://localhost:8787/api/chat
```

---

## Execution Checklist

### Phase 1: Core Chat

- [ ] Install `@aws-sdk/client-bedrock-runtime`
- [ ] Create `src/bedrock/client.ts` with BedrockRuntime initialization
- [ ] Create `src/bedrock/converseMapper.ts` for schema mapping
- [ ] Create `src/bedrock/systemPrompt.ts` for prompt loading
- [ ] Create `src/bedrock/guardrails.ts` with Guardrails config (stub if no ID)
- [ ] Add type definitions to `packages/shared/src/types/chat.ts`
- [ ] Create `src/routes/chat.ts` SSE handler
- [ ] Update `.env.example` with Bedrock config
- [ ] Update `src/index.ts` to register `/api/chat` route
- [ ] Test with `npm run check:bedrock`
- [ ] Test chat endpoint manually (curl)
- [ ] Verify Markdown rendering on frontend

### Phase 1.5: Guardrails (optional, can defer)

- [ ] Create Bedrock Guardrails policy (console)
- [ ] Update `.env` with guardrails ID
- [ ] Test guardrails violations

### Phase 2: Tool Architecture

- [ ] Define tool schema and registry
- [ ] Create `ToolExecutor` interface
- [ ] Skeleton `converseWithTools` loop

### Phase 3: Frontend Integration

- [ ] Create streaming SSE client
- [ ] Update chat UI to render tokens
- [ ] Add stop button

---

## Known Unknowns & Future Decisions

1. **Authentication** — no auth in Phase 1; design for per-user rate limiting later
2. **Conversation persistence** — Phase 3; chats stored in IndexedDB on device
3. **User system prompts** — architected but not persisted; await DB schema
4. **Multi-turn state** — maintain message history in request or API session?
5. **Vision/multimodal** — deferred; placeholder in converseMapper
6. **Cost tracking** — usage metrics collected, no billing integration
7. **Model failover** — not architected; pick one model per deployment

---

## Success Criteria

1. **Phase 1 complete**
   - `POST /api/chat` accepts normalized message JSON
   - Streams SSE events in real time
   - Returns assistant message + usage metrics
   - No Bedrock schema leaks to client

2. **Phase 1.5 (optional)**
   - Guardrails violations logged
   - Endpoint remains responsive under guardrails blocks

3. **Phase 2 ready**
   - Tool definitions and interface designed
   - Loop logic documented (not executing)

---

## Dependencies & Links

- [AWS SDK for JavaScript (Bedrock)](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/)
- [Bedrock Converse API](https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html)
- [Bedrock Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html)
- [Amazon Nova Models](https://aws.amazon.com/bedrock/nova/)
- [Hono SSE Streaming](https://hono.dev/docs/helpers/streaming)

---

## Notes

- All configuration is **backend-driven**; frontend has no model selection
- Schema is **provider-neutral**; future LLM swaps won't require frontend changes
- Streaming **must** start in Phase 1; non-streaming chat is insufficient for UX
- Tool use is **architecturally required** but implementation is post-Phase 1
- All prompts should be **configurable**; avoid hardcoding beyond defaults
