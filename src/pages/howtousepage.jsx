import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Check, AlertCircle, X, Wifi, WifiOff , Activity,
  Heart,
  User,
  Wind,
  Droplets,
  Brain,
  Download,  
  Play,
  Pause,
  RotateCcw,
  Thermometer,
  Clock,
  Upload,
  AlertTriangle,
  Sun} from 'lucide-react';
import photo from "../assets/images (3).jpg"
import { Camera } from 'react-feather';

import CameraSection from "../components/camera";
import Controls from "../components/control";
import ResultsPage from "../components/result";



const getToken = () => localStorage.getItem('authToken');
console.log(getToken)
const mockAPI = {
  // Simulate face detection API
  detectFace: async (imageData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Random face detection results
    const scenarios = [
      { detected: true, position: 'center', distance: 'optimal', confidence: 0.95 },
      { detected: true, position: 'left', distance: 'optimal', confidence: 0.85 },
      { detected: true, position: 'right', distance: 'optimal', confidence: 0.82 },
      { detected: true, position: 'center', distance: 'too_far', confidence: 0.70 },
      { detected: true, position: 'center', distance: 'too_close', confidence: 0.75 },
      { detected: false, position: null, distance: null, confidence: 0 },
    ];
    
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  },
  
  // Save profile data
  saveProfile: async (profileData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, userId: Math.random().toString(36).substr(2, 9) };
  },
  
  // Process scan results
  processScan: async (scanData) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      heartRate: 68 + Math.floor(Math.random() * 15),
      temperature: 98.2 + (Math.random() * 0.8),
      breathingRate: 14 + Math.floor(Math.random() * 6),
      bloodPressure: {
        systolic: 115 + Math.floor(Math.random() * 15),
        diastolic: 75 + Math.floor(Math.random() * 10)
      },
      stressLevel: Math.floor(Math.random() * 5) + 1
    };
  }
};

// Router Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [userData, setUserData] = useState({
    profile: {},
    scanResults: null,
    userId: null
  });

  const navigate = (page) => setCurrentPage(page);

  const pages = {
    welcome: <WelcomePage onNavigate={navigate} />,
    cameraGuide: <CameraGuidePage onNavigate={navigate} />,
    profile: <ProfilePage onNavigate={navigate} userData={userData} setUserData={setUserData} />,
    resultsPreview: <ResultsPreviewPage onNavigate={navigate} />,
    lightingGuide: <LightingGuidePage onNavigate={navigate} />,
    scan: <ScanPage onNavigate={navigate} userData={userData} setUserData={setUserData} />,
    results: <ResultsPage onNavigate={navigate} userData={userData} />
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden" style={{ minHeight: '700px' }}>
          {pages[currentPage]}
        </div>
      </div>
    </div>
  );
};

// Welcome Page
const WelcomePage = ({ onNavigate }) => (
  <div className="h-full flex flex-col">
    <StatusBar />
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="mb-8">
        <div className="w-24 h-24 bg-gradient-to-r from-teal-400 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Camera className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">FaceVital Health</h1>
        <p className="text-gray-600 text-center">AI-powered vital signs monitoring</p>
      </div>
      
      <button
        onClick={() => onNavigate('cameraGuide')}
        className="w-full bg-blue-500 text-white py-4 rounded-lg font-medium mb-4"
      >
        Get Started
      </button>
      
      <p className="text-sm text-gray-500 text-center">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
      



    </div>
    
    
  </div>
);

