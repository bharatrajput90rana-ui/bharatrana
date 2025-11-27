import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/attendance-system";

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.warn(
      "⚠️  MongoDB connection failed. Database features will not work.",
    );
    console.warn("To start MongoDB, run: mongod");
    // Don't exit - let the server continue with frontend only
  }
}

export function disconnectDB() {
  return mongoose.disconnect();
}

export default mongoose;
