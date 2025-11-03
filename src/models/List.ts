import mongoose, { Schema, Document, Model } from 'mongoose';

// List Interface
export interface IList extends Document {
  name: string;
  description?: string;
  leads: mongoose.Types.ObjectId[]; // References to Lead (legacy)
  contacts: mongoose.Types.ObjectId[]; // References to Contact (new)
  companies: mongoose.Types.ObjectId[]; // References to Company
  createdAt: Date;
  updatedAt: Date;
}

// List Schema
const ListSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    leads: [{ type: Schema.Types.ObjectId, ref: 'Lead' }],
    contacts: [{ type: Schema.Types.ObjectId, ref: 'Contact' }],
    companies: [{ type: Schema.Types.ObjectId, ref: 'Company' }],
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models.List as Model<IList>) || 
  mongoose.model<IList>('List', ListSchema);
