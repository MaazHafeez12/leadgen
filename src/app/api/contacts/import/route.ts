import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';

// POST /api/contacts/import - Bulk import contacts
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { contacts } = await request.json();

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid contacts data' },
        { status: 400 }
      );
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as any[],
    };

    // Process each contact
    for (const contactData of contacts) {
      try {
        // Check if email already exists
        const existing = await Contact.findOne({ email: contactData.email });
        
        if (existing) {
          results.skipped++;
          continue;
        }

        // Create new contact with import source
        await Contact.create({
          ...contactData,
          source: 'import',
        });

        results.imported++;
      } catch (error: any) {
        results.errors.push({
          email: contactData.email,
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
