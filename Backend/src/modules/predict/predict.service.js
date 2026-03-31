import prisma from '../../config/prisma.js';

export class PredictService {
  /**
   * Calls the FastAPI ML microservice with the provided image buffer.
   * Builds a multipart FormData request and enforces a 15-second timeout.
   *
   * @param {Buffer} imageBuffer - Raw image bytes from multer memory storage
   * @param {string} originalFilename - Original filename for content-type inference
   * @param {string} modelSelection - "bccd" | "efficientnet" | "both"
   * @returns {Promise<object>} Parsed JSON response from ML service
   */
  static async callMLService(imageBuffer, originalFilename, modelSelection) {
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

    // Determine content type from filename extension
    const ext = originalFilename.split('.').pop().toLowerCase();
    const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', tiff: 'image/tiff', tif: 'image/tiff' };
    const contentType = mimeMap[ext] || 'image/jpeg';

    // Build multipart FormData using Node.js built-ins (Node 18+)
    const blob = new Blob([imageBuffer], { type: contentType });
    const formData = new FormData();
    formData.append('file', blob, originalFilename);

    // Set up 15-second abort timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let response;
    try {
      response = await fetch(
        `${ML_SERVICE_URL}/predict?model=${encodeURIComponent(modelSelection)}`,
        {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        }
      );
    } catch (err) {
      clearTimeout(timeoutId);
      // AbortError means timeout fired
      if (err.name === 'AbortError' || err.name === 'TimeoutError') {
        const timeoutErr = new Error('ML service timed out');
        timeoutErr.status = 504;
        throw timeoutErr;
      }
      // Network-level failure (ECONNREFUSED, etc.) — ML service unreachable
      const networkErr = new Error(`ML service unreachable: ${err.message}`);
      networkErr.status = 502;
      throw networkErr;
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `ML service error (${response.status})`;
      try {
        const errorBody = await response.json();
        if (errorBody.detail) {
          errorMessage = typeof errorBody.detail === 'string'
            ? errorBody.detail
            : JSON.stringify(errorBody.detail);
        } else if (errorBody.message) {
          errorMessage = errorBody.message;
        }
      } catch {
        // Body not JSON — keep default message
      }

      // Map upstream status codes
      const mappedStatus = response.status === 503 ? 502 : response.status;
      const upstreamErr = new Error(errorMessage);
      upstreamErr.status = mappedStatus;
      throw upstreamErr;
    }

    return response.json();
  }

  /**
   * Persists an ML single-model prediction result as a Diagnosis record.
   *
   * @param {object} mlResult - Single-model ML response object
   * @param {string} reportId - The Report ID to link this diagnosis to
   * @returns {Promise<object>} Created Diagnosis record
   */
  static async persistDiagnosis(mlResult, reportId) {
    const diagnosis = await prisma.diagnosis.create({
      data: {
        result: mlResult.prediction,
        confidence: mlResult.confidence,
        metadata: mlResult,
        modelName: mlResult.model ?? null,
        cellBreakdown: mlResult.cell_type_summary ?? null,
        heatmapUrl: mlResult.gradcam_heatmap ?? null,
        reportId,
      },
    });
    return diagnosis;
  }
}
