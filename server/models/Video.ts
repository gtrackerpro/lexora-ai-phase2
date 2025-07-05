import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
  lessonId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  videoUrl: string;
  audioUrl: string;
  avatarId: mongoose.Types.ObjectId;
  voiceId: mongoose.Types.ObjectId;
  durationSec: number;
  status: 'generating' | 'completed' | 'failed';
  generatedAt: Date;
  createdAt: Date;
}

const videoSchema = new Schema<IVideo>({
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  avatarId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  voiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  durationSec: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IVideo>('Video', videoSchema);