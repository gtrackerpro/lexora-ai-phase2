import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
  learningPathId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  week: number;
  day: number;
  content: string;
  script: string;
  objectives: string[];
  status: 'draft' | 'generating' | 'finalized';
  createdAt: Date;
}

const lessonSchema = new Schema<ILesson>({
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
  week: {
    type: Number,
    required: true,
    min: 1
  },
  day: {
    type: Number,
    required: true,
    min: 1
  },
  content: {
    type: String,
    required: true
  },
  script: {
    type: String,
    required: true
  },
  objectives: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['draft', 'generating', 'finalized'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<ILesson>('Lesson', lessonSchema);