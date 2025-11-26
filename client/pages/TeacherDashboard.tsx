import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, AlertCircle } from "lucide-react";

interface Class {
  _id: string;
  name: string;
  description: string;
  students: any[];
  qrCode?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
}

export default function TeacherDashboard() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchClasses();
  }, [token]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/teacher/classes", {
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

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/teacher/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: "", description: "" });
        setShowAddForm(false);
        fetchClasses();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to add class");
      }
    } catch (err) {
      setError("Error adding class");
    }
  };

  return (
    <DashboardLayout title="My Classes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Classes</h1>
            <p className="text-foreground/60 mt-2">
              Create and manage your classes
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Plus className="w-4 h-4" />
            New Class
          </Button>
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

        {/* Add Class Form */}
        {showAddForm && (
          <Card className="p-6 border-primary/30 bg-primary/5">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Create New Class
            </h2>
            <form onSubmit={handleAddClass} className="space-y-4">
              <Input
                placeholder="Class Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <Input
                placeholder="Description (Optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Create Class
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Classes List */}
        <div className="grid gap-4">
          {loading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-2"></div>
              <p className="text-foreground/60">Loading classes...</p>
            </Card>
          ) : classes.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
              <p className="text-foreground/60 mb-4">No classes yet</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-primary hover:bg-primary/90"
              >
                Create First Class
              </Button>
            </Card>
          ) : (
            classes.map((classItem) => (
              <Card
                key={classItem._id}
                className="p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {classItem.name}
                    </h3>
                    {classItem.description && (
                      <p className="text-sm text-foreground/60 mt-1">
                        {classItem.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {classItem.students.length} Students
                    </p>
                    <p className="text-xs text-foreground/60">Enrolled</p>
                  </div>
                </div>

                <div className="bg-background/50 rounded-lg p-4 mb-4">
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-foreground/60">QR Code</p>
                      <p className="text-foreground font-medium">
                        {classItem.qrCode ? "Generated ✓" : "Not Generated"}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground/60">GPS Set</p>
                      <p className="text-foreground font-medium">
                        {classItem.gpsLatitude ? "Configured ✓" : "Not Set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground/60">Class ID</p>
                      <p className="text-foreground font-mono text-xs">
                        {classItem._id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Navigate to class details
                    }}
                  >
                    Manage Students
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Navigate to generate QR
                    }}
                  >
                    {classItem.qrCode ? "Update" : "Generate"} QR Code
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Navigate to set GPS
                    }}
                  >
                    Set GPS
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Navigate to analytics
                    }}
                  >
                    View Analytics
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
