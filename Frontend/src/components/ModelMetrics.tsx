import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { TrendingUp, Target, Activity, Zap, RefreshCw } from "lucide-react";
import { APP_CONFIG, API_ENDPOINTS } from "../constants";

type PerformanceMetric = {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  color: string;
  trend: string;
};

type ConfusionMatrix = {
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
};

type ModelInfo = {
  modelName: string;
  totalPredictions: number;
  evaluatedAt: string;
};

const getMetricColorClasses = (color: string) => {
  switch (color) {
    case "blue":
      return "bg-blue-50 text-blue-700";
    case "purple":
      return "bg-purple-50 text-purple-700";
    case "green":
      return "bg-green-50 text-green-700";
    case "orange":
      return "bg-orange-50 text-orange-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

export function ModelMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      title: "Accuracy",
      value: "--",
      description: "Overall model accuracy",
      icon: Target,
      color: "blue",
      trend: "--",
    },
    {
      title: "Precision",
      value: "--",
      description: "Positive prediction accuracy",
      icon: Zap,
      color: "purple",
      trend: "--",
    },
    {
      title: "Recall",
      value: "--",
      description: "True positive detection rate",
      icon: Activity,
      color: "green",
      trend: "--",
    },
    {
      title: "F1-Score",
      value: "--",
      description: "Harmonic mean of precision and recall",
      icon: TrendingUp,
      color: "orange",
      trend: "--",
    },
  ]);
  const [confusionMatrix] = useState<ConfusionMatrix | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metricsData, setMetricsData] = useState<any[]>([]);

  const fetchMetrics = () => {
    setLoading(true);
    setError(null);
    fetch(`${APP_CONFIG.apiUrl}${API_ENDPOINTS.METRICS}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          setMetricsData(result.data);
          if (result.data.length > 0) {
            const record = result.data[0];
            setMetrics([
              {
                title: "Accuracy",
                value: (record.accuracy * 100).toFixed(1) + "%",
                description: "Overall model accuracy",
                icon: Target,
                color: "blue",
                trend: record.modelName,
              },
              {
                title: "Precision",
                value: (record.precision * 100).toFixed(1) + "%",
                description: "Positive prediction accuracy",
                icon: Zap,
                color: "purple",
                trend: record.modelName,
              },
              {
                title: "Recall",
                value: (record.recall * 100).toFixed(1) + "%",
                description: "True positive detection rate",
                icon: Activity,
                color: "green",
                trend: record.modelName,
              },
              {
                title: "F1-Score",
                value: (record.f1Score * 100).toFixed(1) + "%",
                description: "Harmonic mean of precision and recall",
                icon: TrendingUp,
                color: "orange",
                trend: record.modelName,
              },
            ]);
            setModelInfo({
              modelName: record.modelName,
              totalPredictions: record.totalPredictions,
              evaluatedAt: record.evaluatedAt,
            });
          }
        } else {
          setError(result.message || "Failed to load metrics");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Network error: could not reach server");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl space-y-6">
        <div>
          <h1 className="text-gray-900">Model Performance Metrics</h1>
          <p className="text-gray-500 mt-1">
            Detailed performance analysis of the cancer detection model
          </p>
        </div>
        <Card className="p-12">
          <p className="text-gray-500 text-sm text-center">
            Loading metrics...
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl space-y-6">
        <div>
          <h1 className="text-gray-900">Model Performance Metrics</h1>
          <p className="text-gray-500 mt-1">
            Detailed performance analysis of the cancer detection model
          </p>
        </div>
        <Card className="p-12 text-center space-y-4">
          <p className="text-red-600 text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchMetrics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-gray-900">Model Performance Metrics</h1>
        <p className="text-gray-500 mt-1">
          Detailed performance analysis of the cancer detection model
        </p>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.length === 0 ? (
          <div className="col-span-4">
            <p className="text-gray-400 text-sm py-8 text-center">
              No metrics data available
            </p>
          </div>
        ) : (
          metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{metric.title}</p>
                    <p className="mt-2 text-3xl text-gray-900">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {metric.description}
                    </p>
                    <Badge className="mt-3 bg-green-100 text-green-800 border-0">
                      {metric.trend}
                    </Badge>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${getMetricColorClasses(metric.color)}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Confusion Matrix */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-gray-900">Confusion Matrix</h3>
          <p className="text-sm text-gray-500 mt-1">
            Classification performance breakdown
          </p>
        </div>

        {confusionMatrix === null ? (
          <p className="text-gray-400 text-sm py-8 text-center">
            No confusion matrix data available
          </p>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Matrix Labels */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div></div>
              <div className="text-center">
                <p className="text-sm text-gray-900">Predicted Positive</p>
                <p className="text-xs text-gray-500">(Cancerous)</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-900">Predicted Negative</p>
                <p className="text-xs text-gray-500">(Non-Cancerous)</p>
              </div>
            </div>

            {/* Matrix Grid */}
            {(() => {
              const total =
                confusionMatrix.truePositive +
                confusionMatrix.falsePositive +
                confusionMatrix.trueNegative +
                confusionMatrix.falseNegative;
              return (
                <div className="grid grid-cols-3 gap-4">
                  {/* Row 1 */}
                  <div className="flex items-center justify-end pr-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-900">Actual Positive</p>
                      <p className="text-xs text-gray-500">(Cancerous)</p>
                    </div>
                  </div>
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-600">True Positive</p>
                    <p className="text-2xl text-green-700 mt-2">
                      {confusionMatrix.truePositive}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((confusionMatrix.truePositive / total) * 100).toFixed(
                        1
                      )}
                      %
                    </p>
                  </div>
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-600">False Negative</p>
                    <p className="text-2xl text-red-700 mt-2">
                      {confusionMatrix.falseNegative}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((confusionMatrix.falseNegative / total) * 100).toFixed(
                        1
                      )}
                      %
                    </p>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center justify-end pr-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-900">Actual Negative</p>
                      <p className="text-xs text-gray-500">(Non-Cancerous)</p>
                    </div>
                  </div>
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-600">False Positive</p>
                    <p className="text-2xl text-red-700 mt-2">
                      {confusionMatrix.falsePositive}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((confusionMatrix.falsePositive / total) * 100).toFixed(
                        1
                      )}
                      %
                    </p>
                  </div>
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-600">True Negative</p>
                    <p className="text-2xl text-green-700 mt-2">
                      {confusionMatrix.trueNegative}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((confusionMatrix.trueNegative / total) * 100).toFixed(
                        1
                      )}
                      %
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Legend */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900 mb-2">
                Understanding the Matrix:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>
                  <strong>True Positive:</strong> Correctly identified cancer
                  cases
                </li>
                <li>
                  <strong>True Negative:</strong> Correctly identified
                  non-cancer cases
                </li>
                <li>
                  <strong>False Positive:</strong> Non-cancer incorrectly
                  identified as cancer
                </li>
                <li>
                  <strong>False Negative:</strong> Cancer incorrectly identified
                  as non-cancer
                </li>
              </ul>
            </div>
          </div>
        )}
      </Card>

      {/* Model Information */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">Model Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Model Version</p>
            <p className="text-gray-900 mt-1">
              {modelInfo?.modelName ?? "--"}
            </p>
            <Badge className="mt-2 bg-blue-100 text-blue-800 border-0">
              Current
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Evaluation Date</p>
            <p className="text-gray-900 mt-1">
              {modelInfo
                ? new Date(modelInfo.evaluatedAt).toLocaleDateString()
                : "--"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Predictions</p>
            <p className="text-gray-900 mt-1">
              {modelInfo
                ? modelInfo.totalPredictions.toLocaleString()
                : "--"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Model Architecture</p>
            <p className="text-gray-900 mt-1">--</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Input Resolution</p>
            <p className="text-gray-900 mt-1">--</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Inference Time</p>
            <p className="text-gray-900 mt-1">--</p>
          </div>
        </div>
      </Card>

      {/* Additional Metrics */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">Additional Performance Indicators</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">
                Sensitivity (True Positive Rate)
              </span>
              <span className="text-gray-900">
                {metricsData.length > 0
                  ? (metricsData[0].recall * 100).toFixed(1) + "%"
                  : "--"}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-green-600"
                style={{
                  width:
                    metricsData.length > 0
                      ? `${(metricsData[0].recall * 100).toFixed(1)}%`
                      : "0%",
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">
                Specificity (True Negative Rate)
              </span>
              <span className="text-gray-900">--</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-green-600" style={{ width: "0%" }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">
                Positive Predictive Value (Precision)
              </span>
              <span className="text-gray-900">
                {metricsData.length > 0
                  ? (metricsData[0].precision * 100).toFixed(1) + "%"
                  : "--"}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{
                  width:
                    metricsData.length > 0
                      ? `${(metricsData[0].precision * 100).toFixed(1)}%`
                      : "0%",
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Negative Predictive Value</span>
              <span className="text-gray-900">--</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: "0%" }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
