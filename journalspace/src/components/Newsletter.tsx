"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
    setEmail("");
  };

  return (
    <section id="get-started" className="section-padding bg-sage-600">
      <div className="container-max">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex p-4 bg-sage-500 rounded-full mb-6">
            <Mail className="h-8 w-8 text-white" aria-hidden="true" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Start Your Journaling Journey
          </h2>
          <p className="text-sage-100 text-lg mb-8 leading-relaxed">
            Join thousands of reflective writers. Get weekly journaling prompts,
            tips for building a consistent practice, and early access to new
            features.
          </p>

          {/* Form */}
          {isSubmitted ? (
            <div className="flex items-center justify-center gap-3 p-4 bg-sage-500 rounded-xl">
              <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
              <span className="text-white font-medium">
                Welcome aboard! Check your inbox for your first prompt.
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <div className="flex-1">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-5 py-4 bg-white text-sage-900 placeholder-sage-400 rounded-full focus:outline-none focus:ring-2 focus:ring-sage-300 transition-shadow"
                  aria-describedby="email-hint"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-sage-900 text-white font-medium rounded-full hover:bg-sage-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sage-600 focus:ring-sage-300 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span>Joining...</span>
                ) : (
                  <>
                    <span>Get Started</span>
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Privacy Note */}
          <p id="email-hint" className="mt-4 text-sage-200 text-sm">
            No spam, ever. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
}
