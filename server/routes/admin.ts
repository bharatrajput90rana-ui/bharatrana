import { Router, RequestHandler } from "express";
import User from "../models/User";
import Attendance from "../models/Attendance";
import { AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Get all teachers
export const getAllTeachers: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select("-password");
    res.json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ success: false, message: "Error fetching teachers" });
  }
};

// Add new teacher (admin only)
export const addTeacher: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validation
    if (!username || !email || !password || !firstName || !lastName) {
      res.status(400).json({ success: false, message: "All fields are required" });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      res.status(400).json({ success: false, message: "Username or email already exists" });
      return;
    }

    // Create teacher
    const teacher = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: "teacher",
    });

    await teacher.save();

    res.status(201).json({
      success: true,
      message: "Teacher added successfully",
      data: teacher.toJSON(),
    });
  } catch (error) {
    console.error("Error adding teacher:", error);
    res.status(500).json({ success: false, message: "Error adding teacher" });
  }
};

// Get attendance reports for a teacher
export const getTeacherReport: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { teacherId } = req.params;

    const report = await Attendance.find({ teacherId })
      .populate("studentId", "firstName lastName username")
      .populate("classId", "name")
      .sort({ date: -1 });

    // Calculate statistics
    const totalRecords = report.length;
    const presentCount = report.filter((r) => r.status === "present").length;
    const absentCount = report.filter((r) => r.status === "absent").length;
    const lateCount = report.filter((r) => r.status === "late").length;

    res.json({
      success: true,
      data: {
        records: report,
        statistics: {
          total: totalRecords,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          presentPercentage: totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(2) : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ success: false, message: "Error fetching report" });
  }
};

// Get all attendance records (admin overview)
export const getAllAttendanceRecords: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const records = await Attendance.find()
      .populate("studentId", "firstName lastName username")
      .populate("classId", "name")
      .populate("teacherId", "firstName lastName")
      .sort({ date: -1 })
      .limit(100);

    res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ success: false, message: "Error fetching records" });
  }
};

// Delete teacher
export const deleteTeacher: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { teacherId } = req.params;

    await User.findByIdAndDelete(teacherId);

    res.json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ success: false, message: "Error deleting teacher" });
  }
};

// Routes
router.get("/teachers", getAllTeachers);
router.post("/teachers", addTeacher);
router.get("/teachers/:teacherId/report", getTeacherReport);
router.delete("/teachers/:teacherId", deleteTeacher);
router.get("/attendance", getAllAttendanceRecords);

export default router;
