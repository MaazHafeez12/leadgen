import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';

// POST /api/leads/import - Bulk import leads
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { leads } = await request.json();

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid leads data' },
        { status: 400 }
      );
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as any[],
    };

    // Process each lead
    for (const leadData of leads) {
      try {
        // Check if email already exists
        const existing = await Lead.findOne({ email: leadData.email });
        
        if (existing) {
          results.skipped++;
          continue;
        }

        // Create new lead with import source
        await Lead.create({
          ...leadData,
          source: 'import',
        });

        results.imported++;
      } catch (error: any) {
        results.errors.push({
          email: leadData.email,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
