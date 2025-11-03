import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Outreach from '@/models/Outreach';

/**
 * Get campaign statistics
 * GET /api/outreach/stats
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const campaignName = searchParams.get('campaign');

    const query: any = {};
    if (campaignName) {
      query.campaignName = campaignName;
    }

    // Get status counts
    const statusCounts = await Outreach.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get total open and click counts
    const engagement = await Outreach.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalOpens: { $sum: '$openCount' },
          totalClicks: { $sum: '$clickCount' },
          uniqueOpens: {
            $sum: {
              $cond: [{ $gt: ['$openCount', 0] }, 1, 0],
            },
          },
          uniqueClicks: {
            $sum: {
              $cond: [{ $gt: ['$clickCount', 0] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Get campaigns list
    const campaigns = await Outreach.aggregate([
      {
        $group: {
          _id: '$campaignName',
          count: { $sum: 1 },
          sent: {
            $sum: {
              $cond: [{ $in: ['$status', ['sent', 'delivered', 'opened', 'clicked']] }, 1, 0],
            },
          },
          opened: {
            $sum: {
              $cond: [{ $gt: ['$openCount', 0] }, 1, 0],
            },
          },
          clicked: {
            $sum: {
              $cond: [{ $gt: ['$clickCount', 0] }, 1, 0],
            },
          },
          lastSent: { $max: '$sentAt' },
        },
      },
      { $sort: { lastSent: -1 } },
    ]);

    // Format status counts
    const stats: any = {
      draft: 0,
      scheduled: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: 0,
    };

    statusCounts.forEach((item: any) => {
      stats[item._id] = item.count;
    });

    return NextResponse.json({
      success: true,
      stats,
      engagement: engagement[0] || {
        totalOpens: 0,
        totalClicks: 0,
        uniqueOpens: 0,
        uniqueClicks: 0,
      },
      campaigns: campaigns.map((c: any) => ({
        name: c._id,
        count: c.count,
        sent: c.sent,
        opened: c.opened,
        clicked: c.clicked,
        openRate: c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(2) : '0.00',
        clickRate: c.sent > 0 ? ((c.clicked / c.sent) * 100).toFixed(2) : '0.00',
        lastSent: c.lastSent,
      })),
    });
  } catch (error) {
    console.error('Error fetching outreach stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
