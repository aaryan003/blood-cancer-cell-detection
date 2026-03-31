import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Eye, Download, Calendar, User, RefreshCw } from "lucide-react";
import { APP_CONFIG, API_ENDPOINTS } from "../constants";

type Report = {
  id: string;
  patientId: string;
  age: number;
  gender: string;
  date: string;
  result: string;
  confidence: number;
  hospital: string;
  status: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function PatientReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchReports = (page: number) => {
    setLoading(true);
    setError(null);
    fetch(
      `${APP_CONFIG.apiUrl}${API_ENDPOINTS.REPORTS}?page=${page}&limit=${pagination.limit}`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          const mapped: Report[] = result.data.map((item: any) => ({
            id: item.id,
            patientId: item.sampleId,
            age: item.patientAge,
            gender: item.patientGender,
            date: new Date(item.createdAt).toLocaleDateString(),
            result: item.diagnosisResult || "Pending",
            confidence: item.diagnosisConfidence
              ? Math.round(item.diagnosisConfidence * 100)
              : 0,
            hospital: item.hospitalName,
            status: item.diagnosisResult ? "Completed" : "Pending",
          }));
          setReports(mapped);
          setPagination((prev) => ({ ...prev, ...result.pagination, page }));
        } else {
          setError(result.message || "Failed to load reports");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Network error: could not reach server");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Patient Reports</h1>
          <p className="text-gray-500 mt-1">
            View and manage all patient diagnosis reports
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by Sample ID, Patient ID, or Hospital..."
              className="pl-10"
            />
          </div>
          <select className="h-10 rounded-md border border-input bg-input-background px-3 py-2 text-sm">
            <option>All Results</option>
            <option>Cancerous Only</option>
            <option>Non-Cancerous Only</option>
          </select>
          <select className="h-10 rounded-md border border-input bg-input-background px-3 py-2 text-sm">
            <option>All Statuses</option>
            <option>Reviewed</option>
            <option>Pending Review</option>
          </select>
        </div>
      </Card>

      {/* Reports Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Sample ID
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Hospital
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    Loading reports...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <p className="text-red-600 text-sm mb-3">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchReports(pagination.page)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-sm text-gray-400"
                  >
                    No patient reports available
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.patientId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">
                            {report.patientId}
                          </p>
                          <p className="text-xs text-gray-500">
                            {report.age}y, {report.gender}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {report.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {report.hospital}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          report.result === "Cancerous"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {report.result}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.confidence}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          report.status === "Completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {report.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {loading
              ? "Loading..."
              : error
              ? "Error loading data"
              : pagination.total === 0
              ? "No results"
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
