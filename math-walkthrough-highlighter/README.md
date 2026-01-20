# Math Walkthrough Highlighter

A web application that helps users understand mathematical workings through AI-powered step-by-step explanations with color-coded highlights.

## Features

- **Paste any math**: Supports plain text, LaTeX, or mixed notation
- **AI-powered explanations**: Uses Claude AI to generate step-by-step walkthroughs
- **Color-coded highlights**: Visual highlighting of different mathematical elements
  - Blue: Given/known values
  - Red: Focus of current step
  - Green: Results/simplified forms
  - Orange: Warnings about common mistakes
- **Multiple explanation styles**:
  - Gentle: More intuition and context
  - Exam Style: Tight and formal
  - Teach Me: Extra detailed steps
- **KaTeX rendering**: Beautiful math rendering with fallback to annotated view
- **Copy to clipboard**: Export steps as Markdown
- **Secure**: All API calls happen server-side

## Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **KaTeX** for math rendering
- **Anthropic Claude API**
- **Zod** for validation

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository and navigate to the project:

```bash
cd math-walkthrough-highlighter
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file with your Anthropic API key:

```bash
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key | - |
| `RATE_LIMIT_MAX_REQUESTS` | No | Max requests per window | 30 |
| `RATE_LIMIT_WINDOW_HOURS` | No | Rate limit window in hours | 1 |

## Project Structure

```
math-walkthrough-highlighter/
├── app/
│   ├── api/
│   │   └── walkthrough/
│   │       └── route.ts      # API endpoint for walkthrough generation
│   ├── globals.css           # Global styles and KaTeX import
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main UI page
├── components/
│   ├── MathRenderer.tsx      # KaTeX + fallback renderer
│   └── Stepper.tsx           # Step navigation component
├── lib/
│   ├── anthropic.ts          # Anthropic API client wrapper
│   ├── rate-limit.ts         # In-memory rate limiter
│   ├── sanitize.ts           # HTML sanitization for highlights
│   └── schema.ts             # TypeScript types and Zod schemas
├── __tests__/
│   └── schema.test.ts        # Validation tests
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## API Reference

### POST /api/walkthrough

Generate a math walkthrough from input text.

**Request Body:**

```json
{
  "inputText": "E[X] = np = 10 * 0.3 = 3",
  "style": "gentle"
}
```

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "steps": [
      {
        "title": "Identify the formula",
        "goal": "Recognize the expected value formula for binomial distribution",
        "expression_raw": "E[X] = np",
        "expression_annotated": "<hl-blue>E[X]</hl-blue> = <hl-red>np</hl-red>",
        "explanation": "The expected value of a binomial random variable is n times p.",
        "checkpoint": "Units match: count × probability = count",
        "common_pitfall": "Don't confuse E[X] with Var(X)"
      }
    ],
    "summary": "Calculated expected value using binomial formula",
    "assumptions": ["X follows a binomial distribution"]
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMITED"
}
```

## Highlight Tags

The system uses four highlight tags for annotation:

| Tag | Color | Meaning |
|-----|-------|---------|
| `<hl-blue>...</hl-blue>` | Blue | Given/known values |
| `<hl-red>...</hl-red>` | Red | Focus of current step |
| `<hl-green>...</hl-green>` | Green | Result/simplified form |
| `<hl-orange>...</hl-orange>` | Orange | Warning/common mistake |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add `ANTHROPIC_API_KEY` to environment variables
4. Deploy

### Other Platforms

Build the production version:

```bash
npm run build
npm start
```

## Security

- API keys are never exposed to the client
- All LLM calls happen server-side
- Input size limited to 15,000 characters
- Rate limiting (30 requests/hour/IP by default)
- HTML sanitization for highlight markup

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## License

MIT
