import React from "react";

export default function HealthMetricsGrid({ healthMetrics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {healthMetrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <div
            key={index}
            className={`bg-white/80 backdrop-blur-sm rounded-2xl border-2 ${metric.borderColor} p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${metric.bgColor}`}
          >
            {/* Icon Circle */}
            <div className="flex items-center justify-center mb-6">
              <div
                className={`w-16 h-16 ${metric.bgColor} rounded-full flex items-center justify-center border-2 ${metric.borderColor}`}
              >
                <IconComponent className={`h-8 w-8 ${metric.color}`} />
              </div>
            </div>

            {/* Metric Label */}
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              {metric.label}
            </h3>

            {/* Metric Value */}
            <div className="text-center mb-4">
              <div className="flex items-baseline justify-center space-x-2">
                <span className="text-4xl font-bold text-gray-900">
                  {metric.value}
                </span>
                {metric.unit && (
                  <span className="text-lg text-gray-500">{metric.unit}</span>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="text-center">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${metric.color} ${metric.bgColor} border ${metric.borderColor}`}
              >
                {metric.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
