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

// Mock data for statistics
const stats = [
  {
    title: "Total Samples Processed",
    value: "1,547",
    change: "+12% from last month",
    icon: Activity,
    color: "blue",
  },
  {
    title: "Cancer Detected Cases",
    value: "328",
    change: "21.2% detection rate",
    icon: AlertCircle,
    color: "red",
  },
  {
    title: "Pending Diagnoses",
    value: "23",
    change: "Requires review",
    icon: Clock,
    color: "yellow",
  },
  {
    title: "Model Accuracy",
    value: "98.5%",
    change: "+0.3% this week",
    icon: TrendingUp,
    color: "green",
  },
];

// Mock data for trends over time
const trendData = [
  { month: "Jan", detected: 45, total: 210 },
  { month: "Feb", detected: 52, total: 225 },
  { month: "Mar", detected: 48, total: 218 },
  { month: "Apr", detected: 61, total: 242 },
  { month: "May", detected: 58, total: 235 },
  { month: "Jun", detected: 64, total: 250 },
];

// Mock data for hospital distribution
const hospitalData = [
  { hospital: "City General", cases: 342 },
  { hospital: "St. Mary's", cases: 289 },
  { hospital: "University Med", cases: 415 },
  { hospital: "Regional Care", cases: 267 },
  { hospital: "Metro Health", cases: 234 },
];

// Mock data for pie chart
const predictionData = [
  { name: "Non-Cancerous", value: 1219, color: "#22c55e" },
  { name: "Cancerous", value: 328, color: "#ef4444" },
];

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

export function DashboardOverview() {
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
        {stats.map((stat) => {
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
        })}
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
        </Card>

        {/* Hospital-wise Distribution */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-gray-900">Hospital-wise Case Distribution</h3>
            <p className="text-sm text-gray-500 mt-1">
              Total cases processed by facility
            </p>
          </div>
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
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500 mt-1">Latest system activities</p>
          </div>
          <div className="space-y-4">
            {[
              {
                title: "New sample analyzed",
                detail: "Sample ID: BCS-2024-0451",
                time: "5 minutes ago",
                status: "success",
              },
              {
                title: "Cancer detected - Requires review",
                detail: "Sample ID: BCS-2024-0450",
                time: "12 minutes ago",
                status: "warning",
              },
              {
                title: "Batch processing completed",
                detail: "15 samples processed",
                time: "1 hour ago",
                status: "success",
              },
              {
                title: "Model retrained successfully",
                detail: "Accuracy: 98.5%",
                time: "2 hours ago",
                status: "info",
              },
              {
                title: "New user registered",
                detail: "Dr. Michael Chen - Lab Technician",
                time: "3 hours ago",
                status: "info",
              },
            ].map((activity, index) => (
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
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
