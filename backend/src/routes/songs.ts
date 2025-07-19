import { Elysia, t } from 'elysia';
import { Song } from '../models/Song';

export const songsRoutes = new Elysia({ prefix: '/api/songs' })
  // Get all songs
  .get('/', async () => {
    try {
      console.log('📋 Fetching all songs...');
      const songs = await Song.find().sort({ createdAt: -1 });
      console.log(`✅ Found ${songs.length} songs`);
      console.log('📄 Sample song:', songs[0] ? { title: songs[0].title, artist: songs[0].artist } : 'No songs found');
      return { success: true, data: songs };
    } catch (error) {
      console.error('❌ Error fetching songs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error details:', errorMessage);
      return { success: false, error: `Failed to fetch songs: ${errorMessage}` };
    }
  })

  // Get song by ID
  .get('/:id', async ({ params: { id } }) => {
    try {
      const song = await Song.findById(id).populate('uploadedBy', 'username');
      if (!song) {
        return { success: false, error: 'Song not found' };
      }
      return { success: true, data: song };
    } catch (error) {
      return { success: false, error: 'Failed to fetch song' };
    }
  })

  // Search songs
  .get('/search/:query', async ({ params: { query } }) => {
    try {
      const songs = await Song.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { artist: { $regex: query, $options: 'i' } },
          { album: { $regex: query, $options: 'i' } },
          { genre: { $regex: query, $options: 'i' } }
        ]
      }).populate('uploadedBy', 'username');
      return { success: true, data: songs };
    } catch (error) {
      return { success: false, error: 'Search failed' };
    }
  })

  // Increment play count
  .patch('/:id/play', async ({ params: { id } }) => {
    try {
      const song = await Song.findByIdAndUpdate(
        id,
        { $inc: { playCount: 1 } },
        { new: true }
      );
      if (!song) {
        return { success: false, error: 'Song not found' };
      }
      return { success: true, data: song };
    } catch (error) {
      return { success: false, error: 'Failed to update play count' };
    }
  })

  // Get popular songs
  .get('/popular/top', async () => {
    try {
      const songs = await Song.find()
        .populate('uploadedBy', 'username')
        .sort({ playCount: -1 })
        .limit(20);
      return { success: true, data: songs };
    } catch (error) {
      return { success: false, error: 'Failed to fetch popular songs' };
    }
  });
