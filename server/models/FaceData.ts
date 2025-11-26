import mongoose, { Schema, Document } from "mongoose";

export interface IFaceData extends Document {
  userId: mongoose.Types.ObjectId;
  profilePhoto: string; // Base64 or URL
  faceEmbedding: number[]; // Array of face descriptor values (512 dimensions for face-api.js)
  descriptors: number[][]; // Multiple descriptors for better matching
  livenessScore?: number; // Score indicating if person is alive (0-1)
  createdAt: Date;
  updatedAt: Date;
}

const faceDataSchema = new Schema<IFaceData>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    profilePhoto: {
      type: String,
      required: true,
    },
    faceEmbedding: [Number], // Primary embedding
    descriptors: [[Number]], // Multiple descriptors for better matching
    livenessScore: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
  },
  { timestamps: true }
);

faceDataSchema.index({ userId: 1 });

export default mongoose.model<IFaceData>("FaceData", faceDataSchema);
