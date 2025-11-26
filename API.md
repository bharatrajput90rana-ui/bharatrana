# AttendanceHub API Documentation

Complete API reference for the AttendanceHub attendance management system.

## Base URL
```
http://localhost:8080/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

Tokens are obtained by logging in and are valid for 7 days.

---

## Authentication Endpoints

### Register User
Create a new user account.

**Endpoint:** `POST /auth/register`

**Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "admin|teacher|student",
  "teacherId": "string (optional, for students)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "username": "string",
    "email": "string",
    "role": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

### Login
Authenticate user and get JWT token.

**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "username": "string",
    "email": "string",
    "role": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

### Verify Token
Verify and get current user from token.

**Endpoint:** `GET /auth/verify`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "message": "Token verified",
  "user": {
    "id": "user_id",
    "username": "string",
    "email": "string",
    "role": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

---

## Admin Endpoints

All endpoints require `Authorization` header with admin role token.

### Get All Teachers
List all teacher accounts.

**Endpoint:** `GET /admin/teachers`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "teacher_id",
      "username": "teacher1",
      "email": "teacher1@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "teacher",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Add New Teacher
Create a new teacher account.

**Endpoint:** `POST /admin/teachers`

**Body:**
```json
{
  "username": "teacher1",
  "email": "teacher1@example.com",
  "password": "secure_password",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Teacher added successfully",
  "data": {
    "_id": "teacher_id",
    "username": "teacher1",
    "email": "teacher1@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "teacher"
  }
}
```

### Delete Teacher
Remove a teacher account.

**Endpoint:** `DELETE /admin/teachers/:teacherId`

**Response:**
```json
{
  "success": true,
  "message": "Teacher deleted successfully"
}
```

### Get Teacher Report
View attendance report for a specific teacher.

**Endpoint:** `GET /admin/teachers/:teacherId/report`

**Response:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "_id": "record_id",
        "studentId": {
          "firstName": "John",
          "lastName": "Doe",
          "username": "student1"
        },
        "classId": {
          "name": "Mathematics 101"
        },
        "date": "2024-01-15T00:00:00.000Z",
        "status": "present"
      }
    ],
    "statistics": {
      "total": 50,
      "present": 45,
      "absent": 3,
      "late": 2,
      "presentPercentage": "90.00"
    }
  }
}
```

### Get All Attendance Records
View all attendance records across the system.

**Endpoint:** `GET /admin/attendance`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "record_id",
      "studentId": {
        "_id": "student_id",
        "firstName": "John",
        "lastName": "Doe"
      },
      "classId": {
        "_id": "class_id",
        "name": "Mathematics 101"
      },
      "teacherId": {
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "date": "2024-01-15T00:00:00.000Z",
      "status": "present"
    }
  ]
}
```

---

## Teacher Endpoints

All endpoints require `Authorization` header with teacher role token.

### Create Class
Create a new class.

**Endpoint:** `POST /teacher/classes`

**Body:**
```json
{
  "name": "Mathematics 101",
  "description": "Introduction to Calculus"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Class created successfully",
  "data": {
    "_id": "class_id",
    "name": "Mathematics 101",
    "description": "Introduction to Calculus",
    "teacherId": "teacher_id",
    "students": [],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get All Classes
List all classes for the teacher.

**Endpoint:** `GET /teacher/classes`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "class_id",
      "name": "Mathematics 101",
      "description": "Introduction to Calculus",
      "teacherId": "teacher_id",
      "students": ["student_id_1", "student_id_2"],
      "qrCode": "data:image/png;base64,...",
      "gpsLatitude": 40.7128,
      "gpsLongitude": -74.006,
      "gpsAccuracy": 50
    }
  ]
}
```

### Get Class Details
Get detailed information about a specific class.

**Endpoint:** `GET /teacher/classes/:classId`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "class_id",
    "name": "Mathematics 101",
    "description": "Introduction to Calculus",
    "teacherId": "teacher_id",
    "students": [
      {
        "_id": "student_id_1",
        "firstName": "John",
        "lastName": "Doe",
        "username": "student1",
        "email": "student1@example.com"
      }
    ],
    "qrCode": "data:image/png;base64,...",
    "gpsLatitude": 40.7128,
    "gpsLongitude": -74.006
  }
}
```

### Add Student to Class
Add an existing student to a class.

**Endpoint:** `POST /teacher/classes/:classId/students`

**Body:**
```json
{
  "studentId": "student_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student added to class",
  "data": {
    "_id": "class_id",
    "name": "Mathematics 101",
    "students": ["student_id_1", "student_id_2"],
    "teacherId": "teacher_id"
  }
}
```

### Create Multiple Students
Bulk create student accounts and enroll them in a class.

**Endpoint:** `POST /teacher/classes/:classId/create-students`

**Body:**
```json
{
  "students": [
    {
      "username": "student1",
      "email": "student1@example.com",
      "password": "password123",
      "firstName": "John",
      "lastName": "Doe"
    },
    {
      "username": "student2",
      "email": "student2@example.com",
      "password": "password123",
      "firstName": "Jane",
      "lastName": "Smith"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 students created",
  "data": [
    {
      "id": "student_id_1",
      "username": "student1",
      "firstName": "John",
      "lastName": "Doe"
    }
  ]
}
```

### Generate QR Code
Generate a QR code for the class.

**Endpoint:** `POST /teacher/classes/:classId/qrcode`

**Response:**
```json
{
  "success": true,
  "message": "QR code generated",
  "data": {
    "classId": "class_id",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### Set GPS Coordinates
Set the GPS location for the class.

**Endpoint:** `POST /teacher/classes/:classId/gps`

**Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.006,
  "accuracy": 50
}
```

