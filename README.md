# Music Player Web Application

A modern music player web application built with Next.js, TypeScript, Elysia.js, Tailwind CSS, and MongoDB.

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Elysia.js with TypeScript
- **Database**: MongoDB with Mongoose
- **UI Components**: Custom components with Lucide React icons
- **Styling**: Tailwind CSS with custom slider styles

## Features

- 🎵 Modern music player interface
- 🔍 Search functionality for songs, artists, and albums
- 📚 Library management
- ⏯️ Play/pause, next/previous controls
- 🔊 Volume control
- 📊 Play count tracking
- 🎨 Beautiful gradient UI design
- 📱 Responsive design

## Project Structure

```
music-player/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   └── components/      # React components
│   │       ├── MusicPlayer.tsx
│   │       ├── SongList.tsx
│   │       └── Sidebar.tsx
├── backend/                 # Elysia.js backend API
│   ├── src/
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── index.ts         # Main server file
│   │   └── seed.ts          # Sample data seeder
│   └── uploads/             # Music file storage
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Bun (for backend development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd music-player
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the connection string in `backend/src/index.ts` if needed

### Running the Application

1. **Start the backend server**

   ```bash
   cd backend
   npm run dev
   ```

   The API will be available at `http://localhost:8000`

2. **Start the frontend development server**

   ```bash
   cd frontend
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

3. **Seed sample data (optional)**
   ```bash
   cd backend
   npx tsx src/seed.ts
   ```

## API Endpoints

- `GET /api/songs` - Get all songs
- `GET /api/songs/:id` - Get song by ID
- `GET /api/songs/search/:query` - Search songs
- `PATCH /api/songs/:id/play` - Increment play count
- `GET /api/songs/popular/top` - Get popular songs

## Database Models

### Song

- title, artist, album, genre
- duration, filePath, coverImage
- uploadedBy (User reference)
- playCount, timestamps

### User

- username, email, password
- avatar, playlists, favoritesSongs
- timestamps

### Playlist

- name, description, coverImage
- songs (Song references)
- owner (User reference)
- isPublic, timestamps

## Development

### Backend Development

- Built with Elysia.js for high performance
- TypeScript for type safety
- Mongoose for MongoDB integration
- CORS enabled for frontend integration

### Frontend Development

- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Custom components for music player functionality
- Axios for API communication

## Future Enhancements

- [ ] User authentication and registration
- [ ] Music file upload functionality
- [ ] Playlist creation and management
- [ ] Social features (sharing, following)
- [ ] Audio visualization
- [ ] Offline playback support
- [ ] Mobile app version

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
