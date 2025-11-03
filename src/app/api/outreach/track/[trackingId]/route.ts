import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Outreach from '@/models/Outreach';

/**
 * Track email events (open, click, bounce)
 * POST /api/outreach/track/:trackingId
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    await connectDB();

    const { trackingId } = params;
    const body = await request.json();
    const { event } = body; // 'open', 'click', 'bounce', 'delivered'

    if (!event) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }

    const outreach = await Outreach.findOne({ trackingId });

    if (!outreach) {
      return NextResponse.json(
        { error: 'Outreach record not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    switch (event) {
      case 'delivered':
        updateData.status = 'delivered';
        updateData.deliveredAt = new Date();
        break;

      case 'open':
        updateData.status = 'opened';
        updateData.openCount = outreach.openCount + 1;
        if (!outreach.openedAt) {
          updateData.openedAt = new Date();
        }
        break;

      case 'click':
        updateData.status = 'clicked';
        updateData.clickCount = outreach.clickCount + 1;
        if (!outreach.clickedAt) {
          updateData.clickedAt = new Date();
        }
        break;

      case 'bounce':
        updateData.status = 'bounced';
        updateData.bouncedAt = new Date();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid event type' },
          { status: 400 }
        );
    }

    const updatedOutreach = await Outreach.findByIdAndUpdate(
      outreach._id,
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedOutreach,
    });
  } catch (error) {
    console.error('Error tracking email event:', error);
    return NextResponse.json(
      {
        error: 'Failed to track event',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get tracking pixel (for email open tracking)
 * GET /api/outreach/track/:trackingId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    await connectDB();

    const { trackingId } = params;

    // Find and update the outreach record
    const outreach = await Outreach.findOne({ trackingId });

    if (outreach && outreach.status === 'sent') {
      await Outreach.findByIdAndUpdate(outreach._id, {
        $set: {
          status: 'opened',
          openedAt: !outreach.openedAt ? new Date() : outreach.openedAt,
        },
        $inc: { openCount: 1 },
      });
    }

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error tracking email open:', error);
    
    // Return pixel even on error
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
      },
    });
  }
}
