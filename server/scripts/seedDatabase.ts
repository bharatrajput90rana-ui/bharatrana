import "dotenv/config";
import { connectDB, disconnectDB } from "../db";
import User from "../models/User";
import Class from "../models/Class";
import Attendance from "../models/Attendance";

async function seedDatabase() {
  try {
    await connectDB();
    console.log("📦 Starting database seeding...");

    // Clear existing data (optional - comment out if you want to preserve data)
    // await User.deleteMany({});
    // await Class.deleteMany({});
    // await Attendance.deleteMany({});

    // Create admin user
    const admin = new User({
      username: "admin",
      email: "admin@attendancehub.com",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });
    await admin.save();
    console.log("✓ Admin user created");

    // Create teacher users
    const teacher1 = new User({
      username: "teacher1",
      email: "teacher1@attendancehub.com",
      password: "teacher123",
      firstName: "John",
      lastName: "Doe",
      role: "teacher",
    });
    await teacher1.save();
    console.log("✓ Teacher 1 created");

    const teacher2 = new User({
      username: "teacher2",
      email: "teacher2@attendancehub.com",
      password: "teacher123",
      firstName: "Jane",
      lastName: "Smith",
      role: "teacher",
    });
    await teacher2.save();
    console.log("✓ Teacher 2 created");

    // Create student users
    const students = [];
    for (let i = 1; i <= 10; i++) {
      const student = new User({
        username: `student${i}`,
        email: `student${i}@attendancehub.com`,
        password: "student123",
        firstName: `Student`,
        lastName: `${i}`,
        role: "student",
        teacherId: teacher1._id,
      });
      await student.save();
      students.push(student);
    }
    console.log("✓ 10 students created");

    // Create classes
    const class1 = new Class({
      name: "Mathematics 101",
      description: "Introduction to Calculus",
      teacherId: teacher1._id,
      students: students.slice(0, 5).map((s) => s._id),
      gpsLatitude: 40.7128,
      gpsLongitude: -74.006,
      gpsAccuracy: 50,
    });
    await class1.save();
    console.log("✓ Class 1 created");

    const class2 = new Class({
      name: "Physics 201",
      description: "Advanced Mechanics",
      teacherId: teacher2._id,
      students: students.slice(5, 10).map((s) => s._id),
      gpsLatitude: 40.7149,
      gpsLongitude: -74.0072,
      gpsAccuracy: 50,
    });
    await class2.save();
    console.log("✓ Class 2 created");

    // Create attendance records
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Class 1 attendance
      for (const student of students.slice(0, 5)) {
        const attendance = new Attendance({
          studentId: student._id,
          classId: class1._id,
          teacherId: teacher1._id,
          date,
          status: Math.random() > 0.2 ? "present" : "absent",
          qrScanned: true,
          gpsMasched: Math.random() > 0.1,
          faceMatched: Math.random() > 0.1,
          faceConfidence: Math.random() * 0.5 + 0.5,
          markedAt: date,
        });
        await attendance.save();
      }

      // Class 2 attendance
      for (const student of students.slice(5, 10)) {
        const attendance = new Attendance({
          studentId: student._id,
          classId: class2._id,
          teacherId: teacher2._id,
          date,
          status: Math.random() > 0.15 ? "present" : "absent",
          qrScanned: true,
          gpsMasched: Math.random() > 0.1,
          faceMatched: Math.random() > 0.05,
          faceConfidence: Math.random() * 0.4 + 0.6,
          markedAt: date,
        });
        await attendance.save();
      }
    }
    console.log("✓ Attendance records created");

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📋 Demo Credentials:");
    console.log("  Admin: admin / admin123");
    console.log("  Teacher 1: teacher1 / teacher123");
    console.log("  Teacher 2: teacher2 / teacher123");
    console.log("  Students: student1-student10 / student123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await disconnectDB();
  }
}

seedDatabase();
