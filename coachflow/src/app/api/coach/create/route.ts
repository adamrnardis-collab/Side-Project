import { NextRequest, NextResponse } from 'next/server';
import { createCoach, getCoachByEmail, logInteraction } from '@/lib/db';
import type { CoachOnboarding, ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CoachOnboarding = await request.json();

    // Validate required fields
    const requiredFields: (keyof CoachOnboarding)[] = [
      'email',
      'niche',
      'offer_type',
      'price_range',
      'audience_size',
      'biggest_fear',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // Check if coach already exists
    const existingCoach = getCoachByEmail(body.email);
    if (existingCoach) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'A coach with this email already exists',
        },
        { status: 409 }
      );
    }

    // Create coach
    const coach = createCoach(body);

    // Log onboarding interaction
    logInteraction(coach.id, 'onboarding', undefined, JSON.stringify(body));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { coach },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating coach:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create coach',
      },
      { status: 500 }
    );
  }
}
