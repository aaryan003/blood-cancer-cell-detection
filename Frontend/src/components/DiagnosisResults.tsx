import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  Building2,
  FileText,
  Download,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { APP_CONFIG, API_ENDPOINTS } from "../constants";

type DiagnosisListItem = {
  id: string;
  result: string;
  confidence: number;
  modelName: string;
  cellBreakdown: Record<string, number>;
  heatmapUrl: string | null;
  createdAt: string;
  patientName: string;
  sampleId: string;
  hospitalName: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function DiagnosisResults() {
  const [doctorNotes, setDoctorNotes] = useState("");
  const [diagnoses, setDiagnoses] = useState<DiagnosisListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [selectedDiagnosis, setSelectedDiagnosis] =
    useState<DiagnosisListItem | null>(null);

  const fetchDiagnoses = (page: number) => {
    setLoading(true);
    setError(null);
    fetch(
      `${APP_CONFIG.apiUrl}${API_ENDPOINTS.DIAGNOSES}?page=${page}&limit=${pagination.limit}`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setDiagnoses(result.data);
          setPagination((prev) => ({ ...prev, ...result.pagination, page }));
        } else {
          setError(result.message || "Failed to load diagnoses");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Network error: could not reach server");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDiagnoses(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  const handleSaveNotes = () => {
    alert("Doctor notes saved successfully!");
  };

  const handleDownloadReport = () => {
    alert("Downloading diagnosis report...");
  };

  const isCancerous = selectedDiagnosis?.result === "Cancerous";

  return (
    <div className="max-w-6xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Diagnosis Results</h1>
          <p className="text-gray-500 mt-1">
            Detailed analysis and prediction results
          </p>
        </div>
        {selectedDiagnosis && (
          <Button
            onClick={handleDownloadReport}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        )}
      </div>

      {/* Diagnosis List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-gray-900">All Diagnoses</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm">Loading diagnoses...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <p className="text-red-600 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDiagnoses(pagination.page)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : diagnoses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">No diagnoses found.</p>
          </div>
        ) : (
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
                    Hospital
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {diagnoses.map((d) => (
                  <tr
                    key={d.id}
                    className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                      selectedDiagnosis?.id === d.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() =>
                      setSelectedDiagnosis(
                        selectedDiagnosis?.id === d.id ? null : d
                      )
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {d.sampleId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {d.patientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {d.hospitalName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          d.result === "Cancerous"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {d.result}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(d.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {d.modelName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && pagination.totalPages > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Selected Diagnosis Detail */}
      {selectedDiagnosis && (
        <>
          {/* Alert Banner */}
          <div
            className={`p-4 rounded-lg border ${
              isCancerous
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {isCancerous ? (
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h3
                  className={`${
                    isCancerous ? "text-red-900" : "text-green-900"
                  }`}
                >
                  {isCancerous ? "Cancer Detected" : "No Cancer Detected"}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    isCancerous ? "text-red-700" : "text-green-700"
                  }`}
                >
                  {isCancerous
                    ? "This sample has been flagged for immediate medical review. Please consult with a specialist."
                    : "The blood cell sample appears normal. Continue routine monitoring as prescribed."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sample Info */}
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Sample Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Sample ID:</span>
                  <span className="text-gray-900">
                    {selectedDiagnosis.sampleId}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Patient:</span>
                  <span className="text-gray-900">
                    {selectedDiagnosis.patientName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Hospital:</span>
                  <span className="text-gray-900">
                    {selectedDiagnosis.hospitalName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Processed:</span>
                  <span className="text-gray-900">
                    {new Date(selectedDiagnosis.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Diagnosis Details */}
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Diagnosis Details</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Model Prediction</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${
                        isCancerous
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {selectedDiagnosis.result}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {(selectedDiagnosis.confidence * 100).toFixed(1)}%
                      confidence
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Confidence Score</span>
                    <span className="text-gray-900">
                      {(selectedDiagnosis.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        isCancerous ? "bg-red-600" : "bg-green-600"
                      }`}
                      style={{
                        width: `${(selectedDiagnosis.confidence * 100).toFixed(1)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-gray-600">Model: </span>
                  <span className="text-gray-900">
                    {selectedDiagnosis.modelName}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Doctor Notes Section */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Doctor Notes</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctorNotes">
                  Clinical Observations &amp; Recommendations
                </Label>
                <Textarea
                  id="doctorNotes"
                  placeholder="Enter your clinical observations, recommended treatments, or follow-up actions..."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDoctorNotes("")}>
                  Clear
                </Button>
                <Button
                  onClick={handleSaveNotes}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Notes
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
