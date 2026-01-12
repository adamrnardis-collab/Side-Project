# 🚀 Quick Start Guide

Follow these steps to get CoachFlow running:

## Step 1: Install Dependencies

```bash
cd /home/user/Side-Project/coachflow
npm install
```

This will install Next.js, Claude SDK, SQLite, and all other dependencies.

## Step 2: Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your Claude API key:

```bash
# Get your API key from: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
FREE_TRIAL_DAYS=7
```

## Step 3: Initialize the Database

```bash
npm run db:setup
```

This creates the SQLite database with all tables and indexes.

## Step 4: Run the Development Server

```bash
npm run dev
```

The app will start on **http://localhost:3000**

## Step 5: Test the Flow

1. Visit http://localhost:3000 (landing page)
2. Click "Start 7-Day Free Trial"
3. Fill out the onboarding form
4. View your dashboard
5. Click "Generate Today's Actions"
6. Interact with actions (Done/Avoided/Rewrite)

## Troubleshooting

### Error: Database not found
**Solution:** Run `npm run db:setup`

### Error: Claude API error
**Solution:** Check your API key in `.env.local` and verify it has credits

### Error: Module not found
**Solution:** Run `npm install` again

### Port already in use
**Solution:** Use a different port: `npm run dev -- -p 3001`

## Production Build

To test the production build:

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push code to GitHub (already done!)
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables:
   - `ANTHROPIC_API_KEY`
   - `FREE_TRIAL_DAYS=7`
5. Deploy!

## File Checklist

All required files are present:
- ✅ package.json
- ✅ tsconfig.json
- ✅ next.config.ts
- ✅ tailwind.config.ts
- ✅ All API routes (6 routes)
- ✅ All pages (3 pages)
- ✅ All components (2 components)
- ✅ Database setup script
- ✅ Environment example

## Next Steps

Once the app is running:
1. Test the full onboarding flow
2. Generate daily actions
3. Test all three action responses
4. Check streak tracking
5. Test trial countdown

Need help? Check README.md for full documentation!
