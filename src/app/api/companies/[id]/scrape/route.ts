import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';

/**
 * POST /api/companies/[id]/scrape
 * Save scraped data to company record
 * 
 * Body: { scrapedData: {...} }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    const { scrapedData } = await req.json();

    if (!scrapedData) {
      return NextResponse.json(
        { success: false, error: 'Scraped data is required' },
        { status: 400 }
      );
    }

    // Update company with scraped data
    const company = await Company.findByIdAndUpdate(
      id,
      {
        scrapedData: {
          ...scrapedData,
          lastScraped: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company,
      message: 'Scraped data saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving scraped data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
