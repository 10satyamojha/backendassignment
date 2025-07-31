import React, { useState, useEffect, useRef } from "react";
import CameraSection from "../components/camera";
import Controls from "../components/control";
import ResultsPage from "../components/result";

import {
  Activity,
  Heart,
  User,
  Wind,
  Droplets,
  Brain,
  Download,
  Camera,
  Play,
  Pause,
  RotateCcw,
  Thermometer,
  Clock,
  Upload,
  AlertTriangle,
  Sun
} from "lucide-react";

function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [lastFrame, setLastFrame] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [pulseIntensity, setPulseIntensity] = useState(1);
  const [scanPhase, setScanPhase] = useState("preparing");
  
  // New states from first code
  const [fps, setFps] = useState(120); // High-end frames
  const [videoBlob, setVideoBlob] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const pulseIntervalRef = useRef(null);
  const recordedChunks = useRef([]);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 }, // Higher resolution
          height: { ideal: 1080 },
          facingMode: "user",
          frameRate: { ideal: fps }
        },
        audio: false
      });

      setStream(mediaStream);
      streamRef.current = mediaStream;
      setCameraError(false);
      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError(true);
      setError("Camera access denied. Please enable camera permissions.");
    }
  };

  const startRecording = () => {
    if (!stream && !streamRef.current) return;

    const currentStream = stream || streamRef.current;
    chunksRef.current = [];
    setVideoBlob(null);
    setAnalysisResults(null);

    try {
      const options = { mimeType: 'video/webm; codecs=vp9' };
      let mediaRecorder;
      
      try {
        mediaRecorder = new MediaRecorder(currentStream, options);
      } catch (e) {
        mediaRecorder = new MediaRecorder(currentStream);
      }

      mediaRecorderRef.current = mediaRecorder;
      recordedChunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.current.push(event.data);
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, {
          type: "video/webm"
        });
        const videoURL = URL.createObjectURL(blob);
        setRecordedVideo(videoURL);
        setVideoBlob(blob);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      setError("Failed to start recording. Please try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const startScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setShowResults(false);
    setCountdown(30);
    setScanPhase("preparing");
    setPulseIntensity(1);

    startRecording();

    pulseIntervalRef.current = setInterval(() => {
      setPulseIntensity((prev) => (prev === 1 ? 1.2 : 1));
    }, 800);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        const newCount = prev - 1;

        if (newCount > 20) {
          setScanPhase("preparing");
        } else if (newCount > 10) {
          setScanPhase("analyzing");
        } else if (newCount > 0) {
          setScanPhase("finalizing");
        }

        if (newCount <= 0) {
          clearInterval(intervalRef.current);
          clearInterval(pulseIntervalRef.current);
          setIsScanning(false);
          setScanComplete(true);
          setScanPhase("complete");
          captureLastFrame();
          stopRecording();
          return 0;
        }
        return newCount;
      });
    }, 1000);
  };

  const captureLastFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const frameData = canvas.toDataURL("image/jpeg", 0.8);
      setLastFrame(frameData);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const analyzeFacialMetrics = async () => {
    if (!videoBlob) return;

    setIsAnalyzing(true);
    setError(null);
    setUploadProgress(0);

    // Create form data for API upload
    const formData = new FormData();
    formData.append('video', videoBlob);
    formData.append('fps', fps.toString());

    try {
      // Use XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();

      // Set up progress tracking
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      // Create a promise wrapper for XHR
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error('Invalid JSON response from server'));
            }
          } else {
             let errorMsg = `Server responded with status ${xhr.status}: ${xhr.statusText}`;
             try {
                 const errorResponse = JSON.parse(xhr.responseText);
                 if(errorResponse.message) {
                     errorMsg = `Analysis Error: ${errorResponse.message}`;
                 } else if (errorResponse.error) {
                     errorMsg = `API Error: ${errorResponse.error}`;
                 }
             } catch (parseError) {
                 // If response is not JSON, use the default error message
             }
             reject(new Error(errorMsg));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error occurred. Ensure backend is running.'));
        };

        xhr.onabort = () => {
          reject(new Error('Upload aborted'));
        };
      });

      // Initialize request
      xhr.open('POST', 'https://deploy-174215184718.europe-central2.run.app/analyze', true);

      // Send form data
      xhr.send(formData);

      // Wait for the upload and response
      const results = await uploadPromise;

      // Handle the successful response
      setAnalysisResults(results);
      setIsAnalyzing(false);

    } catch (err) {
      console.error("Analysis error:", err);
      setError(`Failed to analyze video: ${err.message}`);
      setIsAnalyzing(false);
    }
  };

  const analyzeResults = () => {
    if (videoBlob) {
      analyzeFacialMetrics();
    }
    setShowResults(true);
  };

  const downloadRecording = () => {
    if (recordedVideo) {
      const a = document.createElement("a");
      a.href = recordedVideo;
      a.download = `health-scan-${new Date()
        .toISOString()
        .slice(0, 19)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const resetScan = () => {
    setIsScanning(false);
    setScanComplete(false);
    setShowResults(false);
    setCountdown(30);
    setLastFrame(null);
    setRecordedVideo(null);
    setVideoBlob(null);
    setAnalysisResults(null);
    setRecordingDuration(0);
    setScanPhase("preparing");
    setError(null);
    setUploadProgress(0);

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);

    stopRecording();
    startCamera();
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
      stopRecording();
    };
  }, []);

  const getPhaseColor = () => {
    switch (scanPhase) {
      case "preparing":
        return "from-blue-400 to-cyan-400";
      case "analyzing":
        return "from-purple-400 to-pink-400";
      case "finalizing":
        return "from-green-400 to-emerald-400";
      case "complete":
        return "from-green-500 to-emerald-500";
      default:
        return "from-blue-400 to-cyan-400";
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Real health metrics from API results
  const getHealthMetrics = () => {
    if (!analysisResults?.results) {
      return [];
    }

    const results = analysisResults.results;
    return [
      {
        icon: Heart,
        label: "Heart Rate",
        value: results.heart_rate?.value || 'N/A',
        unit: "BPM",
        status: results.heart_rate?.value ? "Measured" : "N/A",
        confidence: results.heart_rate?.confidence ? `${Math.round(results.heart_rate.confidence * 100)}%` : 'N/A',
        color: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
      },
      {
        icon: Wind,
        label: "Respiratory Rate",
        value: results.respiratory_rate?.value || 'N/A',
        unit: "BPM",
        status: results.respiratory_rate?.value ? "Measured" : "N/A",
        confidence: results.respiratory_rate?.confidence ? `${Math.round(results.respiratory_rate.confidence * 100)}%` : 'N/A',
        color: "text-teal-500",
        bgColor: "bg-teal-50",
        borderColor: "border-teal-200"
      },
      {
        icon: Droplets,
        label: "Blood Oxygen (SpO2)",
        value: results.spo2?.value || 'N/A',
        unit: "%",
        status: results.spo2?.value ? "Measured" : "N/A",
        confidence: results.spo2?.confidence ? `${Math.round(results.spo2.confidence * 100)}%` : 'N/A',
        color: "text-cyan-500",
        bgColor: "bg-cyan-50",
        borderColor: "border-cyan-200"
      },
      {
        icon: Activity,
        label: "Blood Pressure",
        value: results.blood_pressure?.systolic && results.blood_pressure?.diastolic ? 
               `${results.blood_pressure.systolic}/${results.blood_pressure.diastolic}` : 'N/A',
        unit: "mmHg",
        status: results.blood_pressure?.systolic ? "Measured" : "N/A",
        confidence: results.blood_pressure?.confidence ? `${Math.round(results.blood_pressure.confidence * 100)}%` : 'N/A',
        color: "text-purple-500",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
      },
      {
        icon: Heart,
        label: "Pulse Pressure",
        value: results.pulse_pressure?.value || 'N/A',
        unit: "mmHg",
        status: results.pulse_pressure?.value ? "Calculated" : "N/A",
        confidence: results.blood_pressure?.confidence ? `${Math.round(results.blood_pressure.confidence * 100)}%` : 'N/A',
        color: "text-orange-500",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200"
      },
      {
        icon: User,
        label: "Age Estimate",
        value: results.age?.value || 'N/A',
        unit: "Years",
        status: results.age?.value ? "Estimated" : "N/A",
        confidence: results.age?.confidence ? `${Math.round(results.age.confidence * 100)}%` : 'N/A',
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
      },
      {
        icon: User,
        label: "Gender",
        value: results.gender?.value || 'N/A',
        unit: "",
        status: results.gender?.value ? "Estimated" : "N/A",
        confidence: results.gender?.confidence ? `${Math.round(results.gender.confidence * 100)}%` : 'N/A',
        color: "text-indigo-500",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200"
      },
      {
        icon: Brain,
        label: "Stress Level",
        value: results.stress_indicator?.value || 'N/A',
        unit: "",
        status: results.stress_indicator?.value ? "Analyzed" : "N/A",
        confidence: results.stress_indicator?.confidence ? `${Math.round(results.stress_indicator.confidence * 100)}%` : 'N/A',
        color: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      },
      {
        icon: AlertTriangle,
        label: "Risk Indicator",
        value: results.speculative_risk_indicator?.value || 'N/A',
        unit: "",
        status: results.speculative_risk_indicator?.value ? "Speculative" : "N/A",
        confidence: results.speculative_risk_indicator?.confidence ? `${Math.round(results.speculative_risk_indicator.confidence * 100)}%` : 'N/A',
        color: "text-amber-500",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200"
      }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-inter">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-sm py-8 border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg">
              <Activity className="text-white w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">FaceScan Vitals</h1>
          <p className="text-lg text-gray-600">
            AI-Powered Vital Signs Detection with Advanced Analytics
          </p>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-6 pb-12">
        {!showResults ? (
          <>
            <div className="text-center my-12">
              <CameraSection
                cameraError={cameraError}
                startCamera={startCamera}
                videoRef={videoRef}
                isScanning={isScanning}
                scanComplete={scanComplete}
                lastFrame={lastFrame}
                isRecording={isRecording}
                formatTime={formatTime}
                recordingDuration={recordingDuration}
                countdown={countdown}
                scanPhase={scanPhase}
                getPhaseColor={getPhaseColor}
                pulseIntensity={pulseIntensity}
              />
            </div>
            
            <Controls
              isScanning={isScanning}
              scanComplete={scanComplete}
              cameraError={cameraError}
              startScan={startScan}
            />

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-800 rounded-lg flex items-start max-w-2xl mx-auto">
                <AlertTriangle className="mr-2 flex-shrink-0 text-red-500" size={18} />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Analysis Progress */}
            {isAnalyzing && (
              <div className="mt-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Uploading to AI Server...</p>
                  <p className="text-sm text-gray-500">{uploadProgress}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-gray-500 italic text-center">
                  Server processing video at {fps} FPS for vital signs...
                </p>
              </div>
            )}

            {scanComplete && !isAnalyzing && (
              <div className="text-center mt-6">
                <button
                  onClick={analyzeResults}
                  className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-lg font-semibold rounded-full hover:from-green-700 hover:to-emerald-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Analyze Results
                </button>
              </div>
            )}
          </>
        ) : (
          <ResultsPage
            recordedVideo={recordedVideo}
            downloadRecording={downloadRecording}
            recordingDuration={recordingDuration}
            healthMetrics={getHealthMetrics()}
            resetScan={resetScan}
            formatTime={formatTime}
            analysisResults={analysisResults}
            isAnalyzing={isAnalyzing}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-white/20 py-8 mt-12">
        <div className="text-center text-gray-500 text-sm">
          <p>AI-powered health analysis for informational purposes only.</p>
          <p className="mt-1">Always consult with healthcare professionals for medical advice.</p>
        </div>
      </footer>

      {/* Hidden canvas for snapshot capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default App;