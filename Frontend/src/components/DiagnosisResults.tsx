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

type DiagnosisData = {
  sampleId: string;
  patientAge: number;
  patientGender: string;
  hospitalId: string;
  hospitalName: string;
  dateProcessed: string;
  prediction: string;
  confidence: number;
  cellType?: string;
  modelVersion: string;
  imageUrl?: string;
};

export function DiagnosisResults() {
  const [doctorNotes, setDoctorNotes] = useState("");
  const [diagnosis] = useState<DiagnosisData | null>(null);

  const isCancerous = diagnosis?.prediction === "Cancerous";

  const handleSaveNotes = () => {
    alert("Doctor notes saved successfully!");
  };

  const handleDownloadReport = () => {
    alert("Downloading diagnosis report...");
  };

  if (diagnosis === null) {
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
        <Card className="p-12">
          <p className="text-gray-400 text-sm text-center">
            No diagnosis data loaded. Select a diagnosis to view results.
          </p>
        </Card>
      </div>
    );
  }

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
            {diagnosis.imageUrl ? (
              <img
                src={diagnosis.imageUrl}
                alt="Blood cell sample"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-400 text-sm">No image available</p>
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Sample ID:</span>
              <span className="text-gray-900">{diagnosis.sampleId}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Processed:</span>
              <span className="text-gray-900">{diagnosis.dateProcessed}</span>
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
                  {diagnosis.prediction}
                </Badge>
                <span className="text-sm text-gray-500">
                  {diagnosis.confidence}% confidence
                </span>
              </div>
            </div>

            {/* Confidence Score */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Confidence Score</span>
                <span className="text-gray-900">{diagnosis.confidence}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    isCancerous ? "bg-red-600" : "bg-green-600"
                  }`}
                  style={{ width: `${diagnosis.confidence}%` }}
                />
              </div>
            </div>

            {/* Cell Classification */}
            {isCancerous && diagnosis.cellType && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <p className="text-sm text-gray-600 mb-1">Cell Classification</p>
                <p className="text-red-900">{diagnosis.cellType}</p>
              </div>
            )}

            {/* Model Version */}
            <div className="text-sm">
              <span className="text-gray-600">Model Version: </span>
              <span className="text-gray-900">{diagnosis.modelVersion}</span>
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
                {diagnosis.patientAge} years / {diagnosis.patientGender}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Hospital</p>
              <p className="text-gray-900">{diagnosis.hospitalName}</p>
              <p className="text-sm text-gray-500">{diagnosis.hospitalId}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Analysis Date</p>
              <p className="text-gray-900">{diagnosis.dateProcessed}</p>
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
