import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface JwtPayload {
  userId: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

// Register new user (admin creates teacher, teacher creates student)
export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role, teacherId } =
      req.body;

    // Validation
    if (!username || !email || !password || !firstName || !lastName || !role) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      } as AuthResponse);
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Username or email already exists",
      } as AuthResponse);
      return;
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      teacherId: role === "student" ? teacherId : undefined,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    } as AuthResponse);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    } as AuthResponse);
  }
};

// Login user
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: "Username and password are required",
      } as AuthResponse);
      return;
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid username or password",
      } as AuthResponse);
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid username or password",
      } as AuthResponse);
      return;
    }

    // Generate token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    } as AuthResponse);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    } as AuthResponse);
  }
};

// Verify token and get current user
export const handleVerify: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "No token provided",
      } as AuthResponse);
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      } as AuthResponse);
      return;
    }

    res.json({
      success: true,
      message: "Token verified",
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    } as AuthResponse);
  } catch (error) {
    console.error("Verify error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    } as AuthResponse);
  }
};
