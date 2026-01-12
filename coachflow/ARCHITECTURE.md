# CoachFlow Architecture

## System Overview

CoachFlow is a full-stack Next.js application that uses Claude AI to generate personalized daily actions for life coaches. The system is designed to be simple, focused, and emotionally intelligent.

## Core Architecture Principles

1. **Simplicity First**: MVP with minimal dependencies
2. **Single Database**: SQLite for all persistence
3. **Stateless API**: Each request is independent
4. **Agent-Centric**: Claude is the intelligence layer
5. **Feedback Loop**: System learns from user behavior

## Component Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Frontend                  │
│  (Landing, Onboarding, Dashboard)                   │
└───────────────────┬─────────────────────────────────┘
                    │ HTTP/JSON
┌───────────────────┴─────────────────────────────────┐
│               Next.js API Routes                    │
│  (/api/coach, /api/actions, /api/agent)             │
└─────┬──────────────────────────────────┬────────────┘
      │                                  │
      │ Database Ops                     │ AI Calls
      ▼                                  ▼
┌──────────────┐                  ┌──────────────┐
│   SQLite     │                  │   Claude     │
│   Database   │                  │     API      │
└──────────────┘                  └──────────────┘
```

## Data Flow

### 1. Onboarding Flow
```
User fills form → POST /api/coach/create → Create coach record
→ Log onboarding interaction → Return coach ID → Store in localStorage
→ Redirect to dashboard
```

### 2. Daily Action Generation Flow
```
User clicks "Generate" → POST /api/agent/generate → Get coach + history
→ Build context prompt → Call Claude API → Parse JSON response
→ Create action records → Return to frontend → Display actions
```

### 3. Action Feedback Flow
```
User marks "Done/Avoided" → PATCH /api/actions/[id]/status
→ Update action status → Update coach stats → Update streak
→ Log interaction → Return updated action → Refresh UI
```

### 4. Rewrite Flow
```
User clicks "Rewrite" → POST /api/actions/[id]/rewrite
→ Get action + coach → Build rewrite prompt → Call Claude API
→ Parse response → Increment rewrite count → Log interaction
→ Return rewritten action → Show in alert
```

## Database Design

### Why SQLite?
- **Serverless**: No separate database server
- **Simple**: Single file, easy backup
- **Fast**: Perfect for < 10k users
- **Portable**: Easy to migrate to Postgres later

### Schema Decisions

**coaches table**
- Stores all coach profile data
- `trial_days_remaining` calculated on fetch
- `current_streak` updated on completion
- Stats (`completed_count`, `avoided_count`) for agent context

**daily_actions table**
- One record per action
- `date` field for daily grouping
- `status` tracks lifecycle
- `rewrite_count` for pattern detection
- Foreign key to coaches with CASCADE delete

**agent_interactions table**
- Audit log of all AI interactions
- Used for future analysis and improvements
- Stores context as JSON for flexibility

### Indexes
- `coaches(email)` - Fast lookup by email
- `daily_actions(coach_id, date)` - Fast daily action queries
- `daily_actions(status)` - Fast filtering by status
- `agent_interactions(coach_id)` - Fast interaction history

## Agent Intelligence

### System Prompt Structure
The agent has a detailed system prompt that defines:
- Role and purpose
- Core principles (safety, progress, patterns)
- Difficulty levels and adaptation rules
- Tone guidelines
- Output format (strict JSON)

### Context Building
For each action generation, we provide:
- Coach profile (niche, offer, fears)
- Recent action history (last 10 actions)
- Today's actions (if any)
- Stats (streak, completed, avoided)
- Special flags (avoidance patterns, streak bonuses)

### JSON Output Format
```json
{
  "actions": [
    {
      "title": "string",
      "description": "string",
      "draft_text": "string (optional)",
      "difficulty": 1-3
    }
  ],
  "tone": "gentle | neutral | encouraging",
  "reasoning": "string"
}
```

### Adaptation Logic
The agent adjusts based on:
- **Avoidance count**: Lower difficulty if high
- **Streak**: Gradually increase difficulty
- **Rewrite requests**: Simplify and specify
- **Completion rate**: Maintain or increase

## Frontend Architecture

### Tech Choices
- **Client Components**: All pages use 'use client' for interactivity
- **Local Storage**: Stores coach ID (temporary auth)
- **Tailwind CSS**: Utility-first styling
- **No State Management**: Simple useState hooks

### Component Structure

**Shared Components**
- `ActionCard`: Displays single action with interactions
- `StatsCard`: Displays single stat metric

**Pages**
- `/` (Landing): Marketing and education
- `/onboarding`: Multi-field form
- `/dashboard`: Main app experience

### State Management
- **Dashboard**: Manages coach, actions, loading, error states
- **Action Updates**: Optimistic UI with server confirmation
- **Error Handling**: Simple error messages, no retry logic

## API Design

### REST Principles
- Clear resource naming
- Proper HTTP methods (GET, POST, PATCH)
- Standard status codes
- Consistent JSON responses

### Response Format
All endpoints return:
```typescript
{
  success: boolean;
  data?: any;
  error?: string;
}
```

### Error Handling
- 400: Bad request (missing params)
- 404: Resource not found
- 403: Forbidden (trial ended)
- 409: Conflict (duplicate email)
- 500: Server error

## Security Considerations

### Current (MVP) Security
- ⚠️ No authentication (uses localStorage)
- ⚠️ No rate limiting
- ⚠️ No input sanitization
- ⚠️ API key in environment only

### Production Requirements
- ✅ Add NextAuth.js for proper auth
- ✅ Add rate limiting (upstash/redis)
- ✅ Add input validation (zod)
- ✅ Add CORS configuration
- ✅ Add security headers
- ✅ Use edge runtime for API routes
- ✅ Add request signing
- ✅ Add database backups

## Scalability Considerations

### Current Limits
- SQLite: ~10k users comfortably
- No caching layer
- Synchronous API calls
- Single server

### When to Scale
When you hit:
- 5k+ active users → Move to Postgres
- High latency → Add Redis cache
- Global users → Deploy to edge
- High costs → Implement rate limits

### Migration Path
1. SQLite → PostgreSQL (schema compatible)
2. Add connection pooling (PgBouncer)
3. Add Redis for sessions and cache
4. Move to Vercel Edge Functions
5. Add CDN for static assets

## Development Workflow

### Local Development
```bash
npm run dev          # Start dev server
npm run db:setup     # Reset database
npm run build        # Build for production
```

### Database Changes
1. Modify `scripts/setup-db.js`
2. Run `npm run db:setup`
3. Update types in `src/lib/types.ts`
4. Update queries in `src/lib/db.ts`

### Adding Features
1. Update types if needed
2. Add database functions
3. Create API route
4. Update frontend components
5. Test manually

## Testing Strategy

### MVP Testing (Current)
- Manual testing only
- Test each user flow
- Check edge cases (trial end, errors)

### Production Testing (Future)
- Unit tests: Database functions
- Integration tests: API routes
- E2E tests: Full user flows (Playwright)
- Load tests: Claude API limits

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy (automatic)

### Important Notes
- SQLite works on Vercel (filesystem)
- Database resets on each deploy
- Use Vercel Postgres for persistence
- Or mount persistent volume

### Environment Variables
Set in Vercel dashboard:
- `ANTHROPIC_API_KEY`
- `FREE_TRIAL_DAYS`

## Cost Analysis

### MVP Costs
- **Hosting**: Free (Vercel hobby)
- **Database**: Free (SQLite)
- **Claude API**: ~$0.003 per request
  - 1000 users × 1 gen/day × 30 days = ~$90/month
- **Total**: ~$90/month at 1k users

### Revenue Model
- Free: 7 days trial
- Paid: $29/month per coach
- Break-even: ~3 paying users

## Monitoring & Observability

### Current (MVP)
- Console logs only
- No error tracking
- No analytics

### Production Needs
- Error tracking: Sentry
- Analytics: PostHog or Plausible
- Logs: Vercel logs or Axiom
- API monitoring: Claude API dashboard
- Database monitoring: Custom scripts

## Future Enhancements

### Phase 2 (Post-MVP)
- ✅ Email notifications (Resend)
- ✅ Payment processing (Stripe)
- ✅ Weekly summaries
- ✅ Mobile app (React Native)

### Phase 3 (Growth)
- ✅ Team accounts
- ✅ Coach communities
- ✅ Integrations (Calendly, Zoom)
- ✅ Advanced analytics

### Phase 4 (Scale)
- ✅ White-label solution
- ✅ API for third parties
- ✅ Marketplace for coaches

## Key Design Decisions

### Why Next.js App Router?
- Server and client in one framework
- API routes built-in
- Easy deployment (Vercel)
- Modern React patterns

### Why No Auth in MVP?
- Faster to build and test
- Good enough for prototype
- Easy to add later with NextAuth.js

### Why SQLite Instead of Postgres?
- Zero configuration
- Perfect for MVP scale
- Easy to migrate later
- Single file backup

### Why Client Components?
- Interactive dashboard needs state
- localStorage access required
- Simpler than server/client mix for MVP

### Why No Real-time Updates?
- Not needed for daily cadence
- Keeps architecture simple
- Can add WebSockets later if needed

## Performance Optimization

### Current Performance
- Page load: ~500ms
- Action generation: ~2-3s (Claude API)
- Database queries: <10ms

### Optimization Opportunities
1. Cache coach data (Redis)
2. Prefetch dashboard data
3. Optimize Claude prompts (fewer tokens)
4. Add loading skeletons
5. Implement optimistic UI
6. Use React.lazy for code splitting

## Conclusion

CoachFlow's architecture prioritizes:
1. **Speed to market**: Simple, working MVP
2. **Learning**: Quick feedback loops
3. **Flexibility**: Easy to modify and extend
4. **Cost efficiency**: Minimal infrastructure

The system is designed to validate the concept quickly while maintaining a clear path to scale when needed.
