import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  role?: string;
  token?: string;
}

// Middleware to verify JWT token
export const authMiddleware: RequestHandler = (
  req: AuthenticatedRequest,
  res,
  next,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "No token provided",
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };

    req.userId = decoded.userId;
    req.role = decoded.role;
    req.token = token;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// Middleware to check specific role(s)
export const roleMiddleware = (allowedRoles: string[]): RequestHandler => {
  return (req: AuthenticatedRequest, res, next) => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      res.status(403).json({
        success: false,
        message: "Access denied",
      });
      return;
    }
    next();
  };
};

// Convenience middlewares for specific roles
export const adminOnly = roleMiddleware(["admin"]);
export const teacherOnly = roleMiddleware(["teacher"]);
export const studentOnly = roleMiddleware(["student"]);
export const adminOrTeacher = roleMiddleware(["admin", "teacher"]);
