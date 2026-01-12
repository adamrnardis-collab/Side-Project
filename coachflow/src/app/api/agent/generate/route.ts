import { NextRequest, NextResponse } from 'next/server';
import {
  getCoachById,
  getTodayActions,
  getRecentActions,
  createActions,
} from '@/lib/db';
import { generateDailyActions } from '@/lib/agent';
import type { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { coachId } = body;

    if (!coachId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Missing coachId',
        },
        { status: 400 }
      );
    }

    const coach = getCoachById(coachId);
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

    // Check if actions already exist for today
    const todayActions = getTodayActions(coachId);
    if (todayActions.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          actions: todayActions,
          message: 'Actions already generated for today',
        },
      });
    }

    // Get context
    const recentActions = getRecentActions(coachId, 10);

    // Generate actions using Claude
    const agentResponse = await generateDailyActions(
      coach,
      recentActions,
      todayActions
    );

    // Save actions to database
    const createdActions = createActions(coachId, agentResponse.actions);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        actions: createdActions,
        tone: agentResponse.tone,
        reasoning: agentResponse.reasoning,
      },
    });
  } catch (error) {
    console.error('Error generating actions:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to generate actions',
      },
      { status: 500 }
    );
  }
}
