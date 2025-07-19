import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import mongoose from 'mongoose';
import { songsRoutes } from './routes/songs';
import { likesRoutes } from './routes/likes';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Atlas connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize database connection
connectDB();

const app = new Elysia()
  .use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003'], // Frontend URLs
    credentials: true
  }))
  .use(staticPlugin({
    assets: './uploads',
    prefix: '/uploads',
    staticLimit: 86400
  }))
  .use(songsRoutes)
  .use(likesRoutes)
  .get('/', () => ({ message: 'Music Player API Server' }))
  .get('/health', () => ({ status: 'OK', timestamp: new Date().toISOString() }))
  .listen(8000);

console.log(`🎵 Music Player API is running at http://localhost:${app.server?.port}`);
