import { PredictService } from './predict.service.js';
import prisma from '../../config/prisma.js';
import crypto from 'crypto';

const VALID_MODELS = ['bccd', 'efficientnet', 'both'];

export class PredictController {
  /**
   * POST /api/predict
   * Accepts a multipart upload with `bloodCellImage`, `reportId`, and optional `modelSelection`.
   * Forwards the image to the FastAPI ML service and persists the Diagnosis result.
   */
  static async predict(req, res) {
    try {
      // --- Input validation ---

      // Validate modelSelection
      const modelSelection = (req.body.modelSelection || 'bccd').trim();
      if (!VALID_MODELS.includes(modelSelection)) {
        return res.status(400).json({
          success: false,
          message: `Invalid modelSelection. Allowed values: ${VALID_MODELS.join(', ')}`,
        });
      }

      // Validate sampleId (used as reportId)
      const sampleId = (req.body.reportId || '').trim();
      if (!sampleId) {
        return res.status(400).json({
          success: false,
          message: 'reportId (sampleId) is required',
        });
      }

      // Validate image file
      const imageFile = req.files && req.files.bloodCellImage && req.files.bloodCellImage[0];
      if (!imageFile) {
        return res.status(400).json({
          success: false,
          message: 'No blood cell image uploaded (field: bloodCellImage)',
        });
      }

      // --- Call ML service ---
      let mlResult;
      try {
        mlResult = await PredictService.callMLService(
          imageFile.buffer,
          imageFile.originalname,
          modelSelection
        );
      } catch (mlErr) {
        return res.status(mlErr.status || 500).json({
          success: false,
          message: mlErr.message || 'ML service error',
        });
      }

      // --- Create Report if it doesn't exist ---
      let report = await prisma.report.findUnique({ where: { sampleId } });

      if (!report) {
        // Resolve hospital: look up by provided hospitalId or use/create a default
        const hospitalIdInput = (req.body.hospitalId || '').trim();
        let hospital = null;
        if (hospitalIdInput) {
          hospital = await prisma.hospital.findUnique({ where: { id: hospitalIdInput } });
        }
        if (!hospital) {
          hospital = await prisma.hospital.findFirst();
        }
        if (!hospital) {
          hospital = await prisma.hospital.create({
            data: {
              name: hospitalIdInput || 'Default Hospital',
              address: 'N/A',
            },
          });
        }

        const patient = await prisma.patient.create({
          data: {
            name: 'Anonymous Patient',
            age: parseInt(req.body.patientAge) || 0,
            gender: (req.body.patientGender || 'OTHER').toUpperCase(),
            hospitalId: hospital.id,
          },
        });

        report = await prisma.report.create({
          data: {
            sampleId,
            reportUrl: '',
            patientId: patient.id,
          },
        });
      }

      // --- Create Upload record ---
      const fileHash = crypto.createHash('sha256').update(imageFile.buffer).digest('hex');
      const secureFilename = imageFile.secureFilename || imageFile.originalname;

      // Find or create a system user for tracking uploads when no auth is present
      let uploadUserId = req.user?.id;
      if (!uploadUserId) {
        let systemUser = await prisma.user.findUnique({ where: { email: 'system@bloodcancer.local' } });
        if (!systemUser) {
          systemUser = await prisma.user.create({
            data: {
              name: 'System',
              email: 'system@bloodcancer.local',
              password: crypto.randomBytes(32).toString('hex'),
              role: 'ADMIN',
            },
          });
        }
        uploadUserId = systemUser.id;
      }

      await prisma.upload.create({
        data: {
          imageUrl: secureFilename,
          fileHash,
          userId: uploadUserId,
          reportId: report.id,
        },
      });

      // --- Persist and respond ---
      let savedRecord;
      const isComparison = mlResult.comparison === true;

      try {
        if (isComparison) {
          // Dual-model: persist bccd result as primary diagnosis
          savedRecord = await PredictService.persistDiagnosis(mlResult.results.bccd, report.id);
        } else {
          // Single-model: persist the direct result
          savedRecord = await PredictService.persistDiagnosis(mlResult, report.id);
        }
      } catch (dbErr) {
        // Prisma unique constraint violation — diagnosis already exists for this report
        if (
          dbErr.code === 'P2002' ||
          (dbErr.message && dbErr.message.includes('Unique constraint'))
        ) {
          return res.status(409).json({
            success: false,
            message: 'A diagnosis already exists for this report',
          });
        }
        throw dbErr; // re-throw unexpected DB errors to global handler
      }

      return res.status(200).json({
        success: true,
        data: {
          diagnosis: savedRecord,
          prediction: mlResult,
        },
      });
    } catch (err) {
      console.error('PredictController.predict error:', err);
      return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred while processing the prediction',
      });
    }
  }
}
