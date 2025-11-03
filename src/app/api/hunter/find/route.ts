import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/hunter/find
 * Find email address using Hunter.io Email Finder API
 * 
 * Body: { firstName, lastName, domain }
 * Returns: Hunter.io email finder response with email and confidence score
 */
export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, domain } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !domain) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: firstName, lastName, domain' 
        },
        { status: 400 }
      );
    }

    // Validate API key
    const apiKey = process.env.HUNTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Hunter.io API key not configured. Add HUNTER_API_KEY to .env.local' 
        },
        { status: 500 }
      );
    }

    // Build Hunter.io API URL
    const url = new URL('https://api.hunter.io/v2/email-finder');
    url.searchParams.append('domain', domain);
    url.searchParams.append('first_name', firstName);
    url.searchParams.append('last_name', lastName);
    url.searchParams.append('api_key', apiKey);

    // Call Hunter.io API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Handle API errors
    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.errors?.[0]?.details || 'Hunter.io API error',
          hunterResponse: data
        },
        { status: response.status }
      );
    }

    // Check if email was found
    if (!data.data?.email) {
      return NextResponse.json({
        success: false,
        message: 'No email found for this person',
        hunterResponse: data
      });
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        email: data.data.email,
        score: data.data.score,
        firstName: data.data.first_name,
        lastName: data.data.last_name,
        position: data.data.position,
        department: data.data.department,
        type: data.data.type, // personal or generic
        confidence: data.data.confidence,
        sources: data.data.sources?.length || 0,
      },
      meta: {
        requests: {
          available: data.meta?.params?.requests_available,
          used: data.meta?.params?.requests_used,
        }
      }
    });

  } catch (error: any) {
    console.error('Hunter.io Email Finder error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
