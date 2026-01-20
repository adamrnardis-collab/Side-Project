'use client';

import { useState, useCallback, useEffect } from 'react';
import { WalkthroughResponse, WalkthroughStyle, STYLE_DESCRIPTIONS, COLOR_MEANINGS } from '@/lib/schema';
import { Stepper, StepperSkeleton } from '@/components/Stepper';

// Demo input for showcase
const DEMO_INPUT = `Given: E[R] = 0.08, Var(R) = 0.04

Portfolio return: R_p = w_1 R_1 + w_2 R_2
where w_1 + w_2 = 1

If w_1 = 0.6, w_2 = 0.4:
E[R_p] = 0.6 * 0.08 + 0.4 * 0.12
      = 0.048 + 0.048
      = 0.096

Var(R_p) = w_1^2 * Var(R_1) + w_2^2 * Var(R_2) + 2*w_1*w_2*Cov(R_1, R_2)
         = 0.36 * 0.04 + 0.16 * 0.09 + 2*0.6*0.4*0.02
         = 0.0144 + 0.0144 + 0.0096
         = 0.0384`;

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [style, setStyle] = useState<WalkthroughStyle>('gentle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walkthrough, setWalkthrough] = useState<WalkthroughResponse | null>(null);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Please enter some mathematical workings');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/walkthrough', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputText: inputText.trim(),
          style,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'An unexpected error occurred');
        return;
      }

      setWalkthrough(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [inputText, style]);

  // Load demo input
  const loadDemo = () => {
    setInputText(DEMO_INPUT);
    setWalkthrough(null);
    setError(null);
  };

  // Clear everything
  const clearAll = () => {
    setInputText('');
    setWalkthrough(null);
    setError(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Math Walkthrough Highlighter</h1>
              <p className="text-sm text-gray-600 mt-1">
                Get AI-powered step-by-step explanations with color-coded highlights
              </p>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="View on GitHub"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Input</h2>
                <p className="text-sm text-gray-600 mt-1">Paste your mathematical workings below</p>
              </div>

              <div className="p-6">
                {/* Textarea */}
                <div className="mb-4">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your maths here (plain text, LaTeX, or mixed)..."
                    className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>{inputText.length} / 15,000 characters</span>
                    <span>Ctrl/Cmd + Enter to submit</span>
                  </div>
                </div>

                {/* Style Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explanation Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(STYLE_DESCRIPTIONS) as [WalkthroughStyle, typeof STYLE_DESCRIPTIONS['gentle']][]).map(
                      ([key, { label, description }]) => (
                        <button
                          key={key}
                          onClick={() => setStyle(key)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            style === key
                              ? 'bg-blue-50 border-blue-500 text-blue-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          disabled={loading}
                        >
                          <div className="font-medium">{label}</div>
                          <div className="text-xs opacity-75">{description}</div>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Color Scheme Legend */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Highlight Colors
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(COLOR_MEANINGS).map((color) => (
                      <div key={color.class} className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded ${color.bgClass} ${color.borderClass} border`}
                        />
                        <span className="text-xs text-gray-600">{color.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !inputText.trim()}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner" />
                        Analyzing...
                      </>
                    ) : (
                      'Generate Walkthrough'
                    )}
                  </button>
                  <button
                    onClick={loadDemo}
                    disabled={loading}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    Demo
                  </button>
                  <button
                    onClick={clearAll}
                    disabled={loading}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-500 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Walkthrough</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {walkthrough
                    ? `${walkthrough.steps.length} steps generated`
                    : 'Your step-by-step explanation will appear here'}
                </p>
              </div>

              <div className="p-6">
                {loading ? (
                  <StepperSkeleton />
                ) : walkthrough ? (
                  <Stepper walkthrough={walkthrough} />
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 opacity-50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-lg font-medium mb-1">No walkthrough yet</p>
                    <p className="text-sm">
                      Enter your mathematical workings and click "Generate Walkthrough"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-gray-500 text-center">
            Math Walkthrough Highlighter &bull; Powered by Claude AI &bull; Built with Next.js & KaTeX
          </p>
        </div>
      </footer>
    </main>
  );
}
