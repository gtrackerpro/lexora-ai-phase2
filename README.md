# Lexora - AI-Powered Learning Platform

<div align="center">
  <img src="client/public/lexora-logo.png" alt="Lexora Logo" width="120" height="120">
  
  **Guided by AI. Powered by You.**
  
  An AI-Powered Learning Platform with Personalized Narrated Lessons
</div>

## 🚀 Overview

Lexora is a full-stack AI education platform that generates structured lessons from any topic using AI. Users can upload their own avatars, select a voice, and receive lifelike, narrated video lessons auto-generated using open-source tools. This MVP is functional, scalable, and modern in UI/UX, built entirely with free or open-source technologies.

## ✨ Core Features

- **User Authentication** - Email/password auth with avatar and voice preference storage
- **AI Learning Path Generation** - Enter any topic and get a structured 6-week learning plan
- **Lesson Narration & Video Generation** - AI-generated scripts with avatar-synced videos
- **Progress Tracking** - Clean viewer interface with transcripts and user notes
- **Asset Management** - Upload and manage avatars, audio, and video files
- **Dark Theme UI** - Modern, responsive design with smooth animations

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** with Zod validation
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing

### AI & Media Processing
- **LLaMA 3** via Groq for content generation
- **gTTS** (Google Text-to-Speech) for narration
- **Wav2Lip** for avatar video syncing
- **AWS S3** for asset storage

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - [Install locally](https://docs.mongodb.com/manual/installation/) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download here](https://git-scm.com/)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd lexora-mern-platform
```

### 2. Install Dependencies

Install dependencies for both client and server:

```bash
# Install root dependencies
npm install

# Install all dependencies (client + server)
npm run install:all
```

### 3. Environment Configuration

#### Server Environment Setup

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/lexora
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lexora

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=7d

# AWS S3 Configuration (Optional for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET_NAME=lexora-assets
AWS_REGION=us-east-1

# AI Service (Optional for AI features)
GROQ_API_KEY=your-groq-api-key

# Frontend URL
CLIENT_URL=http://localhost:5173
```

#### Client Environment Setup

The client uses Vite's proxy configuration, so no additional environment setup is needed for development.

### 4. Database Setup

#### Option A: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```

#### Option B: MongoDB Atlas (Recommended)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

## 🚀 Running the Application

### Development Mode

Start both client and server in development mode:

```bash
# From the root directory
npm run dev
```

This will start:
- **Backend server** on `http://localhost:5000`
- **Frontend client** on `http://localhost:5173`

### Individual Services

You can also run services individually:

```bash
# Start only the backend server
npm run server:dev

# Start only the frontend client
npm run client:dev
```

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
lexora-mern-platform/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── index.css      # Global styles
│   ├── package.json
│   └── vite.config.ts
├── server/                # Node.js backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── package.json
│   └── server.ts
├── package.json         # Root package.json
└── README.md
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/me` - Get current user
- `PUT /api/users/me/preferences` - Update user preferences

### Topics
- `POST /api/topics` - Create new topic
- `GET /api/topics` - Get user's topics
- `GET /api/topics/:id` - Get specific topic

### Learning Paths
- `POST /api/learning-paths` - Create learning path
- `GET /api/topics/:topicId/learning-paths` - Get paths for topic
- `GET /api/learning-paths/:id` - Get specific learning path

## 🎨 UI/UX Features

- **Full Dark Theme** - Modern dark interface with Tailwind CSS
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Framer Motion for enhanced user experience
- **Form Validation** - Real-time validation with helpful error messages
- **Loading States** - Proper loading indicators and skeleton screens
- **Toast Notifications** - User feedback for actions

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## 🔧 Development Tools

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting

### Database Tools
- **MongoDB Compass** - GUI for MongoDB
- **Mongoose** - ODM for MongoDB

## 📦 Database Schema

### Collections Overview

| Collection | Purpose |
|------------|---------|
| `users` | User authentication, preferences, avatar info |
| `topics` | High-level subject or domain |
| `learning_paths` | Structured plan under each topic |
| `lessons` | Daily/weekly learning content |
| `videos` | AI-generated avatar-narrated videos |
| `progress` | User progress tracking |
| `assets` | Avatar, audio, video, script files |

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:27017
   ```
   - Ensure MongoDB is running locally or check your Atlas connection string

2. **Port Already in Use**
   ```
   Error: listen EADDRINUSE: address already in use :::5000
   ```
   - Kill the process using the port or change the PORT in `.env`

3. **Module Not Found Errors**
   ```
   Cannot find module 'xyz'
   ```
   - Run `npm install` in the appropriate directory (client/server)

4. **TypeScript Compilation Errors**
   - Ensure all dependencies are installed
   - Check for missing type definitions

### Getting Help

1. Check the console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check that all dependencies are installed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **MongoDB** for the flexible database solution
- **OpenAI/Groq** for AI capabilities
- **Framer Motion** for smooth animations

---

<div align="center">
  <p>Built with ❤️ by the Lexora Team</p>
  <p>
    <a href="#-overview">Overview</a> •
    <a href="#-installation--setup">Installation</a> •
    <a href="#-running-the-application">Usage</a> •
    <a href="#-api-endpoints">API</a>
  </p>
</div>