import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';

// POST /api/email/send - Send email to leads
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { leadIds, subject, body, from } = await request.json();

    // Validate required fields
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No leads selected' },
        { status: 400 }
      );
    }

    if (!subject || !body) {
      return NextResponse.json(
        { success: false, error: 'Subject and body are required' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Get leads
    const leads = await Lead.find({ _id: { $in: leadIds } });

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as any[],
    };

    // Send emails
    for (const lead of leads) {
      try {
        await transporter.sendMail({
          from: from || process.env.SMTP_USER,
          to: lead.email,
          subject: subject.replace('{{firstName}}', lead.firstName)
                         .replace('{{lastName}}', lead.lastName)
                         .replace('{{company}}', lead.company || ''),
          html: body.replace('{{firstName}}', lead.firstName)
                   .replace('{{lastName}}', lead.lastName)
                   .replace('{{company}}', lead.company || ''),
        });

        // Update lead status
        await Lead.findByIdAndUpdate(lead._id, { status: 'contacted' });
        
        results.sent++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          email: lead.email,
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
