import { Router, RequestHandler } from "express";
import User from "../models/User";
import Class from "../models/Class";
import Attendance from "../models/Attendance";
import { AuthenticatedRequest } from "../middleware/auth";
import QRCode from "qrcode";

const router = Router();

// Create a new class
export const createClass: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description } = req.body;
    const teacherId = req.userId;

    if (!name) {
      res.status(400).json({ success: false, message: "Class name is required" });
      return;
    }

    const newClass = new Class({
      name,
      description: description || "",
      teacherId,
      students: [],
    });

    await newClass.save();

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: newClass,
    });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ success: false, message: "Error creating class" });
  }
};

// Get all classes for a teacher
export const getTeacherClasses: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const teacherId = req.userId;

    const classes = await Class.find({ teacherId })
      .populate("students", "firstName lastName username");

    res.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ success: false, message: "Error fetching classes" });
  }
};

// Get single class details
export const getClassDetails: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.userId;

    const classData = await Class.findOne({ _id: classId, teacherId })
      .populate("students", "firstName lastName username email");

    if (!classData) {
      res.status(404).json({ success: false, message: "Class not found" });
      return;
    }

    res.json({
      success: true,
      data: classData,
    });
  } catch (error) {
    console.error("Error fetching class:", error);
    res.status(500).json({ success: false, message: "Error fetching class" });
  }
};

// Add student to class
export const addStudentToClass: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { classId } = req.params;
    const { studentId } = req.body;
    const teacherId = req.userId;

    const classData = await Class.findOne({ _id: classId, teacherId });
    if (!classData) {
      res.status(404).json({ success: false, message: "Class not found" });
      return;
    }

    // Check if student exists
    const student = await User.findOne({ _id: studentId, role: "student", teacherId });
    if (!student) {
      res.status(404).json({ success: false, message: "Student not found" });
      return;
    }

    // Check if student already in class
    if (classData.students.includes(studentId)) {
      res.status(400).json({ success: false, message: "Student already in class" });
      return;
    }

    classData.students.push(studentId as any);
    await classData.save();

    res.json({
      success: true,
      message: "Student added to class",
      data: classData,
    });
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({ success: false, message: "Error adding student" });
  }
};

// Generate QR code for class
export const generateQRCode: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.userId;

    const classData = await Class.findOne({ _id: classId, teacherId });
    if (!classData) {
      res.status(404).json({ success: false, message: "Class not found" });
      return;
    }

    // Generate QR code with class ID and timestamp
    const qrData = JSON.stringify({
      classId: classData._id,
      className: classData.name,
      timestamp: new Date().toISOString(),
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    classData.qrCode = qrCodeDataUrl;
    await classData.save();

    res.json({
      success: true,
      message: "QR code generated",
      data: {
        classId: classData._id,
        qrCode: qrCodeDataUrl,
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ success: false, message: "Error generating QR code" });
  }
};

// Set GPS coordinates for a class
export const setGPSCoordinates: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { classId } = req.params;
    const { latitude, longitude, accuracy } = req.body;
    const teacherId = req.userId;

    if (latitude === undefined || longitude === undefined) {
      res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
      return;
    }

    const classData = await Class.findOne({ _id: classId, teacherId });
    if (!classData) {
      res.status(404).json({ success: false, message: "Class not found" });
      return;
    }

    classData.gpsLatitude = latitude;
    classData.gpsLongitude = longitude;
    classData.gpsAccuracy = accuracy || 50;

    await classData.save();

    res.json({
      success: true,
      message: "GPS coordinates set",
      data: {
        classId: classData._id,
        gpsLatitude: classData.gpsLatitude,
        gpsLongitude: classData.gpsLongitude,
        gpsAccuracy: classData.gpsAccuracy,
      },
    });
  } catch (error) {
    console.error("Error setting GPS:", error);
    res.status(500).json({ success: false, message: "Error setting GPS" });
  }
};

// Get analytics for a class
export const getClassAnalytics: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.userId;

    const classData = await Class.findOne({ _id: classId, teacherId });
    if (!classData) {
      res.status(404).json({ success: false, message: "Class not found" });
      return;
    }

    // Get attendance records for the class
    const records = await Attendance.find({ classId }).populate(
      "studentId",
      "firstName lastName"
    );

    // Calculate analytics
    const studentAnalytics: any = {};
    records.forEach((record) => {
      const studentId = record.studentId.toString();
      if (!studentAnalytics[studentId]) {
        studentAnalytics[studentId] = {
          studentId: record.studentId,
          name: `${(record.studentId as any).firstName} ${(record.studentId as any).lastName}`,
          present: 0,
          absent: 0,
          late: 0,
          total: 0,
        };
      }
      studentAnalytics[studentId][record.status]++;
      studentAnalytics[studentId].total++;
    });

    // Daily analytics
    const dailyAnalytics: any = {};
    records.forEach((record) => {
      const dateStr = new Date(record.date).toISOString().split("T")[0];
      if (!dailyAnalytics[dateStr]) {
        dailyAnalytics[dateStr] = {
          date: dateStr,
          present: 0,
          absent: 0,
          late: 0,
        };
      }
      dailyAnalytics[dateStr][record.status]++;
    });

    res.json({
      success: true,
      data: {
        className: classData.name,
        totalStudents: classData.students.length,
        studentAnalytics: Object.values(studentAnalytics),
        dailyAnalytics: Object.values(dailyAnalytics).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
        totalRecords: records.length,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ success: false, message: "Error fetching analytics" });
  }
};

// Create students for a class
export const createStudents: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { classId } = req.params;
    const { students } = req.body; // Array of {username, email, password, firstName, lastName}
    const teacherId = req.userId;

    const classData = await Class.findOne({ _id: classId, teacherId });
    if (!classData) {
      res.status(404).json({ success: false, message: "Class not found" });
      return;
    }

    if (!Array.isArray(students) || students.length === 0) {
      res.status(400).json({ success: false, message: "Students array is required" });
      return;
    }

    const createdStudents = [];
    for (const studentData of students) {
      // Check if student already exists
      const existing = await User.findOne({
        $or: [{ username: studentData.username }, { email: studentData.email }],
      });

      if (!existing) {
        const newStudent = new User({
          ...studentData,
          role: "student",
          teacherId,
        });
        await newStudent.save();
        createdStudents.push(newStudent);
        classData.students.push(newStudent._id);
      }
    }

    await classData.save();

    res.status(201).json({
      success: true,
      message: `${createdStudents.length} students created`,
      data: createdStudents.map((s) => ({
        id: s._id,
        username: s.username,
        firstName: s.firstName,
        lastName: s.lastName,
      })),
    });
  } catch (error) {
    console.error("Error creating students:", error);
    res.status(500).json({ success: false, message: "Error creating students" });
  }
};

// Routes
router.post("/classes", createClass);
router.get("/classes", getTeacherClasses);
router.get("/classes/:classId", getClassDetails);
router.post("/classes/:classId/students", addStudentToClass);
router.post("/classes/:classId/create-students", createStudents);
router.post("/classes/:classId/qrcode", generateQRCode);
router.post("/classes/:classId/gps", setGPSCoordinates);
router.get("/classes/:classId/analytics", getClassAnalytics);

export default router;
