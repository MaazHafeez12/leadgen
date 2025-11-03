import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';

/**
 * POST /api/contacts/[id]/enrich
 * Save email enrichment data to contact
 * 
 * Body: { enrichmentData: {...} }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    const { enrichmentData } = await req.json();

    if (!enrichmentData) {
      return NextResponse.json(
        { success: false, error: 'Enrichment data is required' },
        { status: 400 }
      );
    }

    // Update contact with enrichment data
    const contact = await Contact.findByIdAndUpdate(
      id,
      {
        enrichmentData: {
          ...enrichmentData,
          lastEnriched: new Date(),
        },
      },
      { new: true, runValidators: true }
    ).populate('company');

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contact,
      message: 'Enrichment data saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving enrichment data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
