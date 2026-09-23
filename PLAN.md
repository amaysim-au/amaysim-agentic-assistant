# Maysi Prototype – Build Plan

## Wireframe review

| #   | Screen              | Key behaviour                                                                                | Build notes                                                   |
| --- | ------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | App home            | "Chat with Maysi (BETA)" card                                                                | Mock amaysim home. The card is the entry point to Maysi.      |
| 2   | Search with toggle  | Switches between the Chatbot and Maysi                                                       | Segmented toggle. Maysi mode sends the query into a new chat. |
| 3   | Welcome             | Lists features, "Start chatting" button                                                      | Show only the first time (keep a flag).                       |
| 4   | Disclosure          | Separate from the account, general-purpose, AWS                                              | Modal. Save that the user accepted before chat is allowed.    |
| 5   | Chat                | Greeting, suggestion chips, composer (+ and mic), disclaimer                                 | Stream responses, render Markdown.                            |
| 6   | Web search          | "Searched the web" badge, rich answer with image                                             | A tool the model calls, with source cards and images.         |
| 7   | Menu                | New chat, search, voice, web search and incognito toggles, import and export, settings, help | Drawer. The toggles change what each request sends.           |
| 8   | History             | Search, grouped by Today and Previous 7 days                                                 | Stored on the device. Search across titles and content.       |
| 9   | Voice               | Listening animation, pause, end, switch to keyboard                                          | Streaming speech to speech.                                   |
| 10  | File or image input | Image in, structured "process map" out                                                       | Multimodal input plus a custom block that renders diagrams.   |
| 11  | Incognito           | Chat isn't saved, "End temporary chat"                                                       | Skip saving entirely. Visually distinct state.                |
| 12  | Export              | JSON or Markdown, downloads to the device                                                    | Generate on the device and download.                          |

### Gaps in the wireframes to settle

- **Missing screens:** Settings, Help & feedback, and the Import flow aren't drawn.
- **Missing states:** empty, loading or streaming, error, offline, rate-limited, and permission denied (mic and camera).
- **Missing chat actions:** copy, regenerate, thumbs up or down, delete or rename a chat, and stopping a response mid-way.
- **Data location:** where history lives. "Separate from your account" and "downloaded to this device" suggest keeping it on the device only. That's also simpler.
- **Screen 10:** the "process map" needs a rule for structured output, such as the model returning a diagram schema.
- **Safety:** content moderation, what to do when the model is asked about amaysim account questions (send them to the existing chatbot), and PII handling.

## Recommended prototype stack

- **Frontend:** React, Vite, TypeScript and Tailwind, built as a mobile-first installable web app shown in a phone frame on desktop. This is quicker to iterate on than native, and can be moved to React Native or Expo later.
- **Backend:** a small TypeScript service (Hono or Fastify) that streams responses to the app.
- **LLM:** Amazon Bedrock Converse API with streaming. Use Claude or Nova, which handle images and documents natively.
- **Web search:** model tool use backed by a search API (Tavily or Brave).
- **Voice:** Amazon Nova Sonic, which streams speech to speech in both directions. For a quick demo, the browser's Web Speech API can stand in.
- **Safety:** Bedrock Guardrails for topics, PII and harmful content, plus a system prompt that keeps it away from account questions.
- **Storage:** IndexedDB on the device (via Dexie) for chats. Nothing is stored on the server.
- **Deploy:** App Runner or Lambda for the backend, S3 and CloudFront for the frontend.

## Build phases

### Phase 0 – Setup

- [x] Monorepo with `apps/web` and `apps/api`, lint, format and environment config.
- [ ] AWS credentials and Bedrock model access (verify with `npm run check:bedrock` once `.env` is filled in).

### Phase 1 – UI shell (all static, with mock data)

- [x] Design tokens (amaysim orange, type, spacing), a phone frame, and routing.
- [x] Screens 1–4 and 7, plus empty states for 5, 8, 11 and 12.

### Phase 2 – Core chat

- [ ] `/chat` endpoint that streams from Bedrock over server-sent events (SSE).
- [ ] Streaming message list, Markdown rendering, suggestion chips, a stop button, and a disclaimer footer.
- [ ] System prompt and Guardrails.

### Phase 3 – History, incognito, export

- [ ] Chat store in IndexedDB, auto-titled chats, the history list grouped by date, search, delete and rename.
- [ ] Incognito mode keeps chats in memory only (screen 11).
- [ ] Export to JSON or Markdown and import JSON (screen 12).

### Phase 4 – Web search

- [ ] `web_search` tool with a request, search, answer loop.
- [ ] "Searched the web" status, source links, and image cards (screen 6).
- [ ] Controlled by the menu toggle.

### Phase 5 – Files and images

- [ ] The "+" button opens a picker or camera. Resize images on the device and support PDFs.
- [ ] Send them to the model as image or document blocks.
- [ ] A structured `process_map` block the model can return, drawn as a flow component (screen 10).

### Phase 6 – Voice mode

- [ ] A WebSocket relay between the backend and Nova Sonic.
- [ ] Mic capture, an animated waveform, pause, end, and switch to keyboard (screen 9).
- [ ] Save voice transcripts into the chat.

### Phase 7 – Polish and demo

- [ ] Error, offline and permission states. Accessibility (focus, ARIA, contrast). Settings and Help stubs. Feedback thumbs.
- [ ] Rate limiting on the backend. Basic tests (unit plus a Playwright happy path). Deploy a shareable URL.

## Proposed structure

```
apps/
  web/   src/{screens,components,features/{chat,history,voice,export},store,lib}
  api/   src/{routes/{chat,voice},tools/{webSearch},bedrock,guardrails}
packages/
  shared/  (message and export types, plus a schema for the process map)
```

## Decisions to confirm

1. **Platform:** a web app (recommended) or React Native/Expo?
2. **Where history is kept:** on the device only (recommended), or synced through a backend?
3. **Model and region:** which Bedrock model (for example Claude Sonnet or Nova Pro), and whether data must stay in `ap-southeast-2`?
4. **Search provider:** Tavily, Brave, or something else?
5. **Scope:** should voice be in the first cut, or come after the core chat?
