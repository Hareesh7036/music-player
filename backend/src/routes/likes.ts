import { Elysia, t } from 'elysia';
import { User } from '../models/User';
import { Song } from '../models/Song';

export const likesRoutes = new Elysia({ prefix: '/api/likes' })
  // Toggle like/unlike a song
  .post('/toggle', async ({ body }) => {
    try {
      const { userId, songId } = body as { userId: string; songId: string };
      
      if (!userId || !songId) {
        return { success: false, error: 'User ID and Song ID are required' };
      }

      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Check if song exists
      const song = await Song.findById(songId);
      if (!song) {
        return { success: false, error: 'Song not found' };
      }

      // Check if song is already liked
      const isLiked = user.favoritesSongs.includes(songId as any);
      
      if (isLiked) {
        // Unlike the song
        user.favoritesSongs = user.favoritesSongs.filter(
          id => id.toString() !== songId
        );
        await user.save();
        console.log(`❤️ User ${userId} unliked song: ${song.title}`);
        return { 
          success: true, 
          data: { isLiked: false, message: 'Song removed from favorites' }
        };
      } else {
        // Like the song
        user.favoritesSongs.push(songId as any);
        await user.save();
        console.log(`💖 User ${userId} liked song: ${song.title}`);
        return { 
          success: true, 
          data: { isLiked: true, message: 'Song added to favorites' }
        };
      }
    } catch (error) {
      console.error('❌ Error toggling like:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to toggle like: ${errorMessage}` };
    }
  })

  // Get liked songs for a user
  .get('/user/:userId', async ({ params: { userId } }) => {
    try {
      if (!userId) {
        return { success: false, error: 'User ID is required' };
      }

      const user = await User.findById(userId).populate('favoritesSongs');
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      console.log(`📋 Fetching ${user.favoritesSongs.length} liked songs for user ${userId}`);
      return { 
        success: true, 
        data: user.favoritesSongs 
      };
    } catch (error) {
      console.error('❌ Error fetching liked songs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to fetch liked songs: ${errorMessage}` };
    }
  })

  // Check if a song is liked by a user
  .get('/check/:userId/:songId', async ({ params: { userId, songId } }) => {
    try {
      if (!userId || !songId) {
        return { success: false, error: 'User ID and Song ID are required' };
      }

      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const isLiked = user.favoritesSongs.includes(songId as any);
      return { 
        success: true, 
        data: { isLiked }
      };
    } catch (error) {
      console.error('❌ Error checking like status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to check like status: ${errorMessage}` };
    }
  })

  // Get all liked song IDs for a user (lightweight)
  .get('/ids/:userId', async ({ params: { userId } }) => {
    try {
      if (!userId) {
        return { success: false, error: 'User ID is required' };
      }

      const user = await User.findById(userId).select('favoritesSongs');
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return { 
        success: true, 
        data: user.favoritesSongs 
      };
    } catch (error) {
      console.error('❌ Error fetching liked song IDs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to fetch liked song IDs: ${errorMessage}` };
    }
  });
