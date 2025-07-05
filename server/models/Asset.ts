import mongoose, { Document, Schema } from 'mongoose';

export interface IAsset extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'avatar' | 'audio' | 'video' | 'script';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  usedIn: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const assetSchema = new Schema<IAsset>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['avatar', 'audio', 'video', 'script'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  usedIn: [{
    type: Schema.Types.ObjectId,
    refPath: 'type'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IAsset>('Asset', assetSchema);