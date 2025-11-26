import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { QrCode, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
              <QrCode className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">AttendanceHub</h1>
          <p className="text-foreground/60 mt-2">Smart Attendance Management</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 border-border/50 shadow-xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">Login</h2>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Username</label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="bg-input border-border/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-input border-border/50"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-8 border-t border-border/50">
            <p className="text-sm font-medium text-foreground mb-4">Demo Credentials:</p>
            <div className="space-y-3">
              <div className="p-3 bg-background rounded border border-border/30">
                <p className="text-xs text-foreground/60">Admin</p>
                <p className="text-sm font-mono text-foreground">admin / admin123</p>
              </div>
              <div className="p-3 bg-background rounded border border-border/30">
                <p className="text-xs text-foreground/60">Teacher</p>
                <p className="text-sm font-mono text-foreground">teacher1 / teacher123</p>
              </div>
              <div className="p-3 bg-background rounded border border-border/30">
                <p className="text-xs text-foreground/60">Student</p>
                <p className="text-sm font-mono text-foreground">student1 / student123</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-primary hover:text-primary/80 transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
