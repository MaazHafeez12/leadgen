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
    score?: number;
    lastEnriched?: Date;
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
      score: { type: Number },
      lastEnriched: { type: Date },
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
