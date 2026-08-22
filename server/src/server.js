import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import attendanceRoutes from './routes/attendance.js';
import usersRoutes from './routes/users.js';
import leavesRoutes from './routes/leaves.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline styles/scripts in development
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Strict CORS setup supporting httpOnly cookies and authorization headers
const allowedOrigins = [
  'http://localhost:3000', 'http://127.0.0.1:3000',
  'http://localhost:3001', 'http://127.0.0.1:3001',
  'http://localhost:3002', 'http://127.0.0.1:3002',
  'http://localhost:5173', 'http://127.0.0.1:5173'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Error: Origin not permitted'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); // Limit JSON payload size to 10kb to prevent payload inflation attacks

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Dayflow HRMS Attendance Service', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/leaves', leavesRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS Error')) {
    return res.status(403).json({ error: err.message });
  }
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Dayflow HRMS Backend running on http://localhost:${PORT}`);
  });
}

export default app;
