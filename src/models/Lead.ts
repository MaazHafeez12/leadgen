import mongoose, { Schema, Document, Model } from 'mongoose';

// Lead Interface
// Note: Lead model maintained for backward compatibility
// New implementations should use Contact model instead
export interface ILead extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string | mongoose.Types.ObjectId; // String for legacy, ObjectId for Company reference
  companyName?: string; // Denormalized company name for quick access
  title?: string;
  industry?: string;
  location?: string;
  website?: string;
  linkedinUrl?: string;
  source?: string; // 'manual', 'import', 'scrape', 'extension'
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
  tags: mongoose.Types.ObjectId[];
  lists: mongoose.Types.ObjectId[];
  notes?: string;
  enrichmentData?: {
    verified: boolean;
    score?: number;
    lastEnriched?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Lead Schema
const LeadSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    company: { type: Schema.Types.Mixed }, // Can be String or ObjectId
    companyName: { type: String }, // Denormalized for quick display
    title: { type: String },
    industry: { type: String },
    location: { type: String },
    website: { type: String },
    linkedinUrl: { type: String },
    source: { 
      type: String, 
      enum: ['manual', 'import', 'scrape', 'extension'],
      default: 'manual'
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'unqualified', 'converted'],
      default: 'new',
    },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    lists: [{ type: Schema.Types.ObjectId, ref: 'List' }],
    notes: { type: String },
    enrichmentData: {
      verified: { type: Boolean, default: false },
      score: { type: Number },
      lastEnriched: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search performance
LeadSchema.index({ email: 1 });
LeadSchema.index({ company: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ firstName: 'text', lastName: 'text', company: 'text' });

export default (mongoose.models.Lead as Model<ILead>) || 
  mongoose.model<ILead>('Lead', LeadSchema);
