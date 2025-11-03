import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';
import Lead from '@/models/Lead';
import Outreach from '@/models/Outreach';
import { getEmailService } from '@/lib/email';
import { processEmailTemplate } from '@/lib/emailTemplates';
import { v4 as uuidv4 } from 'uuid';

/**
 * Send email to contacts or leads
 * POST /api/email/send
 * 
 * Supports both old format (leadIds) and new format (contactIds)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      contactIds,
      leadIds, // Legacy support
      subject,
      body: emailBody,
      campaignName = 'Manual Campaign',
      fromName,
      replyTo,
      cc,
      bcc,
      useTemplate = true,
    } = body;

    // Support both contactIds and leadIds
    const ids = contactIds || leadIds;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Contact IDs or Lead IDs are required' },
        { status: 400 }
      );
    }

    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: 'Subject and body are required' },
        { status: 400 }
      );
    }

    // Fetch contacts (try both Contact and Lead models)
    let contacts = await Contact.find({ _id: { $in: ids } });
    
    // If no contacts found, try leads (legacy)
    if (contacts.length === 0) {
      const leads = await Lead.find({ _id: { $in: ids } });
      contacts = leads as any;
    }

    if (contacts.length === 0) {
      return NextResponse.json(
        { error: 'No valid contacts or leads found' },
        { status: 404 }
      );
    }

    // Check for contacts without email
    const contactsWithoutEmail = contacts.filter(c => !c.email);
    if (contactsWithoutEmail.length > 0) {
      return NextResponse.json(
        {
          error: 'Some contacts do not have email addresses',
          contactsWithoutEmail: contactsWithoutEmail.map(c => ({
            id: c._id,
            name: `${c.firstName} ${c.lastName}`,
          })),
        },
        { status: 400 }
      );
    }

    const emailService = getEmailService();
    const results = [];

    // Send emails with rate limiting
    for (const contact of contacts) {
      try {
        // Process template variables if enabled
        let finalSubject = subject;
        let finalBody = emailBody;

        if (useTemplate) {
          const processed = processEmailTemplate({
            subject,
            body: emailBody,
            contact,
          });
          finalSubject = processed.subject;
          finalBody = processed.body;
        }

        // Generate tracking ID
        const trackingId = uuidv4();

        // Create outreach record
        const outreach = await Outreach.create({
          contactId: contact._id,
          campaignName,
          subject: finalSubject,
          body: finalBody,
          status: 'draft',
          trackingId,
          metadata: {
            fromName,
            replyTo,
            cc,
            bcc,
          },
        });

        // Send email
        const result = await emailService.sendEmail({
          to: contact.email,
          subject: finalSubject,
          body: finalBody,
          fromName,
          replyTo,
          cc,
          bcc,
        });

        // Update outreach record
        await Outreach.findByIdAndUpdate(outreach._id, {
          status: 'sent',
          sentAt: new Date(),
        });

        // Update contact/lead status
        await Contact.findByIdAndUpdate(contact._id, { status: 'contacted' }).catch(() => {
          // Try Lead model if Contact update fails
          Lead.findByIdAndUpdate(contact._id, { status: 'contacted' });
        });

        results.push({
          contactId: contact._id,
          email: contact.email,
          name: `${contact.firstName} ${contact.lastName}`,
          success: true,
          messageId: result.messageId,
          outreachId: outreach._id,
        });

        // Delay between emails (1 second)
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error sending email to ${contact.email}:`, error);

        // Create failed outreach record
        await Outreach.create({
          contactId: contact._id,
          campaignName,
          subject,
          body: emailBody,
          status: 'failed',
          failedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });

        results.push({
          contactId: contact._id,
          email: contact.email,
          name: `${contact.firstName} ${contact.lastName}`,
          success: false,
          error: error instanceof Error ? error.message : 'Failed to send email',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount} email(s) successfully, ${failureCount} failed`,
      results,
      data: results, // Legacy format
      stats: {
        total: results.length,
        sent: successCount,
        failed: failureCount,
      },
    });

  } catch (error) {
    console.error('Error sending emails:', error);
    return NextResponse.json(
      {
        error: 'Failed to send emails',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false, // Legacy format
      },
      { status: 500 }
    );
  }
}

/**
 * Test SMTP connection
 * GET /api/email/send
 */
export async function GET(request: NextRequest) {
  try {
    const emailService = getEmailService();
    const result = await emailService.testConnection();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'SMTP connection is working',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
      },
      { status: 500 }
    );
  }
}
