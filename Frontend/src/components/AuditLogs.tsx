import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Shield, User, RefreshCw } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { APP_CONFIG, API_ENDPOINTS } from "../constants";

type AuditLog = {
  id: number;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
  severity: string;
  icon: LucideIcon;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

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
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchLogs = (page: number) => {
    setLoading(true);
    setError(null);
    fetch(
      `${APP_CONFIG.apiUrl}${API_ENDPOINTS.AUDIT_LOGS}?page=${page}&limit=${pagination.limit}`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          const mapped: AuditLog[] = result.data.map(
            (item: any, index: number) => ({
              id: index,
              timestamp: new Date(item.createdAt).toLocaleString(),
              user: item.userName,
              role: item.userRole,
              action: item.action,
              details: "",
              ipAddress: item.ipAddress,
              severity: "info",
              icon: Shield,
            })
          );
          setLogs(mapped);
          setPagination((prev) => ({ ...prev, ...result.pagination, page }));
        } else {
          setError(result.message || "Failed to load audit logs");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Network error: could not reach server");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-gray-900">Audit &amp; Security Logs</h1>
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
              <p className="text-2xl text-gray-900">
                {loading ? "--" : pagination.total}
              </p>
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
              <p className="text-2xl text-gray-900">--</p>
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
              <p className="text-2xl text-gray-900">--</p>
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
              <p className="text-2xl text-gray-900">--</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Audit Log List */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-sm">Loading audit logs...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center space-y-4">
              <p className="text-red-600 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchLogs(pagination.page)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-sm">
                No audit log entries available
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const Icon = log.icon;
              return (
                <div
                  key={log.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
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
                          {log.details && (
                            <p className="text-sm text-gray-600 mb-2">
                              {log.details}
                            </p>
                          )}
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
            })
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {loading
              ? "Loading..."
              : error
              ? "Error loading data"
              : pagination.total === 0
              ? "No entries"
              : `Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} total)`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || pagination.page <= 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || pagination.page >= pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
