'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    niche: '',
    offer_type: '',
    price_range: '',
    audience_size: '',
    biggest_fear: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/coach/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        setError('Failed to create account. Please try again.');
        return;
      }
      const result = await response.json();

      if (result.success) {
        // Store coach ID in localStorage
        localStorage.setItem('coachId', result.data.coach.id);
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(result.error || 'Failed to create account');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to CoachFlow
          </h1>
          <p className="text-lg text-gray-600">
            Your calm, grounded partner for consistent business growth
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="input"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="niche" className="label">
                What&apos;s your coaching niche?
              </label>
              <input
                type="text"
                id="niche"
                name="niche"
                required
                className="input"
                value={formData.niche}
                onChange={handleChange}
                placeholder="e.g., Life coaching for creative entrepreneurs"
              />
            </div>

            <div>
              <label htmlFor="offer_type" className="label">
                What do you offer?
              </label>
              <select
                id="offer_type"
                name="offer_type"
                required
                className="input"
                value={formData.offer_type}
                onChange={handleChange}
              >
                <option value="">Select your offer type</option>
                <option value="1-on-1 coaching">1-on-1 coaching</option>
                <option value="Group program">Group program</option>
                <option value="Course">Course</option>
                <option value="Mastermind">Mastermind</option>
                <option value="Workshop">Workshop</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="price_range" className="label">
                Price range
              </label>
              <select
                id="price_range"
                name="price_range"
                required
                className="input"
                value={formData.price_range}
                onChange={handleChange}
              >
                <option value="">Select price range</option>
                <option value="Under $500">Under $500</option>
                <option value="$500 - $1,000">$500 - $1,000</option>
                <option value="$1,000 - $3,000">$1,000 - $3,000</option>
                <option value="$3,000 - $5,000">$3,000 - $5,000</option>
                <option value="$5,000+">$5,000+</option>
              </select>
            </div>

            <div>
              <label htmlFor="audience_size" className="label">
                Current audience size
              </label>
              <select
                id="audience_size"
                name="audience_size"
                required
                className="input"
                value={formData.audience_size}
                onChange={handleChange}
              >
                <option value="">Select audience size</option>
                <option value="0-100">0-100</option>
                <option value="100-500">100-500</option>
                <option value="500-1,000">500-1,000</option>
                <option value="1,000-5,000">1,000-5,000</option>
                <option value="5,000+">5,000+</option>
              </select>
            </div>

            <div>
              <label htmlFor="biggest_fear" className="label">
                What&apos;s your biggest fear about growing your business?
              </label>
              <textarea
                id="biggest_fear"
                name="biggest_fear"
                required
                rows={3}
                className="input"
                value={formData.biggest_fear}
                onChange={handleChange}
                placeholder="Be honest - this helps us support you better"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating your account...' : 'Start 7-Day Free Trial'}
              </button>
              <p className="text-sm text-gray-500 text-center mt-4">
                No credit card required. 7 days of focused daily actions.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
