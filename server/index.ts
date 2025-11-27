import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db";
import { handleDemo } from "./routes/demo";
import { handleRegister, handleLogin, handleVerify } from "./routes/auth";
import {
  authMiddleware,
  adminOnly,
  teacherOnly,
  studentOnly,
} from "./middleware/auth";
import adminRoutes from "./routes/admin";
import teacherRoutes from "./routes/teacher";
import studentRoutes from "./routes/student";

// Synchronous version for Vite dev server
export function createServer() {
  const app = express();

  // Connect to MongoDB in the background (non-blocking)
  connectDB()
    .then(() => {
      console.log("✅ MongoDB connected successfully");
    })
    .catch((error) => {
      console.warn(
        "⚠️  MongoDB connection failed. API endpoints will not work until MongoDB is running.",
      );
      console.warn("To start MongoDB: mongod");
    });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  // Demo route
  app.get("/api/demo", handleDemo);

  // Auth routes (no authentication required)
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/verify", handleVerify);

  // Protected routes
  app.use("/api/admin", authMiddleware, adminOnly, adminRoutes);
  app.use("/api/teacher", authMiddleware, teacherOnly, teacherRoutes);
  app.use("/api/student", authMiddleware, studentOnly, studentRoutes);

  return app;
}
