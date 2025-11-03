import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import axios from 'axios';

// POST /api/leads/enrich - Enrich lead with Hunter.io
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { leadId, email, domain } = await request.json();
    const hunterApiKey = process.env.HUNTER_API_KEY;

    if (!hunterApiKey) {
      return NextResponse.json(
        { success: false, error: 'Hunter API key not configured' },
        { status: 500 }
      );
    }

    // Use Hunter.io Email Verifier API
    let enrichmentData: any = {};
    
    if (email) {
      const response = await axios.get(
        `https://api.hunter.io/v2/email-verifier`,
        {
          params: {
            email,
            api_key: hunterApiKey,
          },
        }
      );

      enrichmentData = {
        verified: response.data.data.status === 'valid',
        score: response.data.data.score,
        lastEnriched: new Date(),
      };
    }

    // Find domain emails if domain provided
    let additionalEmails: any[] = [];
    if (domain) {
      try {
        const domainResponse = await axios.get(
          `https://api.hunter.io/v2/domain-search`,
          {
            params: {
              domain,
              api_key: hunterApiKey,
              limit: 10,
            },
          }
        );
        additionalEmails = domainResponse.data.data.emails || [];
      } catch (err) {
        console.error('Domain search error:', err);
      }
    }

    // Update lead with enrichment data
    if (leadId) {
      const lead = await Lead.findByIdAndUpdate(
        leadId,
        { enrichmentData },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        data: {
          lead,
          additionalEmails,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        enrichmentData,
        additionalEmails,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
