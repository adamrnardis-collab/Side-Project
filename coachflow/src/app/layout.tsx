import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoachFlow - Daily Actions for Life Coaches",
  description: "AI agent that helps life coaches take consistent, confidence-safe daily actions to grow their business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
