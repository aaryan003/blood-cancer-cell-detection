import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Search, Shield, User, Upload, FileText, Settings, LogIn } from "lucide-react";

// Mock audit log data
const auditLogs = [
  {
    id: 1,
    timestamp: "2024-01-24 14:35:22",
    user: "Dr. Sarah Johnson",
    role: "Doctor",
    action: "Sample Analyzed",
    details: "Sample BCS-2024-0451 processed",
    ipAddress: "192.168.1.45",
    severity: "info",
    icon: FileText,
  },
  {
    id: 2,
    timestamp: "2024-01-24 14:30:15",
    user: "Dr. Sarah Johnson",
    role: "Doctor",
    action: "Image Uploaded",
    details: "Blood cell image uploaded for sample BCS-2024-0451",
    ipAddress: "192.168.1.45",
    severity: "info",
    icon: Upload,
  },
  {
    id: 3,
    timestamp: "2024-01-24 14:15:08",
    user: "Admin",
    role: "System Admin",
    action: "User Created",
    details: "New user account created: Dr. Michael Chen",
    ipAddress: "192.168.1.10",
    severity: "warning",
    icon: User,
  },
  {
    id: 4,
    timestamp: "2024-01-24 13:55:42",
    user: "Lab Tech - Maria Garcia",
    role: "Lab Technician",
    action: "Report Downloaded",
    details: "Downloaded diagnosis report for BCS-2024-0450",
    ipAddress: "192.168.1.67",
    severity: "info",
    icon: FileText,
  },
  {
    id: 5,
    timestamp: "2024-01-24 13:20:33",
    user: "Admin",
    role: "System Admin",
    action: "Model Updated",
    details: "Model version updated to v2.3.1",
    ipAddress: "192.168.1.10",
    severity: "critical",
    icon: Settings,
  },
  {
    id: 6,
    timestamp: "2024-01-24 12:45:18",
    user: "Dr. James Wilson",
    role: "Doctor",
    action: "Login",
    details: "Successful login from web portal",
    ipAddress: "192.168.1.89",
    severity: "info",
    icon: LogIn,
  },
  {
    id: 7,
    timestamp: "2024-01-24 11:30:55",
    user: "Dr. Sarah Johnson",
    role: "Doctor",
    action: "Unauthorized Access Attempt",
    details: "Failed to access admin panel (insufficient permissions)",
    ipAddress: "192.168.1.45",
    severity: "warning",
    icon: Shield,
  },
  {
    id: 8,
    timestamp: "2024-01-24 10:15:27",
    user: "System",
    role: "System",
    action: "Automated Backup",
    details: "Database backup completed successfully",
    ipAddress: "localhost",
    severity: "info",
    icon: Settings,
  },
];

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800";
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    case "info":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function AuditLogs() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-gray-900">Audit & Security Logs</h1>
        <p className="text-gray-500 mt-1">
          System activity monitoring and security audit trail
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search logs by user, action, or details..."
              className="pl-10"
            />
          </div>
          <select className="h-10 rounded-md border border-input bg-input-background px-3 py-2 text-sm">
            <option>All Severities</option>
            <option>Critical</option>
            <option>Warning</option>
            <option>Info</option>
          </select>
          <select className="h-10 rounded-md border border-input bg-input-background px-3 py-2 text-sm">
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Custom Range</option>
          </select>
        </div>
      </Card>

      {/* Security Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Shield className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl text-gray-900">1,245</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <Shield className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Critical Events</p>
              <p className="text-2xl text-gray-900">3</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Shield className="w-6 h-6 text-yellow-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Warnings</p>
              <p className="text-2xl text-gray-900">12</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <User className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl text-gray-900">42</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Audit Log List */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-gray-200">
          {auditLogs.map((log) => {
            const Icon = log.icon;
            return (
              <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-gray-900">{log.action}</h4>
                          <Badge className={getSeverityBadge(log.severity)}>
                            {log.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.user} ({log.role})
                          </span>
                          <span>IP: {log.ipAddress}</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {log.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Showing 8 of 1,245 audit log entries
          </p>
        </div>
      </Card>
    </div>
  );
}
