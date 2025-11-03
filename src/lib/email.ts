import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

/**
 * Email service for sending emails via SMTP
 */
export class EmailService {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null = null;

  /**
   * Initialize the email transporter with SMTP settings
   */
  private async initializeTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpSecure = process.env.SMTP_SECURE === 'true';
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Verify connection
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
      throw new Error('Failed to connect to SMTP server');
    }

    return this.transporter;
  }

  /**
   * Send an email
   */
  async sendEmail(options: {
    to: string | string[];
    subject: string;
    body: string;
    html?: string;
    from?: string;
    fromName?: string;
    replyTo?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: Array<{
      filename: string;
      content?: string;
      path?: string;
    }>;
  }) {
    try {
      const transporter = await this.initializeTransporter();

      const fromEmail = options.from || process.env.SMTP_USER || '';
      const fromName = options.fromName || process.env.SMTP_FROM_NAME || 'LeadGen';
      const fromAddress = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;

      const mailOptions = {
        from: fromAddress,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.body,
        html: options.html || options.body.replace(/\n/g, '<br>'),
        replyTo: options.replyTo,
        cc: Array.isArray(options.cc) ? options.cc.join(', ') : options.cc,
        bcc: Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc,
        attachments: options.attachments,
      };

      const result = await transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
        response: result.response,
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails (with rate limiting)
   */
  async sendBulkEmails(
    emails: Array<{
      to: string;
      subject: string;
      body: string;
      html?: string;
      metadata?: any;
    }>,
    options?: {
      delayMs?: number;
      onProgress?: (sent: number, total: number, email: string) => void;
    }
  ) {
    const results = [];
    const delayMs = options?.delayMs || 1000; // Default 1 second delay

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];

      try {
        const result = await this.sendEmail({
          to: email.to,
          subject: email.subject,
          body: email.body,
          html: email.html,
        });

        results.push({
          email: email.to,
          success: true,
          messageId: result.messageId,
          metadata: email.metadata,
        });

        if (options?.onProgress) {
          options.onProgress(i + 1, emails.length, email.to);
        }
      } catch (error) {
        results.push({
          email: email.to,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata: email.metadata,
        });
      }

      // Delay between emails to avoid rate limiting
      if (i < emails.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }

  /**
   * Test SMTP connection
   */
  async testConnection() {
    try {
      const transporter = await this.initializeTransporter();
      await transporter.verify();
      return { success: true, message: 'SMTP connection successful' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}