**Response:**
```json
{
  "success": true,
  "message": "GPS coordinates set",
  "data": {
    "classId": "class_id",
    "gpsLatitude": 40.7128,
    "gpsLongitude": -74.006,
    "gpsAccuracy": 50
  }
}
```

### Get Class Analytics
View attendance analytics for a class.

**Endpoint:** `GET /teacher/classes/:classId/analytics`

**Response:**
```json
{
  "success": true,
  "data": {
    "className": "Mathematics 101",
    "totalStudents": 30,
    "studentAnalytics": [
      {
        "studentId": "student_id",
        "name": "John Doe",
        "present": 25,
        "absent": 3,
        "late": 2,
        "total": 30
      }
    ],
    "dailyAnalytics": [
      {
        "date": "2024-01-15",
        "present": 28,
        "absent": 1,
        "late": 1
      }
    ],
    "totalRecords": 150
  }
}
```

---

## Student Endpoints

All endpoints require `Authorization` header with student role token.

### Get Enrolled Classes
List all classes the student is enrolled in.

**Endpoint:** `GET /student/classes`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "class_id",
      "name": "Mathematics 101",
      "description": "Introduction to Calculus",
      "teacherId": {
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "qrCode": "data:image/png;base64,...",
      "gpsLatitude": 40.7128,
      "gpsLongitude": -74.006
    }
  ]
}
```

### Get Class Details
Get details about a specific class.

**Endpoint:** `GET /student/classes/:classId`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "class_id",
    "name": "Mathematics 101",
    "description": "Introduction to Calculus",
    "teacherId": {
      "_id": "teacher_id",
      "firstName": "Jane",
      "lastName": "Smith",
      "username": "teacher1"
    },
    "qrCode": "data:image/png;base64,...",
    "gpsLatitude": 40.7128,
    "gpsLongitude": -74.006,
    "gpsAccuracy": 50
  }
}
```

### Upload Face Data
Upload profile photo and face embedding for biometric authentication.

**Endpoint:** `POST /student/face-data`

**Body:**
```json
{
  "profilePhoto": "data:image/jpeg;base64,...",
  "faceEmbedding": [0.123, 0.456, ...],
  "descriptors": [[0.123, 0.456, ...]]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Face data saved successfully",
  "data": {
    "userId": "student_id",
    "hasFaceData": true
  }
}
```

### Get Face Data
Retrieve stored face data.

**Endpoint:** `GET /student/face-data`

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "student_id",
    "profilePhoto": "data:image/jpeg;base64,...",
    "hasFaceData": true
  }
}
```

### Get Face Embedding
Get face embedding for comparison (used internally).

**Endpoint:** `GET /student/face-embedding/:studentId`

**Response:**
```json
{
  "success": true,
  "data": {
    "faceEmbedding": [0.123, 0.456, ...],
    "descriptors": [[0.123, 0.456, ...]]
  }
}
```

### Mark Attendance
Record attendance with validation results.

**Endpoint:** `POST /student/classes/:classId/attendance`

**Body:**
```json
{
  "qrScanned": true,
  "gpsMasched": true,
  "faceMatched": true,
  "faceConfidence": 0.85,
  "gpsLatitude": 40.7128,
  "gpsLongitude": -74.006
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked as present",
  "data": {
    "attendanceId": "record_id",
    "status": "present",
    "markedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Attendance History
Retrieve all attendance records for the student.

**Endpoint:** `GET /student/attendance?classId=classId (optional)`

**Response:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "_id": "record_id",
        "classId": {
          "name": "Mathematics 101"
        },
        "date": "2024-01-15T00:00:00.000Z",
        "status": "present",
        "qrScanned": true,
        "gpsMasched": true,
        "faceMatched": true,
        "faceConfidence": 0.85
      }
    ],
    "statistics": {
      "total": 20,
      "present": 18,
      "absent": 1,
      "late": 1,
      "presentPercentage": "90.00"
    }
  }
}
```

### Get Weekly Statistics
Get attendance statistics for the last 7 days.

**Endpoint:** `GET /student/stats/weekly?classId=classId (optional)`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "status": "present",
      "className": "Mathematics 101"
    },
    {
      "date": "2024-01-14",
      "status": "present",
      "className": "Physics 201"
    }
  ]
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

### Error Examples

**Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

**Missing Token:**
```json
{
  "success": false,
  "message": "No token provided"
}
```

**Access Denied:**
```json
{
  "success": false,
  "message": "Access denied"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. In production, it's recommended to add rate limiting middleware.

## CORS

CORS is enabled for all origins during development. In production, restrict to specific domains.

## Pagination

Certain endpoints support pagination via query parameters:

```
GET /endpoint?page=1&limit=20
```

(Currently not fully implemented - future enhancement)

---

## Example Requests

### Login Example
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher1",
    "password": "teacher123"
  }'
```

### Create Class Example
```bash
curl -X POST http://localhost:8080/api/teacher/classes \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mathematics 101",
    "description": "Introduction to Calculus"
  }'
```

### Mark Attendance Example
```bash
curl -X POST http://localhost:8080/api/student/classes/<CLASS_ID>/attendance \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "qrScanned": true,
    "gpsMasched": true,
    "faceMatched": true,
    "faceConfidence": 0.85,
    "gpsLatitude": 40.7128,
    "gpsLongitude": -74.006
  }'
```

---

**API Documentation - AttendanceHub**
Last Updated: January 2024
