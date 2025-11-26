import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Plus, Trash2, BarChart3, AlertCircle } from "lucide-react";

interface Teacher {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  // Fetch all teachers
  useEffect(() => {
    fetchTeachers();
  }, [token]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data.data);
      } else {
        setError("Failed to fetch teachers");
      }
    } catch (err) {
      setError("Error fetching teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ username: "", email: "", password: "", firstName: "", lastName: "" });
        setShowAddForm(false);
        fetchTeachers();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to add teacher");
      }
    } catch (err) {
      setError("Error adding teacher");
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      try {
        const response = await fetch(`/api/admin/teachers/${teacherId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          fetchTeachers();
        } else {
          setError("Failed to delete teacher");
        }
      } catch (err) {
        setError("Error deleting teacher");
      }
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manage Teachers</h1>
            <p className="text-foreground/60 mt-2">Create and manage teacher accounts</p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
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

        {/* Add Teacher Form */}
        {showAddForm && (
          <Card className="p-6 border-primary/30 bg-primary/5">
            <h2 className="text-xl font-bold text-foreground mb-4">Add New Teacher</h2>
            <form onSubmit={handleAddTeacher} className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <Input
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                  Add Teacher
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

        {/* Teachers List */}
        <div className="grid gap-4">
          {loading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-2"></div>
              <p className="text-foreground/60">Loading teachers...</p>
            </Card>
          ) : teachers.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
              <p className="text-foreground/60 mb-4">No teachers yet</p>
              <Button onClick={() => setShowAddForm(true)} className="bg-primary hover:bg-primary/90">
                Add First Teacher
              </Button>
            </Card>
          ) : (
            teachers.map((teacher) => (
              <Card key={teacher._id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-foreground/60">
                      <p>Username: {teacher.username}</p>
                      <p>Email: {teacher.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        // Navigate to teacher report
                      }}
                    >
                      <BarChart3 className="w-4 h-4" />
                      View Report
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTeacher(teacher._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
