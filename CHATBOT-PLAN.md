# Pine Valley AI Chatbot Implementation Plan

**Goal:** Build an AI-powered guest concierge chatbot to help visitors with questions about Pine Valley, nearby attractions, and booking.

## Tech Stack Decision

**Vercel AI SDK** - Perfect fit because:
- Built specifically for Next.js
- Unified API for multiple LLM providers (OpenAI, Anthropic, etc.)
- Built-in streaming support
- Framework-agnostic hooks for chat UI
- Active development & great docs

## Core Features

### Phase 1: Basic Chatbot (Week 1)
- [ ] Install Vercel AI SDK + dependencies
- [ ] Create API route for chat completions
- [ ] Build floating chat widget UI
  - Bottom-right corner bubble
  - Expandable chat window
  - Message history
  - Typing indicators
- [ ] Knowledge base about Pine Valley:
  - Units (Airstream, Cozy Cottage, etc.)
  - Amenities (what's included, what to bring)
  - Check-in/check-out procedures
  - House rules & policies
  - Pricing information

### Phase 2: Local Area Knowledge (Week 1-2)
- [ ] Nearby floating outfitters:
  - Distances from property
  - Operating seasons
  - Contact info
- [ ] Dillard Mill State Historic Site info
- [ ] Local trails, restaurants, attractions
- [ ] Driving directions & tips

### Phase 3: Booking Integration (Week 2)
- [ ] Check availability (query existing booking system)
- [ ] Answer pricing questions
- [ ] Guide users to booking flow
- [ ] Handle common booking questions

### Phase 4: Polish & Analytics (Ongoing)
- [ ] Conversation analytics
- [ ] Improve responses based on common questions
- [ ] Add fallback to "contact us" for complex queries
- [ ] Mobile-responsive design

## Implementation Steps

### 1. Install Dependencies
```bash
npm install ai @ai-sdk/openai
# or use anthropic: npm install ai @ai-sdk/anthropic
```

### 2. Create API Route
`src/app/api/chat/route.ts`
- Uses AI SDK's streaming responses
- Injects system prompt with Pine Valley knowledge
- Rate limiting to prevent abuse

### 3. Build Chat Component
`src/components/chat/ChatWidget.tsx`
- Floating bubble (closed state)
- Expandable window (open state)
- Message list with user/assistant roles
- Input field with send button
- Framer Motion animations (already in dependencies!)

### 4. Knowledge Base
Create `src/lib/chatbot/knowledge.ts`:
- Property details (from Sanity CMS)
- Local area information
- Common FAQs
- Booking policies

### 5. System Prompt Engineering
Craft a system prompt that makes the bot:
- Friendly, helpful, conversational
- Knowledgeable about Missouri Ozarks
- Focused on converting visitors → bookings
- Honest when it doesn't know something

## Model Choice

**Recommendation:** Start with `gpt-4o-mini` (OpenAI)
- Cost-effective ($0.15/1M input tokens)
- Fast responses
- Good for conversational use
- Can upgrade to `gpt-4o` or `claude-sonnet-4.5` if needed

## Cost Estimate
Assuming 100 conversations/day, avg 10 messages each, ~500 tokens per message:
- Monthly: ~15M tokens = $2.25/month (gpt-4o-mini)
- Very affordable for the conversion value

## Success Metrics
- Conversations started / page views
- Common questions identified
- Bookings attributed to chatbot assistance
- User feedback/ratings

## Files to Create
1. `src/app/api/chat/route.ts` - API endpoint
2. `src/components/chat/ChatWidget.tsx` - Main UI
3. `src/components/chat/ChatBubble.tsx` - Closed state button
4. `src/components/chat/ChatWindow.tsx` - Expanded chat
5. `src/components/chat/Message.tsx` - Individual message
6. `src/lib/chatbot/knowledge.ts` - Knowledge base
7. `src/lib/chatbot/prompts.ts` - System prompts

## Next Actions
- [x] Research Vercel AI SDK
- [x] Create implementation plan
- [ ] Install dependencies
- [ ] Build basic API route
- [ ] Create chat UI components
- [ ] Test with sample conversations
