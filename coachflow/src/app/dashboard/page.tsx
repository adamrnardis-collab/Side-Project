'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ActionCard from '@/components/ActionCard';
import StatsCard from '@/components/StatsCard';
import type { Coach, DailyAction } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [actions, setActions] = useState<DailyAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const coachId = localStorage.getItem('coachId');
    if (!coachId) {
      router.push('/');
      return;
    }

    loadDashboard(coachId);
  }, [router]);

  const loadDashboard = async (coachId: string) => {
    try {
      setIsLoading(true);

      // Load coach data
      const coachResponse = await fetch(`/api/coach/${coachId}`);
      if (!coachResponse.ok) {
        setError('Failed to load your profile');
        return;
      }
      const coachResult = await coachResponse.json();

      if (coachResult.success) {
        setCoach(coachResult.data.coach);
      } else {
        setError('Failed to load your profile');
        return;
      }

      // Load today's actions
      const actionsResponse = await fetch(`/api/actions/today?coachId=${coachId}`);
      if (!actionsResponse.ok) {
        setError('Failed to load today\'s actions');
        return;
      }
      const actionsResult = await actionsResponse.json();

      if (actionsResult.success) {
        setActions(actionsResult.data.actions);
      }
    } catch (err) {
      setError('Something went wrong. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateActions = async () => {
    if (!coach) return;

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/agent/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachId: coach.id }),
      });

      if (!response.ok) {
        setError('Failed to generate actions. Please try again.');
        return;
      }
      const result = await response.json();

      if (result.success) {
        setActions(result.data.actions);
      } else {
        setError(result.error || 'Failed to generate actions');
      }
    } catch (err) {
      setError('Failed to generate actions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusChange = async (actionId: string, status: 'completed' | 'avoided') => {
    try {
      const response = await fetch(`/api/actions/${actionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        setError('Failed to update action');
        return;
      }
      const result = await response.json();

      if (result.success) {
        // Update local state
        setActions((prev) =>
          prev.map((a) => (a.id === actionId ? result.data.action : a))
        );

        // Reload coach data to update stats
        if (coach) {
          const coachResponse = await fetch(`/api/coach/${coach.id}`);
          if (coachResponse.ok) {
            const coachResult = await coachResponse.json();
            if (coachResult.success) {
              setCoach(coachResult.data.coach);
            }
          }
        }
      }
    } catch (err) {
      setError('Failed to update action');
    }
  };

  const handleRewrite = async (actionId: string) => {
    try {
      const response = await fetch(`/api/actions/${actionId}/rewrite`, {
        method: 'POST',
      });

      if (!response.ok) {
        setError('Failed to rewrite action');
        return;
      }
      const result = await response.json();

      if (result.success) {
        alert(
          `Rewritten action:\n\nTitle: ${result.data.rewrittenAction.title}\n\nDescription: ${result.data.rewrittenAction.description}\n\nDraft: ${result.data.rewrittenAction.draft_text || 'None'}\n\nReasoning: ${result.data.reasoning}`
        );
      } else {
        setError(result.error || 'Failed to rewrite action');
      }
    } catch (err) {
      setError('Failed to rewrite action');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load your profile</p>
        </div>
      </div>
    );
  }

  const trialEnded = coach.trial_days_remaining <= 0;
  const pendingActions = actions.filter((a) => a.status === 'pending').length;
  const completedToday = actions.filter((a) => a.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CoachFlow</h1>
              <p className="text-gray-600 mt-1">
                {coach.niche} • {coach.offer_type}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Trial Days Remaining</p>
              <p className="text-2xl font-bold text-blue-600">
                {coach.trial_days_remaining}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {trialEnded && (
          <div className="bg-yellow-50 border border-yellow-200 px-6 py-4 rounded-lg mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">Trial Period Ended</h3>
            <p className="text-yellow-800">
              Your 7-day trial has ended. This is the end of the MVP experience.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            label="Current Streak"
            value={`${coach.current_streak} days`}
            icon="🔥"
            color="green"
          />
          <StatsCard
            label="Completed Actions"
            value={coach.completed_count}
            icon="✓"
            color="blue"
          />
          <StatsCard
            label="Avoided Actions"
            value={coach.avoided_count}
            icon="⚠"
            color="red"
          />
          <StatsCard
            label="Today's Progress"
            value={`${completedToday}/${actions.length}`}
            icon="📊"
            color="yellow"
          />
        </div>

        {/* Today's Actions Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Today&apos;s Actions</h2>
            {actions.length === 0 && !trialEnded && (
              <button
                onClick={generateActions}
                disabled={isGenerating}
                className="btn btn-primary disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate Today\'s Actions'}
              </button>
            )}
          </div>

          {actions.length === 0 && !isGenerating && (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-4">
                No actions generated yet for today.
              </p>
              {!trialEnded && (
                <button onClick={generateActions} className="btn btn-primary">
                  Get Your Daily Actions
                </button>
              )}
            </div>
          )}

          <div className="space-y-4">
            {actions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onStatusChange={handleStatusChange}
                onRewrite={handleRewrite}
              />
            ))}
          </div>
        </div>

        {/* Insights */}
        {coach.avoided_count > 2 && (
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Pattern Noticed</h3>
            <p className="text-blue-800">
              You&apos;ve avoided {coach.avoided_count} actions. That&apos;s okay! We&apos;re adjusting
              to give you gentler, safer steps. Progress over perfection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
