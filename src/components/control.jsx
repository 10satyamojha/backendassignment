import React from "react";
import { Camera } from "lucide-react";

export default function Controls({ isScanning, scanComplete, cameraError, startScan }) {
  if (!isScanning && !scanComplete) {
    return (
      <div className="mb-8 text-center">
        <button
          onClick={startScan}
          disabled={cameraError}
          className="px-12 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-lg font-semibold rounded-full hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="inline-block w-5 h-5 mr-2" />
          Start Health Scan
        </button>
      </div>
    );
  }

  return null;
}
