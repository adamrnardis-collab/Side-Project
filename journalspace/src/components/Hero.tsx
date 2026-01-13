import { PenLine, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sage-200/30 rounded-full blur-3xl" />
        <div className="absolute top-20 -left-20 w-60 h-60 bg-warm-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-sage-100/50 rounded-full blur-3xl" />
      </div>

      <div className="container-max px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage-100 text-sage-700 rounded-full text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>Your private space for reflection</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-sage-900 leading-tight mb-6">
            Capture Your Story,{" "}
            <span className="text-sage-600">One Day at a Time</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-sage-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Whether it&apos;s one sentence or one page, JournalSpace gives you a calm,
            distraction-free place to reflect, grow, and preserve your most
            meaningful moments.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a href="#get-started" className="btn-primary text-lg px-8 py-4">
              Start Writing Today
            </a>
            <a href="#features" className="btn-secondary text-lg px-8 py-4">
              See How It Works
            </a>
          </div>

          {/* Hero Illustration */}
          <div className="relative max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-sage-100 p-6 sm:p-8">
              {/* Mock Journal Entry */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-sage-100 rounded-lg">
                  <PenLine className="h-5 w-5 text-sage-600" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-sage-500">Today&apos;s Entry</p>
                  <p className="font-medium text-sage-900">January 13, 2026</p>
                </div>
              </div>

              {/* Mock Entry Content */}
              <div className="text-left space-y-4">
                <p className="text-sage-700 leading-relaxed">
                  &quot;Today I realized that small moments of gratitude can transform an
                  ordinary day into something meaningful. The morning coffee, the
                  unexpected call from an old friend, the quiet hour I found to read...&quot;
                </p>
                <div className="flex items-center gap-2 text-sage-500 text-sm">
                  <span className="inline-block w-2 h-2 bg-sage-400 rounded-full animate-pulse" aria-hidden="true" />
                  <span>Still writing...</span>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-sage-200/50 rounded-full blur-2xl" aria-hidden="true" />
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-warm-200/50 rounded-full blur-2xl" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
