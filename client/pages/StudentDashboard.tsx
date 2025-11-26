import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckSquare, AlertCircle, Clock } from "lucide-react";

interface StudentClass {
  _id: string;
  name: string;
  description: string;
  teacherId: {
    firstName: string;
    lastName: string;
  };
  qrCode?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
}

export default function StudentDashboard() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState<StudentClass | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<any>(null);

  useEffect(() => {
    fetchClasses();
  }, [token]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data.data);
      } else {
        setError("Failed to fetch classes");
      }
    } catch (err) {
      setError("Error fetching classes");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (classId: string) => {
    // This will show the attendance marking modal/form
    const classData = classes.find((c) => c._id === classId);
    setSelectedClass(classData || null);
  };

  return (
    <DashboardLayout title="Mark Attendance">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Classes</h1>
          <p className="text-foreground/60 mt-2">Select a class to mark attendance</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {/* Classes Grid */}
        <div className="grid gap-4">
          {loading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-2"></div>
              <p className="text-foreground/60">Loading your classes...</p>
            </Card>
          ) : classes.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckSquare className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
              <p className="text-foreground/60 mb-4">You are not enrolled in any classes yet</p>
            </Card>
          ) : (
            classes.map((classItem) => (
              <Card key={classItem._id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">{classItem.name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-foreground/60">
                      <p>
                        Teacher: {classItem.teacherId.firstName} {classItem.teacherId.lastName}
                      </p>
                      {classItem.description && <p>{classItem.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleMarkAttendance(classItem._id)}
                      className="bg-primary hover:bg-primary/90 gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Mark Attendance
                    </Button>
                  </div>
                </div>

                {/* Status Info */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="grid md:grid-cols-3 gap-4 text-xs text-foreground/60">
                    <div>
                      <p className="text-foreground/60 font-medium">QR Code Required</p>
                      {classItem.qrCode ? "✓" : "Not set"}
                    </div>
                    <div>
                      <p className="text-foreground/60 font-medium">GPS Required</p>
                      {classItem.gpsLatitude ? "✓" : "Not set"}
                    </div>
                    <div>
                      <p className="text-foreground/60 font-medium">Face Recognition Required</p>
                      Required
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Attendance Modal Placeholder */}
        {selectedClass && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Mark Attendance - {selectedClass.name}
              </h2>
              <p className="text-foreground/60 mb-6">
                Complete all three verification steps to mark your attendance
              </p>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="font-semibold text-foreground mb-2">Step 1: Scan QR Code</p>
                  <p className="text-sm text-foreground/60">
                    Use your camera to scan the QR code provided by your teacher
                  </p>
                  <Button size="sm" className="mt-3 bg-primary hover:bg-primary/90" disabled>
                    Open QR Scanner (coming soon)
                  </Button>
                </div>

                <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
                  <p className="font-semibold text-foreground mb-2">Step 2: Face Recognition</p>
                  <p className="text-sm text-foreground/60">
                    Your face will be verified against your profile photo
                  </p>
                  <Button size="sm" className="mt-3 bg-secondary hover:bg-secondary/90" disabled>
                    Start Face Recognition (coming soon)
                  </Button>
                </div>

                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="font-semibold text-foreground mb-2">Step 3: GPS Validation</p>
                  <p className="text-sm text-foreground/60">
                    Your location will be verified to be within the class area
                  </p>
                  <Button size="sm" className="mt-3 bg-accent hover:bg-accent/90" disabled>
                    Enable GPS (coming soon)
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedClass(null)}
                >
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
