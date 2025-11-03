import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/hunter/verify
 * Verify email address using Hunter.io Email Verifier API
 * 
 * Body: { email }
 * Returns: Hunter.io verification response with deliverability status
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate required field
    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email address is required' 
        },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format' 
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
    const url = new URL('https://api.hunter.io/v2/email-verifier');
    url.searchParams.append('email', email);
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

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        email: data.data.email,
        status: data.data.status, // valid, invalid, accept_all, webmail, disposable, unknown
        result: data.data.result, // deliverable, undeliverable, risky, unknown
        score: data.data.score, // 0-100 deliverability score
        regexp: data.data.regexp, // Email format is valid
        gibberish: data.data.gibberish, // Email looks like gibberish
        disposable: data.data.disposable, // Disposable email service
        webmail: data.data.webmail, // Webmail provider
        mxRecords: data.data.mx_records, // MX records found
        smtp: {
          server: data.data.smtp_server,
          check: data.data.smtp_check, // SMTP server accepts emails
        },
        acceptAll: data.data.accept_all, // Server accepts all emails
        block: data.data.block, // Email is blocked
        domain: data.data.domain,
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
    console.error('Hunter.io Email Verifier error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
