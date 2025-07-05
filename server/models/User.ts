import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password?: string;
  displayName: string;
  googleId?: string;
  avatar?: string;
  authProvider?: 'local' | 'google';
  avatarId?: mongoose.Types.ObjectId;
  voiceId?: mongoose.Types.ObjectId;
  preferences: {
    genderVoice: 'male' | 'female' | 'neutral';
    learningStyle: 'visual' | 'auditory' | 'kinesthetic';
  };
  createdAt: Date;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return this.authProvider === 'local';
    },
    minlength: 6
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  googleId: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  avatarId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset'
  },
  voiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset'
  },
  preferences: {
    genderVoice: {
      type: String,
      enum: ['male', 'female', 'neutral'],
      default: 'neutral'
    },
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic'],
      default: 'visual'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);