// Camera Guide Page
const CameraGuidePage = ({ onNavigate }) => (
  <div className="h-full flex flex-col">
    <StatusBar />
    <Header title="How to Use" onBack={() => onNavigate('welcome')} />
    
    <div className="flex-1 px-6 pb-6 flex flex-col justify-center">
      <div className="relative w-64 h-64 mb-8 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-teal-400 border-dashed animate-pulse"></div>
        <div className="absolute inset-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          <div>
            <img src={photo} alt="Guide illustration" />
          </div>
        </div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
        </div>
      </div>
      
      <p className="text-center text-gray-700 mb-8">
        Anura® won't work well if:<br />
        The face is not facing the camera, or the<br />
        distance is too far or too close to the camera
      </p>

      <button
        onClick={() => onNavigate('profile')}
        className="w-full bg-blue-500 text-white py-4 rounded-lg font-medium"
      >
        Continue
      </button>
    </div>
    
    <ProgressDots current={0} total={5} />
  </div>
);

// Profile Page
const ProfilePage = ({ onNavigate, userData, setUserData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: userData?.profile?.nickname || '',
    age: userData?.profile?.age || '',
    height: userData?.profile?.height || '',
    weight: userData?.profile?.weight || '',
    unit: userData?.profile?.unit || 'metric',
    sex: userData?.profile?.sex || '',
  });

  const isFormValid =
    formData.nickname && formData.age && formData.height &&
    formData.weight && formData.sex && parseInt(formData.age, 10) >= 18;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/profile/createOrUpdateProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Only if you use JWT for authentication:
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || `HTTP error ${res.status}`);
      }

      const data = await res.json();
      setUserData({
        ...userData,
        profile: data.profile,
        userId: data.userId, // from API response
      });
      onNavigate('resultsPreview');
    } catch (error) {
      alert(error.message);
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <StatusBar />
      <Header title="Profile" onBack={() => onNavigate('cameraGuide')} />

      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">✦</span>
            </div>
            <span className="text-2xl font-light">Profile</span>
          </div>

          <div>
            <label className="text-gray-600 text-sm">Nickname *</label>
            <input
              type="text"
              value={formData.nickname}
              onChange={e => setFormData({...formData, nickname: e.target.value})}
              className="w-full border-b border-gray-300 py-2 focus:border-blue-500 outline-none"
              placeholder="Enter your nickname"
            />
          </div>

          <div>
            <label className="text-gray-600 text-sm">Age *</label>
            <input
              type="number"
              value={formData.age}
              min="18"
              onChange={e => setFormData({...formData, age: e.target.value})}
              className="w-full border-b border-gray-300 py-2 focus:border-blue-500 outline-none"
              placeholder="18"
            />
            <p className="text-sm text-gray-500 mt-2">
              Anura® is not intended for individuals under 18 years old
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({...formData, unit: 'metric'})}
              className={`flex-1 py-3 rounded-lg border transition-colors ${
                formData.unit === 'metric' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >Metric</button>
            <button
              type="button"
              onClick={() => setFormData({...formData, unit: 'imperial'})}
              className={`flex-1 py-3 rounded-lg border transition-colors ${
                formData.unit === 'imperial' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >Imperial</button>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-gray-600 text-sm">
                Height ({formData.unit === 'metric' ? 'cm' : 'ft'})
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={e => setFormData({...formData, height: e.target.value})}
                className="w-full border-b border-gray-300 py-2 focus:border-blue-500 outline-none"
                placeholder={formData.unit === 'metric' ? '170' : '5.6'}
              />
            </div>
            <div className="flex-1">
              <label className="text-gray-600 text-sm">
                Weight ({formData.unit === 'metric' ? 'kg' : 'lbs'})
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={e => setFormData({...formData, weight: e.target.value})}
                className="w-full border-b border-gray-300 py-2 focus:border-blue-500 outline-none"
                placeholder={formData.unit === 'metric' ? '70' : '154'}
              />
            </div>
          </div>

          <div>
            <label className="text-gray-600 text-sm">Sex at birth *</label>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, sex: 'male'})}
                className={`flex-1 py-3 rounded-lg border transition-colors ${
                  formData.sex === 'male' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >Male</button>
              <button
                type="button"
                onClick={() => setFormData({...formData, sex: 'female'})}
                className={`flex-1 py-3 rounded-lg border transition-colors ${
                  formData.sex === 'female' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >Female</button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className={`w-full py-4 rounded-lg font-medium transition-colors ${
              isFormValid && !loading
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
      <ProgressDots current={1} total={5} />
    </div>
  );
};

// Results Preview Page
const ResultsPreviewPage = ({ onNavigate }) => (
  <div className="h-full flex flex-col">
    <StatusBar />
    <Header title="How to Use" onBack={() => onNavigate('profile')} />
    
    <div className="flex-1 px-6 pb-6 overflow-y-auto">
      <div className="space-y-6">
        <button className="text-blue-500 flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Results
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-medium mb-4">Stress Index</h2>
          
          <div className="flex mb-4">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`flex-1 h-12 flex items-center justify-center text-white font-medium ${
                  level === 1 ? 'bg-teal-400 rounded-l-lg' :
                  level === 2 ? 'bg-teal-300' :
                  level === 3 ? 'bg-yellow-300' :
                  level === 4 ? 'bg-orange-300' :
                  'bg-red-400 rounded-r-lg'
                }`}
              >
                {level}
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-gray-600">State: <span className="font-medium">Relaxed</span></p>
          </div>

          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>Your below normal stress reading results in a lower Stress Index</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>Suitable for home or leisure environments</span>
            </li>
          </ul>
        </div>

        <p className="text-center text-gray-600">
          Once you get your results, tap on the dials to learn more
        </p>

        <button
          onClick={() => onNavigate('lightingGuide')}
          className="w-full bg-blue-500 text-white py-4 rounded-lg font-medium"
        >
          Continue
        </button>
      </div>
    </div>
    
    <ProgressDots current={2} total={5} />
  </div>
);

// Lighting Guide Page
const LightingGuidePage = ({ onNavigate }) => (
  <div className="h-full flex flex-col">
    <StatusBar />
    <Header title="How to Use" onBack={() => onNavigate('resultsPreview')} />
    
    <div className="flex-1 px-6 pb-6 flex flex-col justify-center">
      <div className="relative w-64 h-64 mb-8 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-green-400"></div>
        <div className="absolute inset-4 rounded-full overflow-hidden bg-gray-100">
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-50">
            💡
          </div>
        </div>
      </div>
      
      <p className="text-center text-gray-700 mb-8">
        Anura® won't work well if:<br />
        The light is too bright or too dark, or uneven<br />
        on the face. Try to avoid backlight
      </p>

      <button
        onClick={() => onNavigate('scan')}
        className="w-full bg-blue-500 text-white py-4 rounded-lg font-medium"
      >
        Start Scan
      </button>
    </div>
    
    <ProgressDots current={3} total={5} />
  </div>
);

// Scan Page with Real Face Detection
const ScanPage = ({ onNavigate, userData, setUserData }) => {
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
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 font-inter">
       {/* HEADER */}
   <StatusBar />
    <Header title="How to Use" onBack={() => onNavigate('welcome')} />
 
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
                     className="bg-gradient-to-r from-teal-400 to-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
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
                   className="px-12 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white text-lg font-semibold rounded-full hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
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
       <footer className="bg-white/80 backdrop-blur-sm border-t border-teal-100/20 py-8 mt-12">
         <div className="text-center text-gray-600 text-sm">
           <p>AI-powered health analysis for informational purposes only.</p>
           <p className="mt-1 text-gray-500">Always consult with healthcare professionals for medical advice.</p>
         </div>
       </footer>
 
       {/* Hidden canvas for snapshot capture */}
       <canvas ref={canvasRef} style={{ display: "none" }} />
     </div>
  );
};

// Results Page
// const ResultsPage = ({ onNavigate, userData }) => {
//   const results = userData.scanResults || {
//     heartRate: 72,
//     temperature: 98.6,
//     breathingRate: 16,
//     bloodPressure: { systolic: 120, diastolic: 80 },
//     stressLevel: 2
//   };

//   return (
//     <div className="h-full flex flex-col">
//       <StatusBar />
//       <Header title="Results" />
      
//       <div className="flex-1 px-6 pb-6 overflow-y-auto">
//         <div className="space-y-6">
//           <div className="bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-2xl p-6">
//             <h2 className="text-2xl font-bold mb-2">Scan Complete!</h2>
//             <p>Hello {userData.profile.nickname}, here are your vitals</p>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <VitalCard 
//               value={results.heartRate} 
//               label="Heart Rate" 
//               unit="bpm" 
//               color="text-teal-500" 
//             />
//             <VitalCard 
//               value={results.temperature.toFixed(1)} 
//               label="Temperature" 
//               unit="°F" 
//               color="text-blue-500" 
//             />
//             <VitalCard 
//               value={results.breathingRate} 
//               label="Breathing Rate" 
//               unit="breaths/min" 
//               color="text-green-500" 
//             />
//             <VitalCard 
//               value={`${results.bloodPressure.systolic}/${results.bloodPressure.diastolic}`} 
//               label="Blood Pressure" 
//               unit="mmHg" 
//               color="text-purple-500" 
//             />
//           </div>

//           <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
//             <h3 className="font-medium mb-3">Stress Level</h3>
//             <div className="flex mb-2">
//               {[1, 2, 3, 4, 5].map((level) => (
//                 <div
//                   key={level}
//                   className={`flex-1 h-8 flex items-center justify-center text-sm font-medium ${
//                     level <= results.stressLevel
//                       ? level <= 2 ? 'bg-teal-400' :
//                         level === 3 ? 'bg-yellow-300' :
//                         'bg-orange-400'
//                       : 'bg-gray-200'
//                   } ${
//                     level === 1 ? 'rounded-l' : level === 5 ? 'rounded-r' : ''
//                   }`}
//                 >
//                   {level <= results.stressLevel && level}
//                 </div>
//               ))}
//             </div>
//             <p className="text-sm text-gray-600">
//               {results.stressLevel <= 2 ? 'Relaxed' : 
//                results.stressLevel === 3 ? 'Normal' : 
//                'Elevated'}
//             </p>
//           </div>

//           <div className="bg-green-50 rounded-xl p-4 flex items-start gap-3">
//             <Check className="w-5 h-5 text-green-600 mt-0.5" />
//             <div>
//               <p className="font-medium text-green-800">All vitals are within normal range</p>
//               <p className="text-sm text-green-700 mt-1">Your health indicators look great!</p>
//             </div>
//           </div>

//           <div className="flex gap-3">
//             <button 
//               onClick={() => onNavigate('welcome')}
//               className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-lg font-medium"
//             >
//               New Scan
//             </button>
//             <button className="flex-1 bg-blue-500 text-white py-4 rounded-lg font-medium">
//               Save Results
//             </button>
//           </div>
//         </div>
//       </div>
      
//       <ProgressDots current={4} total={5} />
//     </div>
//   );
// };

// Shared Components
const StatusBar = () => (
  <div className="bg-white px-6 py-2 flex justify-between items-center text-sm">
    <span className="font-medium">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
    <div className="flex items-center gap-1">
      <span>🔋 27%</span>
    </div>
  </div>
);

const Header = ({ title, onBack }) => (
  <div className="px-6 py-4 flex items-center justify-between">
    {onBack && (
      <button onClick={onBack}>
        <ChevronLeft className="w-6 h-6" />
      </button>
    )}
    <h1 className="text-xl font-normal flex-1 text-center">{title}</h1>
    {onBack && <div className="w-6" />}
  </div>
);

const ProgressDots = ({ current, total }) => (
  <div className="flex justify-center gap-2 pb-6">
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full transition-colors ${
          i === current ? 'bg-gray-800' : 'bg-gray-300'
        }`}
      />
    ))}
  </div>
);

const VitalCard = ({ value, label, unit, color }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
    <div className="text-xs text-gray-500">{unit}</div>
  </div>
);

export default App;