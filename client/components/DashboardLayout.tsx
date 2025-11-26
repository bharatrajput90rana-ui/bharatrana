import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  LogOut,
  QrCode,
  Users,
  BarChart3,
  BookOpen,
  CheckSquare,
  Home,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getNavItems = () => {
    const baseItems = [{ icon: Home, label: "Home", path: "/" }];

    if (user?.role === "admin") {
      return [
        ...baseItems,
        { icon: Users, label: "Teachers", path: "/admin" },
        { icon: BarChart3, label: "Reports", path: "/admin/reports" },
      ];
    } else if (user?.role === "teacher") {
      return [
        ...baseItems,
        { icon: BookOpen, label: "Classes", path: "/teacher" },
        { icon: Users, label: "Students", path: "/teacher/students" },
        { icon: QrCode, label: "QR & GPS", path: "/teacher/qr-gps" },
        { icon: BarChart3, label: "Analytics", path: "/teacher/analytics" },
      ];
    } else if (user?.role === "student") {
      return [
        ...baseItems,
        { icon: CheckSquare, label: "Mark Attendance", path: "/student" },
        { icon: BarChart3, label: "My Records", path: "/student/records" },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Mobile Header */}
      <header className="md:hidden border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-foreground">AttendanceHub</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-background rounded-lg"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className={`fixed md:relative left-0 top-0 h-screen bg-card border-r border-border overflow-y-auto transition-transform duration-300 z-40 md:z-0 md:translate-x-0 w-64 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo */}
          <div className="hidden md:flex items-center gap-3 p-6 border-b border-border">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">AttendanceHub</h1>
              <p className="text-xs text-foreground/60">Smart Attendance</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:bg-background hover:text-foreground transition"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border bg-background/50">
            <div className="mb-4">
              <p className="text-xs text-foreground/60">Logged in as</p>
              <p className="font-semibold text-foreground">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-foreground/60 capitalize">
                {user?.role}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              className="w-full bg-destructive hover:bg-destructive/90 gap-2 justify-center"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Top Bar */}
          <header className="hidden md:block border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
            <div className="px-8 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-foreground/60 capitalize">
                    {user?.role}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-background rounded-lg text-foreground/70 hover:text-foreground transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
