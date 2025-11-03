import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tag from '@/models/Tag';

// GET /api/tags - Get all tags
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const tags = await Tag.find().sort({ name: 1 });

    return NextResponse.json({
      success: true,
      data: tags,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const tag = await Tag.create(body);

    return NextResponse.json(
      { success: true, data: tag },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
