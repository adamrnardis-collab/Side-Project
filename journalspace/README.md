# JournalSpace

A modern, minimalist landing page for a personal journaling app that emphasizes privacy, simplicity, and daily reflection.

## Features

- **Privacy-First**: End-to-end encryption, zero-knowledge architecture, and local-first storage
- **Daily Prompts**: Thoughtful prompts to spark reflection
- **Story Timeline**: Browse past entries like chapters of a book
- **Progress Insights**: Track journaling streaks and writing habits
- **Gratitude Practice**: Built-in prompts for cultivating appreciation

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
journalspace/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout with metadata
│   │   ├── page.tsx        # Landing page
│   │   └── globals.css     # Global styles and Tailwind
│   └── components/
│       ├── Header.tsx      # Navigation header
│       ├── Hero.tsx        # Hero section with CTA
│       ├── Features.tsx    # Features grid
│       ├── Privacy.tsx     # Privacy section
│       ├── Benefits.tsx    # Benefits and testimonials
│       ├── Newsletter.tsx  # Email signup form
│       └── Footer.tsx      # Footer with links
├── public/                 # Static assets
├── tailwind.config.ts      # Tailwind configuration
└── package.json            # Dependencies
```

## Design System

### Colors

- **Sage**: Primary brand color palette (green tones)
- **Warm**: Secondary warm tones for backgrounds

### Typography

- Font: Inter (clean sans-serif)
- Proper heading hierarchy (h1, h2, h3)

### Accessibility

- Semantic HTML structure
- WCAG-compliant color contrast
- Focus states for interactive elements
- Screen reader friendly navigation
- Proper form labels

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
