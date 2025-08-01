import React from "react";
import HealthMetricsGrid from "./health";
import { Download, CheckCircle, AlertTriangle, Activity } from "lucide-react";

export default function ResultsPage({
  recordedVideo,
  downloadRecording,
  recordingDuration,
  healthMetrics,
  resetScan,
  formatTime,
  analysisResults,
  isAnalyzing
}) {
  
  // Calculate overall health status based on actual metrics
  const calculateOverallHealth = () => {
    if (!analysisResults?.results || isAnalyzing) {
      return {
        status: "Processing",
        color: "blue",
        icon: Activity,
        description: "Analysis in progress..."
      };
    }

    const results = analysisResults.results;
    let healthScore = 0;
    let checkedMetrics = 0;

    // Heart rate check (60-100 normal)
    if (results.heart_rate?.value) {
      const hr = results.heart_rate.value;
      if (hr >= 60 && hr <= 100) healthScore += 1;
      else if (hr >= 50 && hr <= 110) healthScore += 0.7;
      else healthScore += 0.3;
      checkedMetrics++;
    }

    // SpO2 check (95-100 normal)
    if (results.spo2?.value) {
      const spo2 = results.spo2.value;
      if (spo2 >= 95) healthScore += 1;
      else if (spo2 >= 90) healthScore += 0.6;
      else healthScore += 0.2;
      checkedMetrics++;
    }

    // Blood pressure check (systolic < 130, diastolic < 85)
    if (results.blood_pressure?.systolic && results.blood_pressure?.diastolic) {
      const sys = results.blood_pressure.systolic;
      const dia = results.blood_pressure.diastolic;
      if (sys < 130 && dia < 85) healthScore += 1;
      else if (sys < 140 && dia < 90) healthScore += 0.7;
      else healthScore += 0.4;
      checkedMetrics++;
    }

    // Respiratory rate check (12-20 normal)
    if (results.respiratory_rate?.value) {
      const rr = results.respiratory_rate.value;
      if (rr >= 12 && rr <= 20) healthScore += 1;
      else if (rr >= 10 && rr <= 24) healthScore += 0.7;
      else healthScore += 0.4;
      checkedMetrics++;
    }

    // Stress level check
    if (results.stress_indicator?.value) {
      const stress = results.stress_indicator.value.toLowerCase();
      if (stress.includes('low') || stress.includes('normal')) healthScore += 1;
      else if (stress.includes('moderate')) healthScore += 0.6;
      else healthScore += 0.3;
      checkedMetrics++;
    }

    if (checkedMetrics === 0) {
      return {
        status: "Insufficient Data",
        color: "gray",
        icon: AlertTriangle,
        description: "Unable to determine overall health status due to insufficient data."
      };
    }

    const averageScore = healthScore / checkedMetrics;

    if (averageScore >= 0.85) {
      return {
        status: "Excellent Health",
        color: "green",
        icon: CheckCircle,
        description: "Your vital signs are within optimal ranges. Continue maintaining your healthy lifestyle with regular exercise, balanced nutrition, and adequate rest. Consider scheduling regular check-ups with your healthcare provider to maintain this excellent health status."
      };
    } else if (averageScore >= 0.7) {
      return {
        status: "Good Health",
        color: "blue",
        icon: CheckCircle,
        description: "Most of your vital signs are within normal ranges. Some metrics may benefit from attention through lifestyle adjustments. Continue healthy habits and consult with a healthcare provider for personalized guidance."
      };
    } else if (averageScore >= 0.5) {
      return {
        status: "Monitor Health",
        color: "yellow",
        icon: AlertTriangle,
        description: "Several vital signs may be outside optimal ranges. Consider consulting with a healthcare provider for a comprehensive evaluation and personalized health recommendations."
      };
    } else {
      return {
        status: "Consult Healthcare Provider",
        color: "red",
        icon: AlertTriangle,
        description: "Multiple vital signs appear to be outside normal ranges. We recommend consulting with a healthcare provider promptly for proper evaluation and guidance."
      };
    }
  };

  const healthStatus = calculateOverallHealth();
  const StatusIcon = healthStatus.icon;

  const getStatusColors = (color) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-100/80',
          border: 'border-green-200',
          text: 'text-green-800',
          dot: 'bg-green-500'
        };
      case 'blue':
        return {
          bg: 'bg-teal-100/80',
          border: 'border-teal-200',
          text: 'text-teal-800',
          dot: 'bg-teal-500'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-100/80',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          dot: 'bg-yellow-500'
        };
      case 'red':
        return {
          bg: 'bg-red-100/80',
          border: 'border-red-200',
          text: 'text-red-800',
          dot: 'bg-red-500'
        };
      default:
        return {
          bg: 'bg-gray-100/80',
          border: 'border-gray-200',
          text: 'text-gray-800',
          dot: 'bg-gray-500'
        };
    }
  };

  const statusColors = getStatusColors(healthStatus.color);

  return (
    <div className="animate-fade-in mt-8">
      {/* Header and Download */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Health Analysis Results</h2>
        <p className="text-xl text-gray-600">
          Your vital signs have been analyzed using AI technology
        </p>
        {recordedVideo && (
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-2">
              Recording Duration: {formatTime(recordingDuration)}
            </p>
            <button
              onClick={downloadRecording}
              className="px-6 py-2 bg-teal-100 text-teal-700 rounded-full hover:bg-teal-200 transition-all duration-200 text-sm font-medium flex items-center space-x-2 mx-auto"
            >
              <Download className="w-4 h-4" />
              <span>Download Scan Recording</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <HealthMetricsGrid healthMetrics={healthMetrics} />

      {/* Overall Summary - Dynamic based on actual results */}
      <div className="bg-gradient-to-r from-teal-50/80 via-blue-50/80 to-teal-50/80 backdrop-blur-sm rounded-3xl p-8 mb-12 border border-teal-100/50 shadow-xl">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Overall Health Status</h3>
          <div className={`inline-flex items-center px-6 py-3 ${statusColors.bg} backdrop-blur-sm rounded-full border-2 ${statusColors.border} mb-6`}>
            <div className={`w-4 h-4 ${statusColors.dot} rounded-full mr-3 ${healthStatus.color === 'green' ? 'animate-pulse' : ''}`}></div>
            <StatusIcon className={`w-5 h-5 ${statusColors.text} mr-2`} />
            <span className={`${statusColors.text} font-semibold text-lg`}>{healthStatus.status}</span>
          </div>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto leading-relaxed">
            {healthStatus.description}
          </p>
          
          {/* Additional info based on results */}
          {analysisResults?.results && (
            <div className="mt-6 pt-6 border-t border-teal-200/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-medium text-gray-600">Metrics Analyzed</div>
                  <div className="text-xl font-bold text-gray-900">
                    {Object.keys(analysisResults.results).length}
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-medium text-gray-600">Avg Confidence</div>
                  <div className="text-xl font-bold text-gray-900">
                    {Math.round(
                      Object.values(analysisResults.results)
                        .filter(metric => metric?.confidence)
                        .reduce((sum, metric) => sum + metric.confidence, 0) /
                      Object.values(analysisResults.results).filter(metric => metric?.confidence).length * 100
                    ) || 0}%
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-medium text-gray-600">Video Quality</div>
                  <div className="text-xl font-bold text-gray-900">120 FPS</div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-medium text-gray-600">Analysis Time</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatTime(recordingDuration)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-amber-800 text-sm">
            <p className="font-semibold mb-2">Important Medical Disclaimer</p>
            <p>
              These measurements are AI-generated estimates for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. 
              Always consult with qualified healthcare providers for proper medical evaluation and guidance. 
              If you have health concerns or symptoms, seek immediate medical attention.
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <button
          onClick={resetScan}
          className="px-12 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white text-lg font-semibold rounded-full hover:from-teal-600 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-teal-300 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
        >
          New Health Scan
        </button>
      </div>
    </div>
  );
}