import mongoose, { Document, Schema } from 'mongoose';

export interface ILearningPath extends Document {
  topicId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  weeks: number;
  estimatedTotalHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: string;
  createdAt: Date;
}

const learningPathSchema = new Schema<ILearningPath>({
  topicId: {
    type: Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  weeks: {
    type: Number,
    required: true,
    min: 1,
    max: 52
  },
  estimatedTotalHours: {
    type: Number,
    required: true,
    min: 1
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  goal: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<ILearningPath>('LearningPath', learningPathSchema);