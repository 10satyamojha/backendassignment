import React, { useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  FaceMesh,
  FACEMESH_FACE_OVAL,
  FACEMESH_LEFT_EYE,
  FACEMESH_RIGHT_EYE,
  FACEMESH_LIPS,
} from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

export default function CameraSection({
  cameraError,
  startCamera,
  isScanning,
  scanComplete,
  isRecording,
  formatTime,
  recordingDuration,
  countdown,
  scanPhase,
  getPhaseColor,
  pulseIntensity,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraInstance = useRef(null);
  const [lastFrame, setLastFrame] = useState(null);

  // --- Camera frame size ---
  const WIDTH = 384;
  const HEIGHT = 518; // vertical

  useEffect(() => {
    if (videoRef.current && isScanning) {
      const faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        selfieMode: true,
        maxNumFaces: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults(onResults);

      cameraInstance.current = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
        },
        width: WIDTH,
        height: HEIGHT,
      });
      cameraInstance.current.start();
    }
    return () => {
      if (cameraInstance.current) {
        cameraInstance.current.stop();
      }
    };
  }, [isScanning]);

  // Draw mesh
  const onResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !videoRef.current) return;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx.save();
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.scale(-1, 1);
    ctx.translate(-WIDTH, 0);
    if (results.multiFaceLandmarks?.length) {
      const landmarks = results.multiFaceLandmarks[0];
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 8;
      drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, {
        color: "#FFF",
        lineWidth: 2,
      });
      ctx.shadowBlur = 0;
      drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, {
        color: "rgba(255,255,255,0.75)", lineWidth: 1.3,
      });
      drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, {
        color: "rgba(255,255,255,0.75)", lineWidth: 1.3,
      });
      drawConnectors(ctx, landmarks, FACEMESH_LIPS, {
        color: "rgba(255,255,255,0.8)", lineWidth: 1.3,
      });
      drawLandmarks(ctx, landmarks, { color: "#FFF", lineWidth: 0.7, radius: 0.8 });

      if (scanComplete && !lastFrame) {
        const snap = document.createElement("canvas");
        snap.width = WIDTH;
        snap.height = HEIGHT;
        const snapCtx = snap.getContext("2d");
        snapCtx.save();
        snapCtx.scale(-1, 1);
        snapCtx.translate(-WIDTH, 0);
        snapCtx.drawImage(videoRef.current, 0, 0, WIDTH, HEIGHT);
        snapCtx.shadowColor = "rgba(0,0,0,0.35)"; snapCtx.shadowBlur = 8;
        drawConnectors(snapCtx, landmarks, FACEMESH_FACE_OVAL, {
          color: "#FFF", lineWidth: 2,
        });
        snapCtx.shadowBlur = 0;
        drawConnectors(snapCtx, landmarks, FACEMESH_LEFT_EYE, {
          color: "rgba(255,255,255,0.75)", lineWidth: 1.3,
        });
        drawConnectors(snapCtx, landmarks, FACEMESH_RIGHT_EYE, {
          color: "rgba(255,255,255,0.75)", lineWidth: 1.3,
        });
        drawConnectors(snapCtx, landmarks, FACEMESH_LIPS, {
          color: "rgba(255,255,255,0.8)", lineWidth: 1.3,
        });
        snapCtx.restore();
        setLastFrame(snap.toDataURL("image/jpeg", 0.95));
      }
    }
    ctx.restore();
  };

  if (cameraError) {
    return (
      <div className="w-[40%] h-[40%] bg-white/80  backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center shadow-xlabsolute inset-0 rounded-full border-4 border-teal-400 border-dashed animate-pulse">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Unable to access camera</p>
          <button
            onClick={startCamera}
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative inline-block"
      style={{ width: WIDTH, height: HEIGHT }}
    >

      {/* Animated Border */}
      <div
  className={`absolute inset-0 rounded-3xl overflow-hidden transition-all duration-500
    ${isScanning
      ? 'shadow-[0_0_32px_4px_rgba(54,200,255,0.26)] ring-4 ring-cyan-300/30 animate-border-pulse'
      : scanComplete
      ? 'shadow-[0_0_32px_8px_rgba(0,200,80,0.18)] ring-4 ring-green-400'
      : 'shadow-[0_0_16px_1px_rgba(90,99,128,0.13)] border-2 border-gray-200'
    }`}
  style={{
    background: isScanning
      ? 'linear-gradient(90deg, rgba(20,223,255,0.11) 0%, rgba(63,56,255,0.12) 100%)'
      : scanComplete
      ? 'linear-gradient(90deg, rgba(133,255,178,0.14) 0%, rgba(48,255,115,0.16) 100%)'
      : 'rgba(255,255,255,0.19)',
    // Pulse/grow on scan, normal scale otherwise
    transform: isScanning
      ? `scale(${pulseIntensity || 1})`
      : "scale(1)",
    transition: "transform 0.8s cubic-bezier(.22,1,.36,1)",
    // Minor glass effect on white bg (always)
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)"
  }}
>
  {/* Inner translucent rounded-3xl area */}
  {(isScanning || scanComplete) && (
    <div
      className="w-full h-full rounded-3xl"
      style={{
        background: "rgba(255,255,255,0.86)",
        boxShadow: "inset 0 1px 16px 0 rgba(105,180,255,0.10)",
        borderRadius: "inherit"
      }}
    />
  )}
  {/* Optional: fade out ring on the inside for elevated finish */}
  <div
    style={{
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      pointerEvents: "none",
      boxShadow: isScanning
        ? "0 0 0 12px rgba(0,216,255,0.09) inset"
        : scanComplete
        ? "0 0 0 18px rgba(48,255,115,0.08) inset"
        : "0 0 0 10px rgba(128,128,128,0.04) inset"
    }}
  />
</div>


      {/* Show captured frame when done, otherwise live */}
      {scanComplete && lastFrame ? (
        <img
          src={lastFrame}
          alt="Captured frame"
          className="object-cover rounded-3xl relative z-10 w-full h-full"
          style={{ width: WIDTH, height: HEIGHT }}
        />
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="object-cover rounded-3xl relative z-10"
            style={{ width: WIDTH, height: HEIGHT }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 rounded-3xl z-20 pointer-events-none"
            style={{ width: WIDTH, height: HEIGHT }}
          />

          {/* === BLUR OVERLAY: OUTSIDE OVAL ONLY === */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 30,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(16px)",
              // oval ~ coverage: fine-tune 44%/70% (radius) and 69%-71% (edge softness)
              WebkitMaskImage:
                "radial-gradient(ellipse 61% % at 50% 50%, transparent 69%, black 71%)",
              maskImage:
                "radial-gradient(ellipse 61% 68% at 50% 50%, transparent 69%, black 71%)",
              background: "rgba(255,255,255,0.10)"
            }}
          />
          {/* === DASHED OVAL BORDER OVERLAY === */}
          <div
            style={{
              position: "absolute",
              left: "6%",
              top: "4%",
              width: "88%",
              height: "92%",
              border: "5px dashed #fff",
              borderRadius: "50%",
              boxSizing: "border-box",
              zIndex: 31,
              pointerEvents: "none"
            }}
          />

          {/* === Top instruction text (above oval) === */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              textAlign: 'center',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1.15rem',
              textShadow: '0 2px 12px #003046cc',
              letterSpacing: '0.02em',
              marginTop: '14px',
              left: 0,
              zIndex: 40,
              pointerEvents: "none"
            }}
          >
            Place the face in the oval.
          </div>
        </>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-4 left-4 z-40 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span>Rec
  {recordingDuration <= 30 
    ? formatTime(recordingDuration)
    : "00:30"}
</span>

        </div>
      )}

      {/* Countdown Overlay */}
      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white/30"></div>
            <svg className="absolute top-0 left-0 w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="white"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${(countdown / 30) * 377} 377`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-white text-4xl font-bold mb-1">
                  {countdown}
                </div>
                <div className="text-white text-xs uppercase tracking-wider">
                  {scanPhase}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
