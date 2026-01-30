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
} from "lucide-react";
import { useState } from "react";

// Mock diagnosis data
const mockDiagnosis = {
  sampleId: "BCS-2024-0451",
  patientAge: 45,
  patientGender: "Female",
  hospitalId: "HSP-001",
  hospitalName: "City General Hospital",
  dateProcessed: "2024-01-24 14:35",
  prediction: "Cancerous",
  confidence: 94.8,
  cellType: "Acute Lymphoblastic Leukemia (ALL)",
  modelVersion: "v2.3.1",
  imageUrl: "https://images.unsplash.com/photo-1636386689060-37d233b5d345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9vZCUyMGNlbGxzJTIwbWljcm9zY29wZXxlbnwxfHx8fDE3NjkyNzk4NjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
};

export function DiagnosisResults() {
  const [doctorNotes, setDoctorNotes] = useState("");
  const isCancerous = mockDiagnosis.prediction === "Cancerous";

  const handleSaveNotes = () => {
    alert("Doctor notes saved successfully!");
  };

  const handleDownloadReport = () => {
    alert("Downloading diagnosis report...");
  };

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
        <Button onClick={handleDownloadReport} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

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
        {/* Blood Cell Image Preview */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Uploaded Blood Cell Image</h3>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={mockDiagnosis.imageUrl}
              alt="Blood cell sample"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Sample ID:</span>
              <span className="text-gray-900">{mockDiagnosis.sampleId}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Processed:</span>
              <span className="text-gray-900">{mockDiagnosis.dateProcessed}</span>
            </div>
          </div>
        </Card>

        {/* Diagnosis Details */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Diagnosis Details</h3>
          <div className="space-y-4">
            {/* Prediction Result */}
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
                  {mockDiagnosis.prediction}
                </Badge>
                <span className="text-sm text-gray-500">
                  {mockDiagnosis.confidence}% confidence
                </span>
              </div>
            </div>

            {/* Confidence Score */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Confidence Score</span>
                <span className="text-gray-900">{mockDiagnosis.confidence}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    isCancerous ? "bg-red-600" : "bg-green-600"
                  }`}
                  style={{ width: `${mockDiagnosis.confidence}%` }}
                />
              </div>
            </div>

            {/* Cell Classification */}
            {isCancerous && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <p className="text-sm text-gray-600 mb-1">Cell Classification</p>
                <p className="text-red-900">{mockDiagnosis.cellType}</p>
              </div>
            )}

            {/* Model Version */}
            <div className="text-sm">
              <span className="text-gray-600">Model Version: </span>
              <span className="text-gray-900">{mockDiagnosis.modelVersion}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Patient Information */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">Patient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Age / Gender</p>
              <p className="text-gray-900">
                {mockDiagnosis.patientAge} years / {mockDiagnosis.patientGender}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Hospital</p>
              <p className="text-gray-900">{mockDiagnosis.hospitalName}</p>
              <p className="text-sm text-gray-500">{mockDiagnosis.hospitalId}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Analysis Date</p>
              <p className="text-gray-900">{mockDiagnosis.dateProcessed}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Doctor Notes Section */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">Doctor Notes</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doctorNotes">Clinical Observations & Recommendations</Label>
            <Textarea
              id="doctorNotes"
              placeholder="Enter your clinical observations, recommended treatments, or follow-up actions..."
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              rows={6}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline">Clear</Button>
            <Button onClick={handleSaveNotes} className="bg-blue-600 hover:bg-blue-700">
              Save Notes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}