import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Outreach from '@/models/Outreach';

/**
 * Get all outreach records
 * GET /api/outreach
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const campaignName = searchParams.get('campaign');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const query: any = {};

    if (campaignName) {
      query.campaignName = campaignName;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [outreaches, total] = await Promise.all([
      Outreach.find(query)
        .populate('contactId', 'firstName lastName email company title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Outreach.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: outreaches,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching outreach records:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch outreach records',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Create a draft outreach
 * POST /api/outreach
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { contactId, campaignName, subject, body: emailBody, metadata } = body;

    if (!contactId || !campaignName || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const outreach = await Outreach.create({
      contactId,
      campaignName,
      subject,
      body: emailBody,
      status: 'draft',
      metadata,
    });

    return NextResponse.json({
      success: true,
      data: outreach,
    });
  } catch (error) {
    console.error('Error creating outreach:', error);
    return NextResponse.json(
      {
        error: 'Failed to create outreach',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
