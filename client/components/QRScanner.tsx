import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";

interface QRScannerProps {
  onScan: (data: any) => void;
  onCancel?: () => void;
}

export default function QRScanner({ onScan, onCancel }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "environment",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        startQRScanning();
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

  const startQRScanning = () => {
    const scanInterval = setInterval(() => {
      if (videoRef.current && canvasRef.current && !scanned) {
        try {
          const context = canvasRef.current.getContext("2d");
          if (context) {
            context.drawImage(
              videoRef.current,
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );

            // Mock QR code detection
            // In production, use jsQR or similar library
            // For now, we just simulate detection after 2 seconds
            const timeElapsed = Date.now();
            if (timeElapsed % 2000 > 1900) {
              // Simulate successful scan
              setScanned(true);
              clearInterval(scanInterval);

              // Parse mock QR data
              const mockData = {
                classId: "mock-class-id",
                className: "Sample Class",
                timestamp: new Date().toISOString(),
              };

              onScan(mockData);
            }
          }
        } catch (err) {
          console.error("QR scanning error:", err);
        }
      }
    }, 100);
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-4">Scan QR Code</h2>

      {cameraActive && (
        <div className="mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg bg-black mb-4"
          />

          <canvas ref={canvasRef} className="hidden" width={640} height={480} />

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-4">
            <p className="text-sm text-foreground">
              Point your camera at the QR code provided by your teacher
            </p>
          </div>

          {scanned && (
            <div className="mb-4 p-3 bg-secondary/10 border border-secondary/20 rounded-lg flex gap-2">
              <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
              <p className="text-sm text-foreground">QR Code scanned successfully</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {!scanned && (
            <Button
              onClick={() => {
                stopCamera();
                onCancel?.();
              }}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </div>
      )}

      {!cameraActive && (
        <div className="text-center py-8">
          <Button
            onClick={startCamera}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? "Starting Camera..." : "Open Camera"}
          </Button>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-foreground/60">Loading camera...</p>
        </div>
      )}
    </Card>
  );
}
