import { NextRequest, NextResponse } from 'next/server';
import { getCoachById, updateTrialDays } from '@/lib/db';
import type { ApiResponse } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const coach = getCoachById(id);

    if (!coach) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Coach not found',
        },
        { status: 404 }
      );
    }

    // Update trial days
    updateTrialDays(id);

    // Get fresh data after update
    const updatedCoach = getCoachById(id);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { coach: updatedCoach },
    });
  } catch (error) {
    console.error('Error fetching coach:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch coach',
      },
      { status: 500 }
    );
  }
}
