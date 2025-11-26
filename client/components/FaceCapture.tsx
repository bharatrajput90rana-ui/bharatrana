import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, AlertCircle, CheckCircle } from "lucide-react";
import {
  initializeFaceDetection,
  detectFace,
  captureFaceImage,
  performLivenessCheck,
  detectBlinks,
} from "@/lib/faceRecognition";

interface FaceCaptureProps {
  onCapture: (imageData: string, descriptor: number[]) => void;
  onCancel?: () => void;
  mode?: "capture" | "verify"; // capture for profile setup, verify for attendance
}

export default function FaceCapture({ onCapture, onCancel, mode = "capture" }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [livenessScore, setLivenessScore] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    initializeFaceAPI();
  }, []);

  const initializeFaceAPI = async () => {
    try {
      const loaded = await initializeFaceDetection();
      if (!loaded) {
        setError(
          "Face detection not available. Please try again or use a different browser."
        );
      }
    } catch (err) {
      setError("Failed to initialize face detection");
    }
  };

  const startCamera = async () => {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setInstruction(
          mode === "capture"
            ? "Position your face in the center and ensure good lighting"
            : "Look at the camera for verification"
        );
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setLoading(true);
      setInstruction("Analyzing face...");

      // Draw video frame to canvas
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(
          videoRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }

      // Detect face in the captured image
      const detection = await detectFace(canvasRef.current);

      if (!detection) {
        setError("No face detected. Please try again with better lighting.");
        setLoading(false);
        return;
      }

      setFaceDetected(true);

      if (mode === "capture") {
        // Perform liveness check during profile setup
        setInstruction("Checking if you are a real person...");
        const liveness = await performLivenessCheck(videoRef.current, 2000);
        setLivenessScore(liveness);

        if (liveness < 0.4) {
          setError("Liveness check failed. Please look natural at the camera.");
          setFaceDetected(false);
          setLoading(false);
          return;
        }
      } else {
        // Perform blink detection for verification
        setInstruction("Detecting blinks for security...");
        const blinkScore = await detectBlinks(videoRef.current, 1000);

        if (blinkScore < 0.5) {
          setError("Blink detection failed. Please keep your eyes open.");
          setFaceDetected(false);
          setLoading(false);
          return;
        }
      }

      // Capture image and send to parent
      const imageData = captureFaceImage(canvasRef.current);
      const mockDescriptor = Array(512)
        .fill(0)
        .map(() => Math.random());

      onCapture(imageData, mockDescriptor);
      stopCamera();
    } catch (err) {
      setError("Failed to capture face. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        {mode === "capture" ? "Capture Face" : "Verify Face"}
      </h2>

      {!cameraActive ? (
        <div className="text-center py-8">
          <Camera className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <p className="text-foreground/70 mb-6">
            {mode === "capture"
              ? "We need to capture your face for authentication"
              : "Position your face for verification"}
          </p>
          <Button
            onClick={startCamera}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? "Starting Camera..." : "Start Camera"}
          </Button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg mb-4 bg-black"
          />

          <canvas
            ref={canvasRef}
            className="hidden"
            width={640}
            height={480}
          />

          {instruction && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-foreground">{instruction}</p>
              {livenessScore > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-foreground/60">Liveness Score</span>
                    <span className="text-sm font-semibold text-foreground">
                      {Math.round(livenessScore * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${livenessScore * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {faceDetected && (
            <div className="mb-4 p-3 bg-secondary/10 border border-secondary/20 rounded-lg flex gap-2">
              <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
              <p className="text-sm text-foreground">Face detected successfully</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={captureFace}
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {loading ? "Processing..." : "Capture"}
            </Button>
            <Button
              onClick={() => {
                stopCamera();
                onCancel?.();
              }}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
