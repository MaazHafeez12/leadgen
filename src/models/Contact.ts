import mongoose, { Schema, Document, Model } from 'mongoose';

// Contact Interface
export interface IContact extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  company?: mongoose.Types.ObjectId; // Reference to Company
  linkedinUrl?: string;
  location?: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
  source?: string; // 'manual', 'import', 'scrape', 'extension'
  tags: string[];
  lists: mongoose.Types.ObjectId[]; // References to List
  notes?: string;
  enrichmentData?: {
    verified: boolean;
    verificationStatus?: 'valid' | 'invalid' | 'accept_all' | 'webmail' | 'disposable' | 'unknown';
    verificationResult?: 'deliverable' | 'undeliverable' | 'risky' | 'unknown';
    score?: number; // Hunter.io confidence/deliverability score (0-100)
    emailType?: 'personal' | 'generic';
    sources?: number; // Number of sources found by Hunter.io
    lastEnriched?: Date;
    hunterData?: {
      position?: string;
      department?: string;
      disposable?: boolean;
      webmail?: boolean;
      acceptAll?: boolean;
      mxRecords?: boolean;
      smtpCheck?: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Contact Schema
const ContactSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    title: { type: String },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    linkedinUrl: { type: String },
    location: { type: String },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'unqualified', 'converted'],
      default: 'new',
    },
    source: { 
      type: String, 
      enum: ['manual', 'import', 'scrape', 'extension'],
      default: 'manual'
    },
    tags: [{ type: String }],
    lists: [{ type: Schema.Types.ObjectId, ref: 'List' }],
    notes: { type: String },
    enrichmentData: {
      verified: { type: Boolean, default: false },
      verificationStatus: { 
        type: String, 
        enum: ['valid', 'invalid', 'accept_all', 'webmail', 'disposable', 'unknown'] 
      },
      verificationResult: { 
        type: String, 
        enum: ['deliverable', 'undeliverable', 'risky', 'unknown'] 
      },
      score: { type: Number },
      emailType: { type: String, enum: ['personal', 'generic'] },
      sources: { type: Number },
      lastEnriched: { type: Date },
      hunterData: {
        position: { type: String },
        department: { type: String },
        disposable: { type: Boolean },
        webmail: { type: Boolean },
        acceptAll: { type: Boolean },
        mxRecords: { type: Boolean },
        smtpCheck: { type: Boolean },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search performance
ContactSchema.index({ email: 1 });
ContactSchema.index({ company: 1 });
ContactSchema.index({ status: 1 });
ContactSchema.index({ firstName: 'text', lastName: 'text' });
ContactSchema.index({ tags: 1 });

export default (mongoose.models.Contact as Model<IContact>) || 
  mongoose.model<IContact>('Contact', ContactSchema);
