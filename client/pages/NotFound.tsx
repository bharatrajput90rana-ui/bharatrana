import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
          <p className="text-xl text-foreground/70">Page Not Found</p>
        </div>

        <p className="text-foreground/60 mb-8">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/")}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Go Home
          </Button>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex-1"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
