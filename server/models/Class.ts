import mongoose, { Schema, Document } from "mongoose";

export interface IClass extends Document {
  name: string;
  description?: string;
  teacherId: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  qrCode?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAccuracy?: number; // in meters
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    teacherId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    students: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    qrCode: {
      type: String,
      default: null,
    },
    gpsLatitude: {
      type: Number,
      default: null,
    },
    gpsLongitude: {
      type: Number,
      default: null,
    },
    gpsAccuracy: {
      type: Number,
      default: 50, // 50 meters default accuracy
    },
  },
  { timestamps: true }
);

// Index for faster queries
classSchema.index({ teacherId: 1 });

export default mongoose.model<IClass>("Class", classSchema);
