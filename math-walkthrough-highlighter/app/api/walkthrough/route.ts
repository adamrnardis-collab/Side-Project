import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateWalkthrough } from '@/lib/anthropic';
import { WalkthroughRequestSchema, APIResponse } from '@/lib/schema';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

// Get client IP from request
function getClientIP(request: NextRequest): string {
  // Check common headers for proxied requests
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP);

    if (!rateLimitResult.allowed) {
      const response: APIResponse = {
        success: false,
        error: `Rate limit exceeded. Try again after ${new Date(rateLimitResult.resetTime).toLocaleTimeString()}.`,
        code: 'RATE_LIMITED',
      };

      return NextResponse.json(response, {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      });
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      const response: APIResponse = {
        success: false,
        error: 'Invalid JSON in request body',
        code: 'VALIDATION_ERROR',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate input
    const validationResult = WalkthroughRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('; ');

      const response: APIResponse = {
        success: false,
        error: `Validation error: ${errors}`,
        code: 'VALIDATION_ERROR',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { inputText, style } = validationResult.data;

    // Generate walkthrough
    const walkthrough = await generateWalkthrough(inputText, style);

    const response: APIResponse = {
      success: true,
      data: walkthrough,
    };

    return NextResponse.json(response, {
      headers: getRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    // Log error without leaking user content
    console.error('Walkthrough API error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      // Truncate stack to avoid bloating logs
      stack: error instanceof Error ? error.stack?.slice(0, 500) : undefined,
    });

    // Handle specific error types
    if (error instanceof z.ZodError) {
      const response: APIResponse = {
        success: false,
        error: 'Failed to parse AI response. Please try again.',
        code: 'PARSE_ERROR',
      };
      return NextResponse.json(response, { status: 500 });
    }

    if (error instanceof SyntaxError) {
      const response: APIResponse = {
        success: false,
        error: 'Failed to parse AI response as JSON. Please try again.',
        code: 'PARSE_ERROR',
      };
      return NextResponse.json(response, { status: 500 });
    }

    // Check for Anthropic API errors
    if (error instanceof Error) {
      if (error.message.includes('API')) {
        const response: APIResponse = {
          success: false,
          error: 'AI service temporarily unavailable. Please try again later.',
          code: 'API_ERROR',
        };
        return NextResponse.json(response, { status: 503 });
      }

      if (error.message.includes('ANTHROPIC_API_KEY')) {
        const response: APIResponse = {
          success: false,
          error: 'Service configuration error. Please contact support.',
          code: 'API_ERROR',
        };
        return NextResponse.json(response, { status: 500 });
      }
    }

    // Generic error
    const response: APIResponse = {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
      code: 'UNKNOWN',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
