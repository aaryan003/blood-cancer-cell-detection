import { PredictService } from './predict.service.js';

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

      // Validate reportId
      const reportId = (req.body.reportId || '').trim();
      if (!reportId) {
        return res.status(400).json({
          success: false,
          message: 'reportId is required',
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

      // --- Persist and respond ---
      let savedRecord;
      const isComparison = mlResult.comparison === true;

      try {
        if (isComparison) {
          // Dual-model: persist bccd result as primary diagnosis
          savedRecord = await PredictService.persistDiagnosis(mlResult.results.bccd, reportId);
        } else {
          // Single-model: persist the direct result
          savedRecord = await PredictService.persistDiagnosis(mlResult, reportId);
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
