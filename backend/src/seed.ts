import mongoose from 'mongoose';
import { Song } from './models/Song';
import { User } from './models/User';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Atlas connected successfully for seeding');
    console.log('📊 Database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Create a sample user
    const sampleUser = new User({
      username: 'demo_user',
      email: 'demo@example.com',
      password: 'password123'
    });
    
    const savedUser = await sampleUser.save();
    console.log('Sample user created:', savedUser.username);

    // Create sample songs
    const sampleSongs = [
      {
        title: 'Sample Song 1',
        artist: 'Demo Artist',
        album: 'Demo Album',
        genre: 'Electronic',
        duration: 180, // 3 minutes
        filePath: '/uploads/sample1.mp3',
        uploadedBy: savedUser._id,
        playCount: 0
      },
      {
        title: 'Chill Vibes',
        artist: 'Relaxing Sounds',
        album: 'Ambient Collection',
        genre: 'Ambient',
        duration: 240, // 4 minutes
        filePath: '/uploads/sample2.mp3',
        uploadedBy: savedUser._id,
        playCount: 5
      },
      {
        title: 'Upbeat Track',
        artist: 'Energy Music',
        album: 'High Energy',
        genre: 'Pop',
        duration: 210, // 3.5 minutes
        filePath: '/uploads/sample3.mp3',
        uploadedBy: savedUser._id,
        playCount: 12
      }
    ];

    for (const songData of sampleSongs) {
      const song = new Song(songData);
      await song.save();
      console.log('Sample song created:', song.title);
    }

    console.log('Sample data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

const main = async () => {
  await connectDB();
  await seedData();
};

main();
