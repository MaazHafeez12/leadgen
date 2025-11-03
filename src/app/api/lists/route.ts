import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import List from '@/models/List';
import Lead from '@/models/Lead';

// GET /api/lists - Get all lists
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const lists = await List.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: lists,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/lists - Create a new list
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const list = await List.create(body);

    // If leads are provided, update them to reference this list
    if (body.leads && body.leads.length > 0) {
      await Lead.updateMany(
        { _id: { $in: body.leads } },
        { $addToSet: { lists: list._id } }
      );
    }

    return NextResponse.json(
      { success: true, data: list },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
