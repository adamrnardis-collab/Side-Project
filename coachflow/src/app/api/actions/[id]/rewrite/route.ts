import { NextRequest, NextResponse } from 'next/server';
import {
  getActionById,
  getCoachById,
  incrementRewriteCount,
  updateActionStatus,
  logInteraction,
} from '@/lib/db';
import { rewriteAction } from '@/lib/agent';
import type { ApiResponse } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const action = getActionById(id);
    if (!action) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Action not found',
        },
        { status: 404 }
      );
    }

    const coach = getCoachById(action.coach_id);
    if (!coach) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Coach not found',
        },
        { status: 404 }
      );
    }

    // Check trial status
    if (coach.trial_days_remaining <= 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Trial period has ended',
        },
        { status: 403 }
      );
    }

    // Increment rewrite count
    incrementRewriteCount(id);

    // Get rewritten action from Claude
    const agentResponse = await rewriteAction(coach, action);

    // Log interaction
    logInteraction(
      coach.id,
      'rewrite_requested',
      id,
      JSON.stringify({ original: action.title })
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        rewrittenAction: agentResponse.actions[0],
        reasoning: agentResponse.reasoning,
        tone: agentResponse.tone,
      },
    });
  } catch (error) {
    console.error('Error rewriting action:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to rewrite action',
      },
      { status: 500 }
    );
  }
}
