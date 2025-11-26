import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  date: Date;
  status: "present" | "absent" | "late";
  qrScanned: boolean;
  gpsMasched: boolean;
  faceMatched: boolean;
  faceConfidence?: number; // 0-1 confidence score
  gpsLatitude?: number;
  gpsLongitude?: number;
  markedAt: Date;
  createdAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    studentId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classId: {
      type: mongoose.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    teacherId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => new Date().setHours(0, 0, 0, 0),
    },
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      default: "absent",
    },
    qrScanned: {
      type: Boolean,
      default: false,
    },
    gpsMasched: {
      type: Boolean,
      default: false,
    },
    faceMatched: {
      type: Boolean,
      default: false,
    },
    faceConfidence: {
      type: Number,
      min: 0,
      max: 1,
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
    markedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Compound index for faster queries
attendanceSchema.index({ studentId: 1, classId: 1, date: 1 });
attendanceSchema.index({ classId: 1, date: 1 });

export default mongoose.model<IAttendance>("Attendance", attendanceSchema);
