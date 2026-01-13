import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JournalSpace - Your Private Digital Journal",
  description:
    "A calm, private space for daily reflection. Write one sentence or one page. Your thoughts, your privacy, your journey.",
  keywords: ["journal", "diary", "reflection", "mindfulness", "privacy", "personal growth"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-warm-50 text-sage-900">{children}</body>
    </html>
  );
}
