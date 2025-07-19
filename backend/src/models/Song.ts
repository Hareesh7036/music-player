import mongoose, { Document, Schema } from 'mongoose';

export interface ISong extends Document {
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  duration: number; // in seconds
  filePath: string;
  coverImage?: string;
  uploadedBy: mongoose.Types.ObjectId;
  playCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SongSchema = new Schema<ISong>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  artist: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  album: {
    type: String,
    trim: true,
    maxlength: 100
  },
  genre: {
    type: String,
    trim: true,
    maxlength: 50
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  filePath: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: null
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  playCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

export const Song = mongoose.model<ISong>('Song', SongSchema);
