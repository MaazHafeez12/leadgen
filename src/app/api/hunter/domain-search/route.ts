import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/hunter/domain-search
 * Find all email addresses for a domain using Hunter.io Domain Search API
 * 
 * Body: { domain, limit?, offset?, type?, seniority?, department? }
 * Returns: Hunter.io domain search response with emails list
 */
export async function POST(req: NextRequest) {
  try {
    const { domain, limit = 10, offset = 0, type, seniority, department } = await req.json();

    // Validate required field
    if (!domain) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Domain is required' 
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
    const url = new URL('https://api.hunter.io/v2/domain-search');
    url.searchParams.append('domain', domain);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('offset', offset.toString());
    url.searchParams.append('api_key', apiKey);

    // Optional filters
    if (type) url.searchParams.append('type', type); // personal or generic
    if (seniority) url.searchParams.append('seniority', seniority); // junior, senior, executive
    if (department) url.searchParams.append('department', department); // executive, it, finance, etc.

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

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        domain: data.data.domain,
        disposable: data.data.disposable,
        webmail: data.data.webmail,
        acceptAll: data.data.accept_all,
        pattern: data.data.pattern, // Email pattern for this domain
        organization: data.data.organization,
        emails: data.data.emails?.map((email: any) => ({
          value: email.value,
          type: email.type,
          confidence: email.confidence,
          firstName: email.first_name,
          lastName: email.last_name,
          position: email.position,
          seniority: email.seniority,
          department: email.department,
          linkedin: email.linkedin,
          twitter: email.twitter,
          phoneNumber: email.phone_number,
          sources: email.sources?.length || 0,
          verification: email.verification
            ? {
                date: email.verification.date,
                status: email.verification.status,
              }
            : null,
        })) || [],
        total: data.meta?.results || 0,
        limit: data.meta?.limit || limit,
        offset: data.meta?.offset || offset,
      },
      meta: {
        requests: {
          available: data.meta?.params?.requests_available,
          used: data.meta?.params?.requests_used,
        }
      }
    });

  } catch (error: any) {
    console.error('Hunter.io Domain Search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
