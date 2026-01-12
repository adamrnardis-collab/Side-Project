'use client';

import { useState } from 'react';
import type { DailyAction } from '@/lib/types';

interface ActionCardProps {
  action: DailyAction;
  onStatusChange: (actionId: string, status: 'completed' | 'avoided') => void;
  onRewrite: (actionId: string) => void;
}

export default function ActionCard({ action, onStatusChange, onRewrite }: ActionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusChange = async (status: 'completed' | 'avoided') => {
    setIsProcessing(true);
    await onStatusChange(action.id, status);
    setIsProcessing(false);
  };

  const handleRewrite = async () => {
    setIsProcessing(true);
    await onRewrite(action.id);
    setIsProcessing(false);
  };

  const difficultyLabel = ['', 'Gentle', 'Moderate', 'Stretch'];
  const difficultyColor = ['', 'text-green-600', 'text-yellow-600', 'text-orange-600'];

  return (
    <div className={`card ${action.status !== 'pending' ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{action.title}</h3>
          <span
            className={`text-sm font-medium ${difficultyColor[action.difficulty]}`}
          >
            {difficultyLabel[action.difficulty]} • Level {action.difficulty}
          </span>
        </div>
        {action.status === 'completed' && (
          <span className="text-green-600 text-sm font-medium">✓ Done</span>
        )}
        {action.status === 'avoided' && (
          <span className="text-red-600 text-sm font-medium">Avoided</span>
        )}
      </div>

      <p className="text-gray-700 mb-4">{action.description}</p>

      {action.draft_text && (
        <div className="mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isExpanded ? '▼' : '▶'} {isExpanded ? 'Hide' : 'Show'} draft text
          </button>
          {isExpanded && (
            <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{action.draft_text}</p>
            </div>
          )}
        </div>
      )}

      {action.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={() => handleStatusChange('completed')}
            disabled={isProcessing}
            className="flex-1 btn btn-success disabled:opacity-50"
          >
            Done
          </button>
          <button
            onClick={handleRewrite}
            disabled={isProcessing}
            className="flex-1 btn btn-secondary disabled:opacity-50"
          >
            Rewrite
          </button>
          <button
            onClick={() => handleStatusChange('avoided')}
            disabled={isProcessing}
            className="flex-1 btn btn-danger disabled:opacity-50"
          >
            Avoided
          </button>
        </div>
      )}
    </div>
  );
}
