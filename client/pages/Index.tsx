import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users,
  Smartphone,
  BarChart3,
  QrCode,
  MapPin,
  Smile,
  Clock,
  Shield,
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (isAuthenticated) {
    // Show dashboard based on role
    if (user?.role === "admin") {
      navigate("/admin");
    } else if (user?.role === "teacher") {
      navigate("/teacher");
    } else if (user?.role === "student") {
      navigate("/student");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              AttendanceHub
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-foreground/70 hover:text-foreground transition"
            >
              Features
            </a>
            <a
              href="#roles"
              className="text-foreground/70 hover:text-foreground transition"
            >
              Roles
            </a>
            <a
              href="#technology"
              className="text-foreground/70 hover:text-foreground transition"
            >
              Technology
            </a>
            <Button onClick={() => navigate("/login")} size="sm">
              Login
            </Button>
          </nav>
          <div className="md:hidden">
            <Button onClick={() => navigate("/login")} size="sm">
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Smart Attendance <span className="text-primary">Management</span>
            </h2>
            <p className="text-xl text-foreground/70 mb-8">
              A comprehensive solution for automated attendance marking using QR
              codes, GPS validation, and advanced face recognition technology.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="bg-primary hover:bg-primary/90"
              >
                Get Started
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <QrCode className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-semibold text-foreground">QR Scanning</h3>
              <p className="text-sm text-foreground/60 mt-2">
                Quick and secure attendance marking via QR codes
              </p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <Smile className="w-12 h-12 text-secondary mb-4" />
              <h3 className="font-semibold text-foreground">
                Face Recognition
              </h3>
              <p className="text-sm text-foreground/60 mt-2">
                Advanced ML-based identity verification
              </p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <MapPin className="w-12 h-12 text-accent mb-4" />
              <h3 className="font-semibold text-foreground">GPS Validation</h3>
              <p className="text-sm text-foreground/60 mt-2">
                Location-based attendance confirmation
              </p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <BarChart3 className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="font-semibold text-foreground">Analytics</h3>
              <p className="text-sm text-foreground/60 mt-2">
                Detailed attendance reports and statistics
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="bg-card py-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            Three-Role System
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Admin Role */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-border/50">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Admin</h3>
              <p className="text-foreground/70 mb-6">
                Manage teachers, oversee the entire system, and view
                comprehensive reports across all classes and attendance records.
              </p>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>✓ Create & manage teachers</li>
                <li>✓ System-wide analytics</li>
                <li>✓ Attendance oversight</li>
                <li>✓ Teacher performance tracking</li>
              </ul>
            </Card>

            {/* Teacher Role */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-border/50">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Teacher
              </h3>
              <p className="text-foreground/70 mb-6">
                Create classes, manage students, generate QR codes, set GPS
                coordinates, and monitor attendance analytics.
              </p>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>✓ Create classes</li>
                <li>✓ Manage students</li>
                <li>✓ Generate QR codes</li>
                <li>✓ View class analytics</li>
              </ul>
            </Card>

            {/* Student Role */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-border/50">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Student
              </h3>
              <p className="text-foreground/70 mb-6">
                Mark attendance using QR codes, face recognition, and GPS
                validation. Track your attendance history and statistics.
              </p>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>✓ Scan QR codes</li>
                <li>✓ Face recognition login</li>
                <li>✓ GPS validation</li>
                <li>✓ View attendance records</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-2">
                    QR Code Integration
                  </h4>
                  <p className="text-foreground/70">
                    Teachers generate unique QR codes for each class session for
                    quick student verification
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaceIcon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-2">
                    AI Face Recognition
                  </h4>
                  <p className="text-foreground/70">
                    Advanced machine learning for accurate facial identification
                    with liveness detection
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-2">
                    GPS Validation
                  </h4>
                  <p className="text-foreground/70">
                    Verify student location against teacher-defined GPS
                    coordinates
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-2">
                    Analytics & Reports
                  </h4>
                  <p className="text-foreground/70">
                    Comprehensive daily and weekly attendance statistics with
                    trend analysis
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-2">
                    Real-time Tracking
                  </h4>
                  <p className="text-foreground/70">
                    Live attendance marking and instant notification system
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-2">
                    Multi-factor Verification
                  </h4>
                  <p className="text-foreground/70">
                    Three-step validation: QR code, GPS, and face recognition
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="bg-card py-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            Built with Modern Technology
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="p-6 bg-background rounded-lg border border-border/50">
              <h4 className="font-bold text-foreground mb-2">Frontend</h4>
              <p className="text-foreground/70 text-sm">
                React 18 + TypeScript + TailwindCSS
              </p>
            </div>
            <div className="p-6 bg-background rounded-lg border border-border/50">
              <h4 className="font-bold text-foreground mb-2">Backend</h4>
              <p className="text-foreground/70 text-sm">
                Express.js + MongoDB + JWT
              </p>
            </div>
            <div className="p-6 bg-background rounded-lg border border-border/50">
              <h4 className="font-bold text-foreground mb-2">ML/AI</h4>
              <p className="text-foreground/70 text-sm">
                face-api.js + TensorFlow.js
              </p>
            </div>
            <div className="p-6 bg-background rounded-lg border border-border/50">
              <h4 className="font-bold text-foreground mb-2">Location</h4>
              <p className="text-foreground/70 text-sm">
                Geolocation API + GPS
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Transform Attendance Management?
          </h2>
          <p className="text-xl text-foreground/70 mb-8">
            Get started with AttendanceHub today and streamline your attendance
            process
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/login")}
            className="bg-primary hover:bg-primary/90"
          >
            Login to Dashboard
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-foreground mb-4">AttendanceHub</h4>
              <p className="text-foreground/70 text-sm">
                Smart attendance management for educational institutions
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>
                  <a
                    href="#features"
                    className="hover:text-foreground transition"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a href="#roles" className="hover:text-foreground transition">
                    Roles
                  </a>
                </li>
                <li>
                  <a
                    href="#technology"
                    className="hover:text-foreground transition"
                  >
                    Technology
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-foreground/60 text-sm">
            <p>&copy; 2024 AttendanceHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
