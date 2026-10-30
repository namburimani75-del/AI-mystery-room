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

// Security middleware with cross-origin resource policy allowed for web clients
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Allowed frontend origins: explicit production URLs, development URLs, and dynamic env/Vercel domains
const staticAllowedOrigins = [
  'https://ai-mystery-room-6vfevgnss-ruthless9.vercel.app',
  'https://ai-mystery-room-rose.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
];

const configuredClientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  // Allow non-browser requests (e.g. curl, server-to-server, Render health check)
  if (!origin) return true;

  const cleanOrigin = origin.trim().replace(/\/+$/, '');

  // Exact static and environment matches
  if (staticAllowedOrigins.includes(cleanOrigin)) return true;
  if (configuredClientUrls.includes(cleanOrigin) || configuredClientUrls.includes('*')) return true;

  // Allow all Vercel domains (e.g. production domains and preview branches)
  try {
    const parsed = new URL(cleanOrigin);
    if (parsed.hostname.endsWith('.vercel.app')) {
      return true;
    }
  } catch {
    // Ignore invalid URL format
  }

  // Allow localhost origins during local testing
  if (cleanOrigin.startsWith('http://localhost:') || cleanOrigin.startsWith('http://127.0.0.1:')) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    // Return callback(null, false) to reject gracefully without throwing 500 error
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-player-id',
    'Accept',
    'Origin',
    'X-Requested-With',
  ],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
