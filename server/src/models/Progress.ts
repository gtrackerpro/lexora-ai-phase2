import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  learningPathId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  videoId?: mongoose.Types.ObjectId;
  watchedPercentage: number;
  completed: boolean;
  completedAt?: Date;
  notes: string[];
  revisits: Array<{
    timestamp: Date;
    watchedPercent: number;
  }>;
  createdAt: Date;
}

const progressSchema = new Schema<IProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  learningPathId: {
    type: Schema.Types.ObjectId,
    ref: 'LearningPath',
    required: true
  },
  topicId: {
    type: Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  videoId: {
    type: Schema.Types.ObjectId,
    ref: 'Video'
  },
  watchedPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  notes: [{
    type: String
  }],
  revisits: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    watchedPercent: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IProgress>('Progress', progressSchema);