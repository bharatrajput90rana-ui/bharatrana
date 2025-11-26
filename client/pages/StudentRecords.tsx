import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, TrendingUp, Calendar, AlertCircle } from "lucide-react";

interface AttendanceRecord {
  _id: string;
  classId: {
    name: string;
  };
  date: string;
  status: "present" | "absent" | "late";
  qrScanned: boolean;
  gpsMasched: boolean;
  faceMatched: boolean;
}

interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  presentPercentage: number;
}

interface WeeklyStats {
  date: string;
  status: "present" | "absent" | "late";
  className: string;
}

export default function StudentRecords() {
  const { token } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch classes
      const classRes = await fetch("/api/student/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (classRes.ok) {
        const classData = await classRes.json();
        setClasses(classData.data);
      }

      // Fetch attendance records
      const recordsRes = await fetch("/api/student/attendance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (recordsRes.ok) {
        const data = await recordsRes.json();
        setRecords(data.data.records);
        setStats(data.data.statistics);
      }

      // Fetch weekly stats
      const weeklyRes = await fetch("/api/student/stats/weekly", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (weeklyRes.ok) {
        const data = await weeklyRes.json();
        setWeeklyStats(data.data);
      }
    } catch (err) {
      setError("Failed to fetch records");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "absent":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "late":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500/10 border-green-500/20";
      case "absent":
        return "bg-destructive/10 border-destructive/20";
      case "late":
        return "bg-yellow-500/10 border-yellow-500/20";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Attendance Records">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground/60">Loading your records...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Attendance Records">
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-foreground/70">Present</h3>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.present}</p>
              <p className="text-xs text-foreground/60 mt-1">out of {stats.total}</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-foreground/70">Absent</h3>
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.absent}</p>
              <p className="text-xs text-foreground/60 mt-1">
                {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}%
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-foreground/70">Late</h3>
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.late}</p>
              <p className="text-xs text-foreground/60 mt-1">
                {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}%
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-foreground/70">Attendance %</h3>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.presentPercentage}%</p>
              <p className="text-xs text-foreground/60 mt-1">overall</p>
            </Card>
          </div>
        )}

        {/* Class Filter */}
        <div>
          <p className="text-sm font-medium text-foreground/70 mb-2">Filter by Class</p>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setFilterClass("")}
              variant={filterClass === "" ? "default" : "outline"}
              className={filterClass === "" ? "bg-primary hover:bg-primary/90" : ""}
              size="sm"
            >
              All Classes
            </Button>
            {classes.map((c) => (
              <Button
                key={c._id}
                onClick={() => setFilterClass(c._id)}
                variant={filterClass === c._id ? "default" : "outline"}
                className={filterClass === c._id ? "bg-primary hover:bg-primary/90" : ""}
                size="sm"
              >
                {c.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Weekly Attendance Chart */}
        {weeklyStats.length > 0 && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-accent" />
              Last 7 Days
            </h2>
            <div className="space-y-3">
              {weeklyStats.map((day, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-background/80 transition">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(day.status)}
                    <div>
                      <p className="font-medium text-foreground">{day.date}</p>
                      <p className="text-xs text-foreground/60">{day.className}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(day.status)}`}>
                    {day.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Full Attendance Records */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Detailed Records</h2>
          <div className="space-y-2">
            {records.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                <p className="text-foreground/60">No attendance records yet</p>
              </div>
            ) : (
              records.map((record) => (
                <div
                  key={record._id}
                  className={`p-4 rounded-lg border flex items-center justify-between ${getStatusColor(record.status)}`}
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="font-medium text-foreground">{record.classId.name}</p>
                      <p className="text-sm text-foreground/60">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground capitalize">{record.status}</p>
                    <div className="text-xs text-foreground/60 space-y-1">
                      <p>QR: {record.qrScanned ? "✓" : "✗"}</p>
                      <p>GPS: {record.gpsMasched ? "✓" : "✗"}</p>
                      <p>Face: {record.faceMatched ? "✓" : "✗"}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
