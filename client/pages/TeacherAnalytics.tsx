import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, TrendingUp, Calendar, AlertCircle } from "lucide-react";

interface StudentAnalytics {
  studentId: string;
  name: string;
  present: number;
  absent: number;
  late: number;
  total: number;
}

interface DailyAnalytics {
  date: string;
  present: number;
  absent: number;
  late: number;
}

interface ClassAnalytics {
  className: string;
  totalStudents: number;
  studentAnalytics: StudentAnalytics[];
  dailyAnalytics: DailyAnalytics[];
  totalRecords: number;
}

export default function TeacherAnalytics() {
  const { token } = useAuth();
  const [selectedClass, setSelectedClass] = useState("");
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClasses();
  }, [token]);

  useEffect(() => {
    if (selectedClass) {
      fetchAnalytics(selectedClass);
    }
  }, [selectedClass, token]);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/teacher/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data.data);
        if (data.data.length > 0) {
          setSelectedClass(data.data[0]._id);
        }
      }
    } catch (err) {
      setError("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (classId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/classes/${classId}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (err) {
      setError("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Analytics">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground/60">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Class Analytics">
      <div className="space-y-6">
        {/* Class Selection */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Analytics Dashboard</h1>
          <div className="flex gap-2 flex-wrap">
            {classes.map((classItem) => (
              <Button
                key={classItem._id}
                onClick={() => setSelectedClass(classItem._id)}
                variant={selectedClass === classItem._id ? "default" : "outline"}
                className={selectedClass === classItem._id ? "bg-primary hover:bg-primary/90" : ""}
              >
                {classItem.name}
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {analytics && (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-foreground/70">Total Students</h3>
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">{analytics.totalStudents}</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-foreground/70">Total Records</h3>
                  <Calendar className="w-5 h-5 text-secondary" />
                </div>
                <p className="text-3xl font-bold text-foreground">{analytics.totalRecords}</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-foreground/70">Avg Present %</h3>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {analytics.studentAnalytics.length > 0
                    ? Math.round(
                        (analytics.studentAnalytics.reduce((sum, s) => sum + s.present, 0) /
                          analytics.studentAnalytics.reduce((sum, s) => sum + s.total, 0)) *
                          100
                      )
                    : 0}
                  %
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-foreground/70">Analytics</h3>
                  <BarChart3 className="w-5 h-5 text-accent" />
                </div>
                <p className="text-3xl font-bold text-foreground">{analytics.dailyAnalytics.length}</p>
                <p className="text-xs text-foreground/60">days tracked</p>
              </Card>
            </div>

            {/* Student Attendance Table */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Student Attendance</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/50">
                    <tr>
                      <th className="text-left py-3 px-4 text-foreground/70 font-medium">
                        Student Name
                      </th>
                      <th className="text-center py-3 px-4 text-foreground/70 font-medium">
                        Present
                      </th>
                      <th className="text-center py-3 px-4 text-foreground/70 font-medium">
                        Absent
                      </th>
                      <th className="text-center py-3 px-4 text-foreground/70 font-medium">
                        Late
                      </th>
                      <th className="text-center py-3 px-4 text-foreground/70 font-medium">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.studentAnalytics.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-foreground/60">
                          No attendance records yet
                        </td>
                      </tr>
                    ) : (
                      analytics.studentAnalytics.map((student) => {
                        const percentage =
                          student.total > 0
                            ? Math.round((student.present / student.total) * 100)
                            : 0;
                        return (
                          <tr key={student.studentId} className="border-b border-border/30 hover:bg-background/50 transition">
                            <td className="py-3 px-4 text-foreground">{student.name}</td>
                            <td className="text-center py-3 px-4 text-green-600 font-medium">
                              {student.present}
                            </td>
                            <td className="text-center py-3 px-4 text-destructive font-medium">
                              {student.absent}
                            </td>
                            <td className="text-center py-3 px-4 text-yellow-600 font-medium">
                              {student.late}
                            </td>
                            <td className="text-center py-3 px-4">
                              <div className="inline-flex items-center gap-2">
                                <div className="w-24 bg-background rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${percentage >= 75 ? "bg-green-500" : percentage >= 60 ? "bg-yellow-500" : "bg-destructive"}`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="font-medium w-10 text-right">{percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Daily Attendance Chart */}
            {analytics.dailyAnalytics.length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">Daily Attendance Trend</h2>
                <div className="space-y-3">
                  {analytics.dailyAnalytics.slice(-7).map((day) => {
                    const total = day.present + day.absent + day.late;
                    const presentPct = total > 0 ? Math.round((day.present / total) * 100) : 0;
                    return (
                      <div key={day.date}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-foreground">{day.date}</span>
                          <span className="text-xs text-foreground/60">
                            {day.present + day.absent + day.late} total
                          </span>
                        </div>
                        <div className="flex gap-1 h-4 bg-background rounded-full overflow-hidden">
                          <div
                            className="bg-green-500 rounded-full"
                            style={{ width: `${presentPct}%` }}
                            title={`${day.present} present`}
                          />
                          <div
                            className="bg-yellow-500"
                            style={{
                              width: `${total > 0 ? Math.round((day.late / total) * 100) : 0}%`,
                            }}
                            title={`${day.late} late`}
                          />
                          <div
                            className="bg-destructive rounded-r-full"
                            style={{
                              width: `${total > 0 ? Math.round((day.absent / total) * 100) : 0}%`,
                            }}
                            title={`${day.absent} absent`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
