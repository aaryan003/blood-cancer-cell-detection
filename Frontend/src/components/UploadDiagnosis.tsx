import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Upload, FileText, Image as ImageIcon, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { APP_CONFIG, API_ENDPOINTS } from "../constants";

const MODEL_OPTIONS = [
  {
    value: "bccd",
    label: "Base BCCD Model",
    description: "Standard blood cell detection model",
  },
  {
    value: "efficientnet",
    label: "EfficientNet Model",
    description: "Enhanced accuracy neural network",
  },
  {
    value: "both",
    label: "Both Models (Comparison)",
    description: "Run both models and compare results side-by-side",
  },
];

interface SinglePrediction {
  prediction: string;
  confidence: number;
  model: string;
  cell_type_summary?: Record<string, number>;
  gradcam_heatmap?: string;
}

interface PredictionData {
  diagnosis: { id: string; result: string; confidence: number; modelName: string };
  prediction:
    | (SinglePrediction & { comparison?: false })
    | { comparison: true; results: { bccd: SinglePrediction; efficientnet: SinglePrediction } };
}

function SingleModelResult({ pred }: { pred: SinglePrediction }) {
  const isCancerous = pred.prediction?.toLowerCase() === "cancerous";
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            isCancerous ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {pred.prediction}
        </span>
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          Model: {pred.model}
        </span>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Confidence</span>
          <span className="font-medium">{(pred.confidence * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${isCancerous ? "bg-red-500" : "bg-green-500"}`}
            style={{ width: `${(pred.confidence * 100).toFixed(1)}%` }}
          />
        </div>
      </div>

      {pred.cell_type_summary && Object.keys(pred.cell_type_summary).length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Cell Breakdown</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(pred.cell_type_summary).map(([cellType, count]) => (
              <div key={cellType} className="flex justify-between text-sm bg-gray-50 px-3 py-1 rounded">
                <span className="text-gray-600 capitalize">{cellType}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pred.gradcam_heatmap && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Grad-CAM Heatmap</p>
          <img
            src={pred.gradcam_heatmap}
            alt="Grad-CAM Heatmap"
            className="w-full rounded-lg border border-gray-200"
          />
        </div>
      )}
    </div>
  );
}

export function UploadDiagnosis() {
  const navigate = useNavigate();
  const [bloodCellImage, setBloodCellImage] = useState<File | null>(null);
  const [labReport, setLabReport] = useState<File | null>(null);
  const [modelSelection, setModelSelection] = useState("bccd");
  const [submitting, setSubmitting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionData | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sampleId: "",
    patientAge: "",
    patientGender: "",
    hospitalId: "",
    additionalNotes: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBloodCellImage(e.target.files[0]);
    }
  };

  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLabReport(e.target.files[0]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNewAnalysis = () => {
    setBloodCellImage(null);
    setPredictionResult(null);
    setSubmitError(null);
    setFormData({
      sampleId: "",
      patientAge: "",
      patientGender: "",
      hospitalId: "",
      additionalNotes: "",
    });
    setModelSelection("bccd");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bloodCellImage) {
      alert("Please upload a blood cell image");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setPredictionResult(null);

    try {
      const fd = new FormData();
      fd.append("bloodCellImage", bloodCellImage);
      fd.append("modelSelection", modelSelection);
      fd.append("reportId", formData.sampleId);
      fd.append("patientAge", formData.patientAge);
      fd.append("patientGender", formData.patientGender);
      fd.append("hospitalId", formData.hospitalId);
      if (formData.additionalNotes) {
        fd.append("additionalNotes", formData.additionalNotes);
      }

      const response = await fetch(`${APP_CONFIG.apiUrl}${API_ENDPOINTS.PREDICT}`, {
        method: "POST",
        body: fd,
      });

      const result = await response.json();

      if (!result.success) {
        setSubmitError(result.message || "Prediction failed");
      } else {
        setPredictionResult(result.data);
      }
    } catch {
      setSubmitError("Unable to connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-gray-900">Upload Blood Cell Image</h1>
        <p className="text-gray-500 mt-1">
          Submit a blood cell sample for cancer detection analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blood Cell Image Upload */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Blood Cell Image</h3>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
                onClick={() => document.getElementById("imageUpload")?.click()}
              >
                {bloodCellImage ? (
                  <div className="space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                    <p className="text-sm text-gray-700">{bloodCellImage.name}</p>
                    <p className="text-xs text-gray-500">
                      {(bloodCellImage.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                )}
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              {bloodCellImage && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBloodCellImage(null)}
                  className="w-full"
                >
                  Remove Image
                </Button>
              )}
            </div>
          </Card>

          {/* Lab Report Upload */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Lab Report (Optional)</h3>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
                onClick={() => document.getElementById("reportUpload")?.click()}
              >
                {labReport ? (
                  <div className="space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                    <p className="text-sm text-gray-700">{labReport.name}</p>
                    <p className="text-xs text-gray-500">
                      {(labReport.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF up to 10MB
                    </p>
                  </div>
                )}
                <input
                  id="reportUpload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleReportUpload}
                />
              </div>
              {labReport && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLabReport(null)}
                  className="w-full"
                >
                  Remove Report
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Patient Metadata Form */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Patient Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sampleId">Sample ID *</Label>
              <Input
                id="sampleId"
                name="sampleId"
                placeholder="e.g., BCS-2024-0452"
                value={formData.sampleId}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospitalId">Hospital ID *</Label>
              <Input
                id="hospitalId"
                name="hospitalId"
                placeholder="e.g., HSP-001"
                value={formData.hospitalId}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientAge">Patient Age *</Label>
              <Input
                id="patientAge"
                name="patientAge"
                type="number"
                placeholder="e.g., 45"
                value={formData.patientAge}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientGender">Gender *</Label>
              <select
                id="patientGender"
                name="patientGender"
                value={formData.patientGender}
                onChange={(e) =>
                  setFormData({ ...formData, patientGender: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                name="additionalNotes"
                placeholder="Enter any additional clinical observations or notes..."
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            {/* Model Selection */}
            <div className="space-y-2 md:col-span-2">
              <Label>Model Selection *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MODEL_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      modelSelection === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="modelSelection"
                      value={option.value}
                      checked={modelSelection === option.value}
                      onChange={(e) => setModelSelection(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/")}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={
              submitting ||
              !bloodCellImage ||
              !formData.sampleId ||
              !formData.hospitalId
            }
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Analyze Sample
              </>
            )}
          </Button>
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{submitError}</p>
          </div>
        )}
      </form>

      {/* Prediction Results */}
      {predictionResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Prediction Results</h2>
            <Button type="button" variant="outline" onClick={handleNewAnalysis}>
              New Analysis
            </Button>
          </div>

          {predictionResult.prediction && "comparison" in predictionResult.prediction && predictionResult.prediction.comparison ? (
            /* Comparison mode: two side-by-side cards */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-gray-900 mb-4">BCCD Model</h3>
                <SingleModelResult pred={(predictionResult.prediction as { comparison: true; results: { bccd: SinglePrediction; efficientnet: SinglePrediction } }).results.bccd} />
              </Card>
              <Card className="p-6">
                <h3 className="text-gray-900 mb-4">EfficientNet Model</h3>
                <SingleModelResult pred={(predictionResult.prediction as { comparison: true; results: { bccd: SinglePrediction; efficientnet: SinglePrediction } }).results.efficientnet} />
              </Card>
            </div>
          ) : (
            /* Single model result */
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Analysis Result</h3>
              <SingleModelResult pred={predictionResult.prediction as SinglePrediction} />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
