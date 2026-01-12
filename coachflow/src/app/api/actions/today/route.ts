import { NextRequest, NextResponse } from 'next/server';
import { getTodayActions } from '@/lib/db';
import type { ApiResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const coachId = request.nextUrl.searchParams.get('coachId');

    if (!coachId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Missing coachId parameter',
        },
        { status: 400 }
      );
    }

    const actions = getTodayActions(coachId);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { actions },
    });
  } catch (error) {
    console.error('Error fetching today actions:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch actions',
      },
      { status: 500 }
    );
  }
}
