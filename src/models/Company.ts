import mongoose, { Schema, Document, Model } from 'mongoose';

// Company Interface
export interface ICompany extends Document {
  name: string;
  industry?: string;
  location?: string;
  size?: string; // e.g. "1-10", "11-50", "51-200", "201-500", "500+"
  website?: string;
  description?: string;
  linkedinUrl?: string;
  revenue?: string;
  foundedYear?: number;
  tags: string[];
  enrichmentData?: {
    verified: boolean;
    employeeCount?: number;
    lastEnriched?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Company Schema
const CompanySchema: Schema = new Schema(
  {
    name: { type: String, required: true, index: true },
    industry: { type: String, index: true },
    location: { type: String },
    size: { 
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+', ''],
    },
    website: { type: String },
    description: { type: String },
    linkedinUrl: { type: String },
    revenue: { type: String },
    foundedYear: { type: Number },
    tags: [{ type: String }],
    enrichmentData: {
      verified: { type: Boolean, default: false },
      employeeCount: { type: Number },
      lastEnriched: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search performance
CompanySchema.index({ name: 'text', industry: 'text', location: 'text' });
CompanySchema.index({ website: 1 });
CompanySchema.index({ tags: 1 });

export default (mongoose.models.Company as Model<ICompany>) || 
  mongoose.model<ICompany>('Company', CompanySchema);
