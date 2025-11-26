# AttendanceHub - Complete Setup Guide

Welcome to AttendanceHub, a comprehensive attendance management system with face recognition, QR codes, and GPS validation.

## Prerequisites

- Local MongoDB running on `mongodb://localhost:27017`
- Node.js 16+ and pnpm
- Modern web browser with camera and location access

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Update the variables if needed:

```env
MONGODB_URI=mongodb://localhost:27017/attendance-system
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
NODE_ENV=development
FACE_MATCH_THRESHOLD=0.6
LIVENESS_CHECK_ENABLED=true
GPS_ACCURACY_THRESHOLD_METERS=50
```

### 3. Seed Demo Data (Optional)

To populate the database with demo users and data:

```bash
pnpm seed
```

This creates:
- 1 Admin account
- 2 Teachers with classes
- 10 Students with attendance records

### 4. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:8080`

## Demo Credentials

After seeding the database, use these credentials to test each role:

### Admin Login
- Username: `admin`
- Password: `admin123`

### Teacher Login
- Username: `teacher1` or `teacher2`
- Password: `teacher123`

### Student Login
- Username: `student1` to `student10`
- Password: `student123`

## System Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with React Router 6
- **Styling**: TailwindCSS 3
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Context + React Query
- **Face Recognition**: face-api.js (TensorFlow.js)
- **QR Code**: Integrated scanner component
- **GPS**: Browser Geolocation API

### Backend (Express + MongoDB)
- **Server**: Express 5
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt password hashing
- **API**: RESTful endpoints with role-based access control

### Key Features

#### Admin Dashboard
- Create and manage teachers
- View system-wide attendance reports
- Monitor teacher performance
- Manage all attendance records

#### Teacher Dashboard
- Create multiple classes
- Add and manage students
- Generate QR codes for classes
- Set GPS coordinates for class locations
- View detailed analytics per class and student
- Monitor daily attendance trends

#### Student Dashboard
- View enrolled classes
- Mark attendance with three-step verification:
  1. **QR Code Scanning** - Verify class session
  2. **Face Recognition** - Biometric verification with liveness detection
  3. **GPS Validation** - Confirm physical location
- View attendance history and statistics
- Track weekly attendance trends

## Technology Stack

### Core Technologies
- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Express.js, MongoDB, Mongoose
- **Authentication**: JWT + bcryptjs
- **AI/ML**: face-api.js (TensorFlow.js)

### Key Libraries
- **UI**: Radix UI, shadcn/ui, TailwindCSS
- **Icons**: Lucide React
- **Forms**: React Hook Form, Zod validation
- **HTTP**: Fetch API, React Query
- **QR**: QRCode library
- **Utilities**: date-fns, clsx, tailwind-merge

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Admin Routes
- `GET /api/admin/teachers` - Get all teachers
- `POST /api/admin/teachers` - Add new teacher
- `DELETE /api/admin/teachers/:teacherId` - Delete teacher
- `GET /api/admin/teachers/:teacherId/report` - Get teacher report
- `GET /api/admin/attendance` - Get all attendance records

### Teacher Routes
- `POST /api/teacher/classes` - Create class
- `GET /api/teacher/classes` - Get all classes
- `GET /api/teacher/classes/:classId` - Get class details
- `POST /api/teacher/classes/:classId/students` - Add student to class
- `POST /api/teacher/classes/:classId/create-students` - Bulk create students
- `POST /api/teacher/classes/:classId/qrcode` - Generate QR code
- `POST /api/teacher/classes/:classId/gps` - Set GPS coordinates
- `GET /api/teacher/classes/:classId/analytics` - Get class analytics

### Student Routes
- `GET /api/student/classes` - Get enrolled classes
- `GET /api/student/classes/:classId` - Get class details
- `POST /api/student/face-data` - Upload face data
- `GET /api/student/face-data` - Get face data
- `POST /api/student/classes/:classId/attendance` - Mark attendance
- `GET /api/student/attendance` - Get attendance history
- `GET /api/student/stats/weekly` - Get weekly statistics

## Database Models

### User
- username, email, password, role
- firstName, lastName
- teacherId (for students)

### Class
- name, description, teacherId
- students (array)
- qrCode, gpsLatitude, gpsLongitude

### Attendance
- studentId, classId, teacherId, date
- status (present/absent/late)
- qrScanned, gpsMasched, faceMatched
- faceConfidence, gpsLatitude, gpsLongitude

### FaceData
- userId, profilePhoto
- faceEmbedding, descriptors
- livenessScore

## Building for Production

### Build
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

### Create Executable Binary
The project supports creating self-contained binaries using `pkg`:
```bash
pnpm build
pkg dist/server/node-build.mjs --targets node18-linux-x64,node18-macos-x64,node18-win-x64
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally: `mongosh`
- Check MONGODB_URI in `.env`
- Verify database exists: `show dbs` in MongoDB shell

### Camera Permission Denied
- Check browser permission settings
- Ensure HTTPS (or localhost for HTTP)
- Test with different browser if issues persist

### Face Recognition Not Working
- Requires good lighting
- Face should be clearly visible
- Camera resolution should be at least 640x480
- Models load from face-api.js (TensorFlow.js)

### JWT Token Expired
- Token validity: 7 days
- Log in again to get new token
- Token stored in localStorage

## Development Tips

### File Structure
```
├── client/                 # React frontend
│   ├── pages/             # Route components
│   ├── components/        # Reusable components
│   ├── context/           # React context (auth)
│   ├── lib/               # Utilities
│   └── global.css         # Tailwind styles
├── server/                # Express backend
│   ├── routes/            # API routes
│   ├── models/            # MongoDB models
│   ├── middleware/        # Auth middleware
│   └── scripts/           # Utility scripts
├── shared/                # Shared types
└── public/                # Static assets
```

### Adding New Features
1. Create API routes in `server/routes/`
2. Define data models in `server/models/`
3. Create React components in `client/components/`
4. Add pages in `client/pages/`
5. Update routes in `client/App.tsx`

## Support & Documentation

For more information, check:
- AGENTS.md - Project overview and architecture
- Individual component files have inline documentation
- MongoDB documentation: https://docs.mongodb.com
- React documentation: https://react.dev
- Express documentation: https://expressjs.com

## Security Notes

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Validate all user inputs
- Hash passwords with bcrypt (automatic)
- Implement rate limiting for production
- Secure MongoDB with authentication

## Performance Optimization

- Database indexes on userId, classId, date
- Lazy loading of components
- Optimized images and assets
- Caching with React Query
- Code splitting with Vite

---

**Happy Attendance Tracking! 🎓**
