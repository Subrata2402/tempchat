/**
 * Express and Socket.IO Server
 * Main entry point for the backend
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSocketHandlers } from './controllers/socketController.js';
import { logInfo, logSuccess, logError } from './utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.IO setup
const io = new Server(httpServer, {
  cors: corsOptions,
  maxHttpBufferSize: 1e7 // 10MB for file uploads
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'TempChat Server',
    version: '1.0.0',
    description: 'Real-time temporary chat application server'
  });
});

// Setup Socket.IO event handlers
setupSocketHandlers(io);

// Error handling middleware
app.use((err, req, res, next) => {
  logError('Express error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  logSuccess(`Server is running on port ${PORT}`);
  logInfo(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logInfo(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  logInfo(`Socket.IO ready for connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logInfo('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logInfo('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  logInfo('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    logInfo('HTTP server closed');
    process.exit(0);
  });
});
