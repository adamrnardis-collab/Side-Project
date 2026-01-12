# CoachFlow - AI-Powered Daily Actions for Life Coaches

A focused micro-SaaS MVP that helps new life coaches take consistent, confidence-safe daily actions to grow their business using Claude AI.

## Purpose

CoachFlow is an AI agent (NOT a content generator or marketing guru) that acts as a calm, grounded coach operations partner. It generates 1-3 small, emotionally safe actions every day tailored to each coach's niche, audience, and comfort level.

## Tech Stack

- **Frontend & Backend**: Next.js 15 (App Router)
- **Database**: SQLite with better-sqlite3
- **AI**: Claude API (Anthropic)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Features

### 1. Coach Onboarding
- Collects: niche, offer type, price range, audience size, biggest growth fear
- Creates personalized coach profile
- 7-day free trial (no credit card)

### 2. Daily AI-Generated Actions
- 1-3 actions per day based on coach context
- Each action includes:
  - Clear title and description
  - Why it matters
  - Optional pre-drafted text (messages, posts)
  - Difficulty level (1-3)

### 3. User Feedback Loop
- **Done**: Marks complete, updates streak
- **Avoided**: Signals difficulty, agent adapts
- **Rewrite**: Gets simpler version of action

### 4. Adaptive Intelligence
- Tracks avoidance patterns
- Adjusts difficulty based on behavior
- Maintains calm, supportive tone
- No hype, urgency, or shame

### 5. Simple Dashboard
- Today's actions
- Current streak count
- Completion stats
- Avoidance pattern insights
- Trial days remaining

## Project Structure

```
coachflow/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── coach/
│   │   │   │   ├── create/route.ts       # Create new coach
│   │   │   │   └── [id]/route.ts         # Get coach by ID
│   │   │   ├── actions/
│   │   │   │   ├── today/route.ts        # Get today's actions
│   │   │   │   └── [id]/
│   │   │   │       ├── status/route.ts   # Update action status
│   │   │   │       └── rewrite/route.ts  # Request action rewrite
│   │   │   └── agent/
│   │   │       └── generate/route.ts     # Generate daily actions
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Main dashboard
│   │   ├── onboarding/
│   │   │   └── page.tsx                  # Onboarding form
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Landing page
│   │   └── globals.css                   # Global styles
│   ├── components/
│   │   ├── ActionCard.tsx                # Action display component
│   │   └── StatsCard.tsx                 # Stats display component
│   └── lib/
│       ├── db.ts                         # Database operations
│       ├── agent.ts                      # Claude AI integration
│       ├── agent-prompt.ts               # System prompts
│       └── types.ts                      # TypeScript types
├── scripts/
│   └── setup-db.js                       # Database setup script
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── .env.local.example
```

## Database Schema

### coaches
- `id`: UUID primary key
- `email`: Unique coach email
- `created_at`: Registration timestamp
- `trial_start_date`: Trial start timestamp
- `trial_days_remaining`: Days left in trial
- `niche`: Coaching niche
- `offer_type`: Type of offer (1-on-1, group, etc.)
- `price_range`: Price range
- `audience_size`: Current audience size
- `biggest_fear`: Biggest business growth fear
- `current_streak`: Consecutive days streak
- `last_action_date`: Last action completion
- `avoided_count`: Total avoided actions
- `completed_count`: Total completed actions

### daily_actions
- `id`: UUID primary key
- `coach_id`: Foreign key to coaches
- `created_at`: Creation timestamp
- `date`: Action date (YYYY-MM-DD)
- `title`: Action title
- `description`: Action description
- `draft_text`: Optional pre-written draft
- `difficulty`: 1 (gentle), 2 (moderate), 3 (stretch)
- `status`: 'pending' | 'completed' | 'avoided'
- `completed_at`: Completion timestamp
- `avoided_at`: Avoidance timestamp
- `rewrite_count`: Number of rewrites requested

### agent_interactions
- `id`: UUID primary key
- `coach_id`: Foreign key to coaches
- `action_id`: Optional foreign key to daily_actions
- `interaction_type`: 'completed' | 'avoided' | 'rewrite_requested' | 'onboarding'
- `context`: JSON context data
- `created_at`: Interaction timestamp

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Claude API key from Anthropic

