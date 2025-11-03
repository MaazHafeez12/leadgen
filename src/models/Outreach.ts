import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOutreach extends Document {
  contactId: mongoose.Types.ObjectId;
  campaignName: string;
  subject: string;
  body: string;
  templateUsed?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  failedAt?: Date;
  openCount: number;
  clickCount: number;
  errorMessage?: string;
  trackingId?: string;
  metadata?: {
    fromEmail?: string;
    fromName?: string;
    replyTo?: string;
    cc?: string[];
    bcc?: string[];
    attachments?: string[];
    tags?: string[];
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OutreachSchema: Schema = new Schema(
  {
    contactId: {
      type: Schema.Types.ObjectId,
      ref: 'Contact',
      required: true,
      index: true,
    },
    campaignName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    templateUsed: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'],
      default: 'draft',
      index: true,
    },
    sentAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    openedAt: {
      type: Date,
    },
    clickedAt: {
      type: Date,
    },
    bouncedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    openCount: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
    },
    trackingId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
OutreachSchema.index({ campaignName: 1, status: 1 });
OutreachSchema.index({ sentAt: -1 });
OutreachSchema.index({ status: 1, sentAt: -1 });

// Virtual for contact details (populate manually)
OutreachSchema.virtual('contact', {
  ref: 'Contact',
  localField: 'contactId',
  foreignField: '_id',
  justOne: true,
});

// Ensure virtuals are included in JSON
OutreachSchema.set('toJSON', { virtuals: true });
OutreachSchema.set('toObject', { virtuals: true });

const Outreach: Model<IOutreach> =
  mongoose.models.Outreach || mongoose.model<IOutreach>('Outreach', OutreachSchema);

export default Outreach;
