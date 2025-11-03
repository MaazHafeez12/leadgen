import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import List from '@/models/List';
import Lead from '@/models/Lead';
import Contact from '@/models/Contact';

// GET /api/lists/[id] - Get a single list with leads, contacts, and companies
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const list = await List.findById(params.id)
      .populate('leads')
      .populate({
        path: 'contacts',
        populate: { path: 'company' }
      })
      .populate('companies');

    if (!list) {
      return NextResponse.json(
        { success: false, error: 'List not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/lists/[id] - Update a list
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const list = await List.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!list) {
      return NextResponse.json(
        { success: false, error: 'List not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/lists/[id] - Delete a list
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const list = await List.findByIdAndDelete(params.id);

    if (!list) {
      return NextResponse.json(
        { success: false, error: 'List not found' },
        { status: 404 }
      );
    }

    // Remove list reference from leads
    await Lead.updateMany(
      { lists: params.id },
      { $pull: { lists: params.id } }
    );

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
