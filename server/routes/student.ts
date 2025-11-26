import { Router, RequestHandler } from "express";
import User from "../models/User";
import Class from "../models/Class";
import Attendance from "../models/Attendance";
import FaceData from "../models/FaceData";
import { AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Get student's classes
export const getStudentClasses: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const studentId = req.userId;

    const classes = await Class.find({ students: studentId }).populate(
      "teacherId",
      "firstName lastName username"
    );

    res.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ success: false, message: "Error fetching classes" });
  }
};

// Get single class details for student
export const getClassDetailsForStudent: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { classId } = req.params;
    const studentId = req.userId;

    const classData = await Class.findOne({
      _id: classId,
      students: studentId,
    }).populate("teacherId", "firstName lastName username");

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

// Upload face data (profile photo + embeddings)
export const uploadFaceData: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { profilePhoto, faceEmbedding, descriptors } = req.body;
    const studentId = req.userId;

    if (!profilePhoto || !faceEmbedding) {
      res.status(400).json({
        success: false,
        message: "Profile photo and face embedding are required",
      });
      return;
    }

    // Check if face data already exists
    let faceData = await FaceData.findOne({ userId: studentId });

    if (faceData) {
      // Update existing face data
      faceData.profilePhoto = profilePhoto;
      faceData.faceEmbedding = faceEmbedding;
      faceData.descriptors = descriptors || [faceEmbedding];
    } else {
      // Create new face data
      faceData = new FaceData({
        userId: studentId,
        profilePhoto,
        faceEmbedding,
        descriptors: descriptors || [faceEmbedding],
      });
    }

    await faceData.save();

    res.json({
      success: true,
      message: "Face data saved successfully",
      data: {
        userId: faceData.userId,
        hasFaceData: true,
      },
    });
  } catch (error) {
    console.error("Error uploading face data:", error);
    res.status(500).json({ success: false, message: "Error uploading face data" });
  }
};

// Get student's face data
export const getFaceData: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const studentId = req.userId;

    const faceData = await FaceData.findOne({ userId: studentId });

    if (!faceData) {
      res.status(404).json({ success: false, message: "Face data not found" });
      return;
    }

    res.json({
      success: true,
      data: {
        userId: faceData.userId,
        profilePhoto: faceData.profilePhoto,
        // Don't send the embedding itself, only indicate it exists
        hasFaceData: true,
      },
    });
  } catch (error) {
    console.error("Error fetching face data:", error);
    res.status(500).json({ success: false, message: "Error fetching face data" });
  }
};

// Get face embedding for comparison (server-side matching)
export const getFaceEmbedding: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { studentId } = req.params;

    const faceData = await FaceData.findOne({ userId: studentId });

    if (!faceData) {
      res.status(404).json({ success: false, message: "Face data not found" });
      return;
    }

    res.json({
      success: true,
      data: {
        faceEmbedding: faceData.faceEmbedding,
        descriptors: faceData.descriptors,
      },
    });
  } catch (error) {
    console.error("Error fetching face embedding:", error);
    res.status(500).json({ success: false, message: "Error fetching face embedding" });
  }
};

// Mark attendance with multi-step validation
export const markAttendance: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { classId } = req.params;
    const { qrScanned, gpsMasched, faceMatched, faceConfidence, gpsLatitude, gpsLongitude } =
      req.body;
    const studentId = req.userId;

    // Validate class
    const classData = await Class.findOne({
      _id: classId,
      students: studentId,
    });

    if (!classData) {
      res.status(404).json({ success: false, message: "Class not found" });
      return;
    }

    // Check if already marked today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      studentId,
      classId,
      date: { $gte: today },
    });

    if (existing && existing.status === "present") {
      res.status(400).json({ success: false, message: "Attendance already marked today" });
      return;
    }

    // Determine status based on validation steps
    let status = "absent";
    let validationsPassed = 0;

    if (qrScanned) validationsPassed++;
    if (gpsMasched) validationsPassed++;
    if (faceMatched) validationsPassed++;

    // Mark as present if at least 2 out of 3 validations pass
    if (validationsPassed >= 2) {
      status = "present";
    } else if (qrScanned) {
      status = "late"; // QR scanned but other checks failed
    }

    // Create or update attendance record
    const attendanceData = {
      studentId,
      classId,
      teacherId: classData.teacherId,
      date: today,
      status,
      qrScanned,
      gpsMasched,
      faceMatched,
      faceConfidence: faceConfidence || null,
      gpsLatitude,
      gpsLongitude,
      markedAt: new Date(),
    };

    let attendance;
    if (existing) {
      attendance = await Attendance.findByIdAndUpdate(existing._id, attendanceData, {
        new: true,
      });
    } else {
      attendance = new Attendance(attendanceData);
      await attendance.save();
    }

    res.json({
      success: true,
      message: `Attendance marked as ${status}`,
      data: {
        attendanceId: attendance._id,
        status: attendance.status,
        markedAt: attendance.markedAt,
      },
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ success: false, message: "Error marking attendance" });
  }
};

// Get student's attendance history
export const getAttendanceHistory: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const studentId = req.userId;
    const { classId } = req.query;

    let query: any = { studentId };
    if (classId) {
      query.classId = classId;
    }

    const records = await Attendance.find(query)
      .populate("classId", "name")
      .sort({ date: -1 });

    // Calculate statistics
    const totalRecords = records.length;
    const presentCount = records.filter((r) => r.status === "present").length;
    const absentCount = records.filter((r) => r.status === "absent").length;
    const lateCount = records.filter((r) => r.status === "late").length;

    res.json({
      success: true,
      data: {
        records,
        statistics: {
          total: totalRecords,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          presentPercentage:
            totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(2) : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    res.status(500).json({ success: false, message: "Error fetching attendance history" });
  }
};

// Get weekly attendance statistics
export const getWeeklyStats: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const studentId = req.userId;
    const { classId } = req.query;

    let query: any = { studentId };
    if (classId) {
      query.classId = classId;
    }

    // Get last 7 days of attendance
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const records = await Attendance.find({
      ...query,
      date: { $gte: sevenDaysAgo },
    }).sort({ date: 1 });

    // Group by date
    const dailyStats: any = {};
    records.forEach((record) => {
      const dateStr = new Date(record.date).toISOString().split("T")[0];
      dailyStats[dateStr] = {
        date: dateStr,
        status: record.status,
        className: record.classId,
      };
    });

    res.json({
      success: true,
      data: Object.values(dailyStats),
    });
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
    res.status(500).json({ success: false, message: "Error fetching weekly stats" });
  }
};

// Routes
router.get("/classes", getStudentClasses);
router.get("/classes/:classId", getClassDetailsForStudent);
router.post("/face-data", uploadFaceData);
router.get("/face-data", getFaceData);
router.get("/face-embedding/:studentId", getFaceEmbedding);
router.post("/classes/:classId/attendance", markAttendance);
router.get("/attendance", getAttendanceHistory);
router.get("/stats/weekly", getWeeklyStats);

export default router;
