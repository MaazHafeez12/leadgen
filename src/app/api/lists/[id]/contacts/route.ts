import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import List from '@/models/List';
import Contact from '@/models/Contact';

// POST /api/lists/[id]/contacts - Add contacts to a list
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { contactIds } = body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'contactIds array is required' },
        { status: 400 }
      );
    }

    // Update list with new contacts
    const list = await List.findByIdAndUpdate(
      params.id,
      { $addToSet: { contacts: { $each: contactIds } } },
      { new: true }
    ).populate({
      path: 'contacts',
      populate: { path: 'company' }
    });

    if (!list) {
      return NextResponse.json(
        { success: false, error: 'List not found' },
        { status: 404 }
      );
    }

    // Update contacts with list reference
    await Contact.updateMany(
      { _id: { $in: contactIds } },
      { $addToSet: { lists: params.id } }
    );

    return NextResponse.json({
      success: true,
      data: list,
      message: `Added ${contactIds.length} contact(s) to list`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/lists/[id]/contacts - Remove contacts from a list
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { contactIds } = body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'contactIds array is required' },
        { status: 400 }
      );
    }

    // Remove contacts from list
    const list = await List.findByIdAndUpdate(
      params.id,
      { $pull: { contacts: { $in: contactIds } } },
      { new: true }
    ).populate({
      path: 'contacts',
      populate: { path: 'company' }
    });

    if (!list) {
      return NextResponse.json(
        { success: false, error: 'List not found' },
        { status: 404 }
      );
    }

    // Remove list reference from contacts
    await Contact.updateMany(
      { _id: { $in: contactIds } },
      { $pull: { lists: params.id } }
    );

    return NextResponse.json({
      success: true,
      data: list,
      message: `Removed ${contactIds.length} contact(s) from list`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
