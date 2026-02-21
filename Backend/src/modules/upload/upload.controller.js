import { uploadFiles, validateFileContent, uploadRateLimit, handleUploadError } from '../../uploadSecurity.js';

export class UploadController {
  static async uploadSample(req, res) {
    try {
      const { sampleId, patientAge, patientGender, hospitalId, additionalNotes } = req.body;

      // Validate required fields
      if (!sampleId || !patientAge || !patientGender || !hospitalId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: sampleId, patientAge, patientGender, hospitalId'
        });
      }

      // Validate files
      if (!req.files || !req.files.bloodCellImage) {
        return res.status(400).json({
          success: false,
          message: 'Blood cell image is required'
        });
      }

      const bloodCellImage = req.files.bloodCellImage[0];
      const labReport = req.files.labReport ? req.files.labReport[0] : null;

      // Simulate processing
      const analysisResult = {
        sampleId,
        uploadId: `upload_${Date.now()}`,
        files: {
          bloodCellImage: {
            originalName: bloodCellImage.originalname,
            secureFilename: bloodCellImage.secureFilename,
            size: bloodCellImage.size,
            type: bloodCellImage.mimetype
          },
          labReport: labReport ? {
            originalName: labReport.originalname,
            secureFilename: labReport.secureFilename,
            size: labReport.size,
            type: labReport.mimetype
          } : null
        },
        patientInfo: {
          age: parseInt(patientAge),
          gender: patientGender,
          hospitalId,
          additionalNotes
        },
        status: 'uploaded',
        uploadedAt: new Date().toISOString()
      };

      res.status(201).json({
        success: true,
        message: 'Files uploaded successfully and queued for analysis',
        data: analysisResult
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during file upload'
      });
    }
  }
}