import mongoose, { Document, Schema } from 'mongoose';

export interface ITopic extends Document {
  title: string;
  description: string;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const topicSchema = new Schema<ITopic>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<ITopic>('Topic', topicSchema);