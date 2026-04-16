import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './modules/auth/auth.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import diagnosesRoutes from './modules/diagnoses/diagnoses.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import metricsRoutes from './modules/metrics/metrics.routes.js';
import auditLogsRoutes from './modules/audit-logs/auditLogs.routes.js';
import predictRoutes from './modules/predict/predict.routes.js';
const app = express();

// Trust proxy - needed for rate limiting behind nginx
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/diagnoses', diagnosesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/predict', predictRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

export default app;