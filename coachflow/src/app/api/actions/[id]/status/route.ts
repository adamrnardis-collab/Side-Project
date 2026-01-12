import { NextRequest, NextResponse } from 'next/server';
import {
  updateActionStatus,
  getActionById,
  updateCoachStreak,
  updateCoachStats,
  logInteraction,
} from '@/lib/db';
import type { ApiResponse, ActionStatus } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status }: { status: ActionStatus } = body;

    if (!status || !['pending', 'completed', 'avoided'].includes(status)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid status value',
        },
        { status: 400 }
      );
    }

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

    // Update action status
    const updatedAction = updateActionStatus(id, status);

    // Update coach stats and streak
    if (status === 'completed') {
      updateCoachStreak(action.coach_id, true);
      updateCoachStats(action.coach_id, 'completed');
      logInteraction(action.coach_id, 'completed', id);
    } else if (status === 'avoided') {
      updateCoachStats(action.coach_id, 'avoided');
      logInteraction(action.coach_id, 'avoided', id);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { action: updatedAction },
    });
  } catch (error) {
    console.error('Error updating action status:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to update action status',
      },
      { status: 500 }
    );
  }
}
