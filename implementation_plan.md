# Cyberclone MVP — Implementation Plan

## Context
Building a social media platform where users create AI-powered "cyberclones" of themselves using Claude. Other users can interact with clones in incognito, private, or public mode.

## Tech Stack
- **Framework**: Next.js 14 (App Router + Server Actions)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js (email/password + Google OAuth)
- **AI**: Anthropic Claude API (claude-sonnet-4-6 default, user-selectable)
- **Storage**: Vercel Blob (document uploads)
- **Styling**: Tailwind CSS + shadcn/ui

---

## Database Schema (Prisma)

```
User          - id, email, name, image, username, createdAt
Cyberclone    - id, userId, name, bio, systemPrompt, model, isPublic, createdAt
Document      - id, cybercloneId, filename, blobUrl, textContent, createdAt
Conversation  - id, cybercloneId, visitorId (nullable), mode (INCOGNITO/PRIVATE/PUBLIC), createdAt
Message       - id, conversationId, role (USER/ASSISTANT), content, createdAt
```

---

## Pages & Routes

| Route | Description |
|---|---|
| `/` | Landing — discover public cyberclones |
| `/sign-in`, `/sign-up` | Auth pages |
| `/dashboard` | Manage your cyberclone + view conversations |
| `/[username]` | Public profile + chat with a clone |
| `/[username]/conversations` | Browse public conversations |

---

## Implementation Steps

### 1. Project Scaffold
- `npx create-next-app@latest` with TypeScript, Tailwind, App Router
- Install: `prisma`, `@prisma/client`, `next-auth`, `@anthropic-ai/sdk`, `@vercel/blob`, `shadcn/ui`, `zod`
- Set up `.env.local` with DB, NextAuth, Anthropic key placeholders

### 2. Database & Prisma
- Write `schema.prisma` with all models above
- Run `prisma migrate dev --name init`
- Generate Prisma client

### 3. Authentication (NextAuth.js)
- `app/api/auth/[...nextauth]/route.ts`
- Credentials provider (email + bcrypt password)
- Google OAuth provider
- Session strategy: JWT
- Middleware to protect `/dashboard` and API routes

### 4. Cyberclone CRUD
- Server actions in `app/actions/clone.ts`
- Create / update / delete clone (owner only)
- Form: name, bio, system prompt, model selector (claude-opus-4-7 / claude-sonnet-4-6 / claude-haiku-4-5)

### 5. Document Upload
- Upload page in dashboard uses `@vercel/blob` put()
- On upload: extract text with `pdf-parse` (PDFs) or read raw text
- Store `textContent` in Document record
- Max 5 docs, 10MB each

### 6. Chat Interface
- Route: `/[username]` renders clone profile + chat UI
- Conversation created on first message with selected mode
- Mode selector: Public / Private / Incognito
  - Incognito: no `visitorId` stored
  - Private: `visitorId` stored, hidden from public queries
  - Public: visible to all
- `POST /api/chat` streams Claude response using Anthropic SDK streaming
- System prompt = clone's systemPrompt + prepended document text chunks

### 7. Landing Page & Clone Discovery
- Grid of public cyberclones with name, bio, recent activity

### 8. Dashboard
- View/edit own cyberclone
- List incoming conversations (private + public, not incognito)

---

## AI Integration Detail

```
System prompt construction:
1. Clone's custom systemPrompt
2. If documents exist: append "Context from uploaded documents:\n---\n{doc text}"
3. Pass conversation history as messages array
4. Stream response back to client via ReadableStream
```

Model options exposed to user:
- `claude-opus-4-7` — Most capable
- `claude-sonnet-4-6` — Balanced (default)
- `claude-haiku-4-5-20251001` — Fastest

---

## File Structure

```
cyberclone/
├── app/
│   ├── (auth)/sign-in/page.tsx
│   ├── (auth)/sign-up/page.tsx
│   ├── dashboard/page.tsx
│   ├── [username]/page.tsx
│   ├── [username]/conversations/page.tsx
│   ├── api/auth/[...nextauth]/route.ts
│   ├── api/chat/route.ts
│   ├── api/upload/route.ts
│   └── layout.tsx
├── components/
│   ├── ChatInterface.tsx
│   ├── CloneCard.tsx
│   ├── CloneEditor.tsx
│   └── ModeSelector.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── anthropic.ts
├── actions/
│   ├── clone.ts
│   └── conversation.ts
└── prisma/schema.prisma
```

---

## Verification
1. `npm run dev` — server starts without errors
2. Sign up → create clone → upload doc → chat with it
3. Test all 3 conversation modes (public/private/incognito)
4. Visit `/[username]` as a different user to verify public interactions work
5. Confirm incognito conversations don't appear in dashboard
