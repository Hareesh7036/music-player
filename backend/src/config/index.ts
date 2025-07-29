// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'] as const;
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Configuration object
export const config = {
  // Server configuration
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d', // Token expiration time
  
  // Database configuration
  mongoUri: process.env.MONGODB_URI,
  
  // API configuration
  api: {
    prefix: '/api',
    version: 'v1',
  },
  
  // CORS configuration
  cors: {
    origin: [
      'http://localhost:3000', // Frontend URL
      'http://localhost:3001',
      'http://localhost:3003',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  
  // Upload configuration
  uploads: {
    directory: 'uploads',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
    ],
  },
} as const;

// Export type for the config object
export type Config = typeof config;
