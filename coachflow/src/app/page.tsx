'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            CoachFlow
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 mb-4">
            Your calm, grounded partner for consistent business growth
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            An AI agent that helps new life coaches take confidence-safe daily actions
            to grow their business.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-20">
          <button
            onClick={() => router.push('/onboarding')}
            className="btn btn-primary text-lg px-8 py-4"
          >
            Start 7-Day Free Trial
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Daily Actions
            </h3>
            <p className="text-gray-600">
              Get 1-3 personalized actions every day. Each one is small, specific,
              and designed around your niche and comfort level.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Emotionally Safe
            </h3>
            <p className="text-gray-600">
              No hype. No shame. No pressure. Our AI adapts to your avoidance
              patterns and adjusts difficulty down when needed.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Track Progress
            </h3>
            <p className="text-gray-600">
              See your streak, completed actions, and patterns over time. Celebrate
              consistency over perfection.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl p-12 shadow-lg border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-gray-900">
                  Share Your Context
                </h4>
                <p className="text-gray-600">
                  Tell us about your niche, offer, audience size, and biggest fear.
                  This helps us tailor actions specifically for you.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-gray-900">
                  Get Daily Actions
                </h4>
                <p className="text-gray-600">
                  Each day, receive 1-3 actions with clear instructions and even
                  pre-written drafts when relevant (messages, posts, etc.).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-gray-900">
                  Give Feedback
                </h4>
                <p className="text-gray-600">
                  Mark actions as Done, Avoided, or request a Rewrite. The AI learns
                  and adapts to keep you moving forward safely.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What This Is NOT */}
        <div className="bg-gray-900 text-white rounded-xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            This Is NOT
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-lg">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-2xl">✗</span>
              <p>A content generator pumping out posts</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-2xl">✗</span>
              <p>A marketing guru promising overnight success</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-2xl">✗</span>
              <p>A tool that creates urgency or shame</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-2xl">✗</span>
              <p>Generic advice you could find anywhere</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Ready to Take Consistent Action?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start your 7-day free trial. No credit card required.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="btn btn-primary text-lg px-8 py-4"
          >
            Get Started Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>CoachFlow - AI-powered daily actions for life coaches</p>
          <p className="text-sm mt-2">Built with Next.js and Claude AI</p>
        </div>
      </div>
    </div>
  );
}
