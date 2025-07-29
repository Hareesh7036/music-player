import mongoose, { Document, Schema, Model, Types } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";

// Interface for User document
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  playlists: Types.ObjectId[];
  favoritesSongs: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

// Interface for User model
interface IUserModel extends Model<IUser> {
  // Add static methods here if needed
}

// User schema definition
const userSchema = new Schema<IUser, IUserModel>(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot be more than 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please provide a valid email",
      ],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    playlists: [
      {
        type: Schema.Types.ObjectId,
        ref: "Playlist",
        default: [],
      },
    ],
    favoritesSongs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Song",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    console.log('Password not modified, skipping hashing');
    return next();
  }

  try {
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    console.log('Password hashed successfully');
    next();
  } catch (error: any) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function (): string {
  const payload = { 
    id: this._id.toString(), 
    email: this.email 
  };

  // Sign the token with the secret key and set expiration
  return jwt.sign(
    payload,
    config.jwtSecret,
    { expiresIn: '7d' } // 7 days expiration
  ) as string; // Type assertion to handle the JWT return type
};

// Create and export the model
const User = mongoose.model<IUser, IUserModel>("User", userSchema);

export { User };
