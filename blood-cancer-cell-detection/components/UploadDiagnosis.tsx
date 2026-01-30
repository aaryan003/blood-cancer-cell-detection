import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Upload, FileText, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";

export function UploadDiagnosis() {
  const navigate = useNavigate();
  const [bloodCellImage, setBloodCellImage] = useState<File | null>(null);
  const [labReport, setLabReport] = useState<File | null>(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission
    alert("Sample submitted for analysis!");
    navigate("/results");
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
            disabled={!bloodCellImage || !formData.sampleId || !formData.hospitalId}
          >
            <Upload className="w-4 h-4 mr-2" />
            Analyze Sample
          </Button>
        </div>
      </form>
    </div>
  );
}
