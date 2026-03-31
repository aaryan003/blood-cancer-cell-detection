import { useState, useEffect, useCallback } from "react";
import { Card } from "./ui/card";
import { Activity, AlertCircle, Clock, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { APP_CONFIG, API_ENDPOINTS } from "../constants";

const getStatColorClasses = (color: string) => {
  switch (color) {
    case "blue":
      return "bg-blue-50 text-blue-700";
    case "red":
      return "bg-red-50 text-red-700";
    case "yellow":
      return "bg-yellow-50 text-yellow-700";
    case "green":
      return "bg-green-50 text-green-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

type StatItem = {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
};

type TrendItem = { month: string; detected: number; total: number };
type HospitalItem = { hospital: string; cases: number };
type PredictionItem = { name: string; value: number; color: string };
type ActivityItem = { title: string; detail: string; time: string; status: string };

export function DashboardOverview() {
  const [stats, setStats] = useState<StatItem[]>([
    { title: "Total Samples Processed", value: "--", change: "--", icon: Activity, color: "blue" },
    { title: "Cancer Detected Cases", value: "--", change: "--", icon: AlertCircle, color: "red" },
    { title: "Pending Diagnoses", value: "--", change: "--", icon: Clock, color: "yellow" },
    { title: "Model Accuracy", value: "--", change: "--", icon: TrendingUp, color: "green" },
  ]);
  const [trendData, setTrendData] = useState<TrendItem[]>([]);
  const [hospitalData, setHospitalData] = useState<HospitalItem[]>([]);
  const [predictionData, setPredictionData] = useState<PredictionItem[]>([]);
  const [recentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, trendsRes, hospitalsRes] = await Promise.all([
        fetch(`${APP_CONFIG.apiUrl}${API_ENDPOINTS.DASHBOARD.STATS}`),
        fetch(`${APP_CONFIG.apiUrl}${API_ENDPOINTS.DASHBOARD.TRENDS}`),
        fetch(`${APP_CONFIG.apiUrl}${API_ENDPOINTS.DASHBOARD.HOSPITALS}`),
      ]);

      const [statsJson, trendsJson, hospitalsJson] = await Promise.all([
        statsRes.json(),
        trendsRes.json(),
        hospitalsRes.json(),
      ]);

      const statsData = statsJson.data;
      const { totalSamples, detectionRate, pendingDiagnoses, modelAccuracy } = statsData;

      setStats([
        {
          title: "Total Samples Processed",
          value: totalSamples.toLocaleString(),
          change: "Total processed",
          icon: Activity,
          color: "blue",
        },
        {
          title: "Cancer Detected Cases",
          value: detectionRate.toFixed(1) + "%",
          change: "Detection rate",
          icon: AlertCircle,
          color: "red",
        },
        {
          title: "Pending Diagnoses",
          value: pendingDiagnoses.toString(),
          change: "Awaiting review",
          icon: Clock,
          color: "yellow",
        },
        {
          title: "Model Accuracy",
          value: modelAccuracy.toFixed(1) + "%",
          change: "Current accuracy",
          icon: TrendingUp,
          color: "green",
        },
      ]);

      const mappedTrends: TrendItem[] = (trendsJson.data as { month: string; cancerous: number; nonCancerous: number }[]).map(
        (item) => ({
          month: item.month,
          detected: item.cancerous,
          total: item.cancerous + item.nonCancerous,
        })
      );
      setTrendData(mappedTrends);

      const mappedHospitals: HospitalItem[] = (
        hospitalsJson.data as { name: string; totalSamples: number; cancerousCount: number; detectionRate: number }[]
      ).map((item) => ({
        hospital: item.name,
        cases: item.totalSamples,
      }));
      setHospitalData(mappedHospitals);

      const cancerousCount = Math.round((totalSamples * detectionRate) / 100);
      const nonCancerousCount = totalSamples - cancerousCount;
      setPredictionData([
        { name: "Cancerous", value: cancerousCount, color: "#ef4444" },
        { name: "Non-Cancerous", value: nonCancerousCount, color: "#22c55e" },
      ]);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">
          Blood Cancer Cell Detection System Analytics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.length === 0 ? (
          <div className="col-span-4">
            <p className="text-gray-400 text-sm py-8 text-center">No data available</p>
          </div>
        ) : (
          stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="mt-2 text-3xl text-gray-900">{stat.value}</p>
                    <p className="mt-2 text-sm text-gray-500">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${getStatColorClasses(stat.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detection Trends Over Time */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-gray-900">Detection Trends Over Time</h3>
            <p className="text-sm text-gray-500 mt-1">
              Monthly comparison of detected cases
            </p>
          </div>
          {trendData.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total Samples"
                />
                <Line
                  type="monotone"
                  dataKey="detected"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Cancer Detected"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Hospital-wise Distribution */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-gray-900">Hospital-wise Case Distribution</h3>
            <p className="text-sm text-gray-500 mt-1">
              Total cases processed by facility
            </p>
          </div>
          {hospitalData.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hospitalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hospital" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="cases" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cancer vs Non-Cancer Predictions */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-gray-900">Cancer vs Non-Cancer Predictions</h3>
            <p className="text-sm text-gray-500 mt-1">
              Distribution of diagnosis results
            </p>
          </div>
          {predictionData.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={predictionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {predictionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500 mt-1">Latest system activities</p>
          </div>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">No data available</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.status === "success"
                        ? "bg-green-500"
                        : activity.status === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.detail}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
