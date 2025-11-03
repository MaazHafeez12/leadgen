import mongoose, { Schema, Document, Model } from 'mongoose';

// Tag Interface
export interface ITag extends Document {
  name: string;
  color?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tag Schema
const TagSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    color: { type: String, default: '#3B82F6' }, // Tailwind blue-500
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models.Tag as Model<ITag>) || 
  mongoose.model<ITag>('Tag', TagSchema);
