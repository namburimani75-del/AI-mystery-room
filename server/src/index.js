import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import { connectDB } from './config/database.js';
import caseRoutes from './routes/cases.js';
import healthRoutes from './routes/health.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Validate critical environment variables
const checkRequiredEnv = () => {
  const missing = [];
  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
  if (!process.env.GEMINI_API_KEY) missing.push('GEMINI_API_KEY');
  if (missing.length > 0) {
    console.error(`❌ Critical environment variables missing: ${missing.join(', ')}`);
    console.error(`   Please configure them in your environment or hosting dashboard.`);
  }
};
checkRequiredEnv();

// Security middleware
app.use(helmet());

// CORS configuration supporting single origin, comma-separated origins, and Vercel preview domains
const configuredClientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. curl, server-to-server, Render health check)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');
    const isAllowed = configuredClientUrls.some(allowed => {
      if (allowed === '*') return true;
      if (allowed === cleanOrigin) return true;
      // Allow Vercel preview URLs if base vercel domain is configured
      if (allowed.includes('.vercel.app') && cleanOrigin.endsWith('.vercel.app')) return true;
      return false;
    });

    if (isAllowed || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-player-id'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter limit for AI generation
const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { error: 'Mystery generation limit reached. Please try again later.' },
});
app.use('/api/cases', generateLimiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));

// Root informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'AI Mystery Room API',
    message: 'Backend server is running',
    health: '/api/health',
  });
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/cases', caseRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🔍 AI Mystery Room server running on port ${PORT} (0.0.0.0)`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
