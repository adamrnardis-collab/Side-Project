import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Math Walkthrough Highlighter',
  description: 'Get step-by-step AI explanations of your mathematical workings with color-coded highlights',
  keywords: ['math', 'mathematics', 'tutor', 'AI', 'walkthrough', 'explanation', 'LaTeX', 'KaTeX'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