### Installation Steps

1. **Clone or navigate to the project**
   ```bash
   cd coachflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your Claude API key:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   FREE_TRIAL_DAYS=7
   ```

4. **Initialize the database**
   ```bash
   npm run db:setup
   ```

   This creates `coachflow.db` in the project root with all tables and indexes.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

### Building for Production

```bash
npm run build
npm start
```

## Usage Flow

1. **Landing Page** (`/`)
   - Learn about CoachFlow
   - Click "Start 7-Day Free Trial"

2. **Onboarding** (`/onboarding`)
   - Fill out coach profile
   - Creates account and redirects to dashboard

3. **Dashboard** (`/dashboard`)
   - Generate today's actions (button appears if none exist)
   - Review actions with difficulty levels
   - Mark as Done, Avoided, or request Rewrite
   - Track streak and stats

4. **Daily Cycle**
   - Actions are date-specific
   - New actions can be generated each day
   - Agent learns from feedback and adapts

## Agent Behavior

The Claude agent follows these principles:

### Core Values
- **Safety First**: Never overwhelm the coach
- **Progress Over Perfection**: Small steps matter
- **Pattern Recognition**: Notices and responds to avoidance
- **Genuine Support**: Calm, grounded encouragement
- **Practical Focus**: Every action is concrete and achievable

### Difficulty Levels
- **Level 1 (Gentle)**: Low risk, high safety (draft messages, review offers)
- **Level 2 (Moderate)**: Public but safe (post content, reach out)
- **Level 3 (Stretch)**: Pushes comfort zone (go live, ask for testimonials)

### Adaptation Rules
- Avoids 2+ level 3 actions → drops to level 1-2
- Avoids 3+ level 2 actions → drops to level 1 only
- Completes 5+ in a row → gradually increases difficulty
- Requests rewrite → makes it simpler and more specific

### Tone Selection
- **Gentle**: New coaches or showing avoidance
- **Neutral**: Steady progress, no special patterns
- **Encouraging**: On a streak or completing difficult actions

## API Endpoints

### Coach Endpoints
- `POST /api/coach/create` - Create new coach
- `GET /api/coach/[id]` - Get coach profile

### Action Endpoints
- `GET /api/actions/today?coachId=xxx` - Get today's actions
- `PATCH /api/actions/[id]/status` - Update action status
- `POST /api/actions/[id]/rewrite` - Request action rewrite

### Agent Endpoints
- `POST /api/agent/generate` - Generate daily actions

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Claude API key from Anthropic | Required |
| `FREE_TRIAL_DAYS` | Number of trial days | 7 |

## Trial Limitations

- Free users get 7 days from registration
- After trial ends:
  - Can view dashboard
  - Cannot generate new actions
  - Cannot request rewrites
- Trial countdown updates on coach data fetch

## Future Enhancements (Not in MVP)

- Email notifications for daily actions
- Payment integration for subscription
- Weekly progress summaries
- Community features
- Mobile app
- Integration with coaching platforms

## Development Notes

### Why SQLite?
- Simple, serverless database
- Perfect for MVP
- Single file (coachflow.db)
- Easy to backup and migrate

### Why No Authentication?
- MVP uses localStorage for coach ID
- Sufficient for prototype
- Add proper auth (NextAuth.js) before production

### Why No Email Service?
- Keeps MVP simple
- In-app notifications only
- Add Resend/SendGrid later if needed

## Troubleshooting

### Database not found
```bash
npm run db:setup
```

### Claude API errors
- Check your API key in `.env.local`
- Verify API key has credits
- Check console for detailed errors

### Actions not generating
- Check browser console for errors
- Verify trial hasn't ended
- Check Claude API key validity

## License

MIT License - feel free to use for your own projects

## Support

This is an MVP/prototype. For production use, consider adding:
- Proper authentication
- Database migrations
- Error monitoring
- Rate limiting
- Input validation/sanitization
- CORS configuration
- Security headers
