Lexora: Guided by AI. Powered by You – An AI-Powered Learning Platform with Personalized Narrated Lessons

Build a full-stack AI education platform called Lexora — a personalized, avatar-narrated learning system that generates structured lessons from any topic using AI. Users can upload their own avatars, select a voice, and receive lifelike, narrated video lessons auto-generated using open-source tools. This MVP should be functional, scalable, and modern in UI/UX, built entirely with free or open-source technologies.

🔥 Core Features:
User Login & Profile – Email/password auth, avatar and voice preference storage

Topic-Based AI Learning Path – User enters a topic (e.g., “Python Basics”) → platform creates a 6-week structured plan with lessons

Lesson Narration & Video Generation –

Each lesson gets a narration script from LLaMA 3

Convert to audio using gTTS

Sync audio with user-uploaded avatar using Wav2Lip

Asset Storage – Avatars, audio, and videos are uploaded to S3

Lesson Playback & Progress Tracking – Clean viewer interface with transcript, video, and user notes


🎨 UI/UX Requirements
Use Tailwind CSS with full dark theme styling

Dashboard with cards for topics, progress meters, and lesson thumbnails

Lesson viewer: includes video player, transcript pane, and user notes

Smooth transitions using Framer Motion or similar

Avatar upload modal and voice preference selector

🔧 Tech Stack (Free/Open Tools Only)
Frontend: React/Next.js + Tailwind CSS

Backend: Node.js, Express.js

Database: MongoDB Atlas

AI Services: LLaMA 3 via Groq/OpenRouter

Narration: gTTS (Google Text-to-Speech)

Video Generation: Wav2Lip (open-source avatar syncing)

Storage: AWS S3 

✅ MVP Goals
Full user auth with avatar & voice selection

Topic input → generates learning path & lessons

Script → gTTS → Wav2Lip → video asset

User can play lesson video, view transcript, and track progress

Build the platform using modular flows and visual builders. All media should be managed via asset references and upload workflows. Ensure a developer-friendly structure for future integrations like analytics or payment systems.


Database Schema, Application Flow & API Design

📦 Collections Overview

Collection : Purpose

users : User authentication, preferences, avatar info

topics : High-level subject or domain

learning_paths : Structured plan under each topic

lessons : Daily/weekly learning content

videos : AI-generated avatar-narrated videos

progress : User progress tracking

assets : Avatar, audio, video, script files

🧑‍💻 USERS

{
  "_id": "ObjectId",
  "email": "user@example.com",
  "password_hash": "<hashed>",
  "display_name": "John Doe",
  "avatar_id": "ObjectId",     // asset
  "voice_id": "ObjectId",      // asset
  "preferences": {
    "gender_voice": "neutral",
    "learning_style": "visual"
  },
  "created_at": "ISODate",
  "last_login": "ISODate"
}

📚 TOPICS

{
  "_id": "ObjectId",
  "title": "Python Programming",
  "description": "Learn Python from scratch...",
  "tags": ["python", "programming", "backend"],
  "created_by": "ObjectId",
  "created_at": "ISODate"
}

🧭 LEARNING_PATHS

{
  "_id": "ObjectId",
  "topic_id": "ObjectId",
  "user_id": "ObjectId",
  "title": "6-Week Python Programming Masterclass",
  "description": "From beginner to advanced topics.",
  "weeks": 6,
  "estimated_total_hours": 40,
  "difficulty": "Beginner",
  "goal": "Become job-ready in Python",
  "created_at": "ISODate"
}

📘 LESSONS

{
  "_id": "ObjectId",
  "learning_path_id": "ObjectId",
  "topic_id": "ObjectId",
  "user_id": "ObjectId",
  "title": "Week 1 - Introduction to Python",
  "week": 1,
  "day": 1,
  "content": "Overview of Python syntax and print().",
  "script": "Welcome to Day 1...",
  "objectives": ["Learn variables", "Understand print function"],
  "status": "finalized",
  "created_at": "ISODate"
}

🎬 VIDEOS

{
  "_id": "ObjectId",
  "lesson_id": "ObjectId",
  "user_id": "ObjectId",
  "video_url": "https://cdn/videos/lesson1.mp4",
  "audio_url": "https://cdn/audio/lesson1.mp3",
  "avatar_id": "ObjectId",
  "voice_id": "ObjectId",
  "duration_sec": 95,
  "generated_at": "ISODate"
}

📈 PROGRESS

{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "lesson_id": "ObjectId",
  "learning_path_id": "ObjectId",
  "topic_id": "ObjectId",
  "video_id": "ObjectId",
  "watched_percentage": 85,
  "completed": true,
  "completed_at": "ISODate",
  "notes": ["Revisit OOP"],
  "revisits": [
    { "timestamp": "ISODate", "watched_percent": 45 }
  ]
}

🖼️ ASSETS

{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "type": "avatar",
  "file_url": "https://cdn/assets/avatar123.png",
  "file_name": "avatar123.png",
  "used_in": ["ObjectId"],
  "created_at": "ISODate"
}

🔁 Flow Summary

User signs up → uploads avatar and chooses voice.

User inputs a topic → platform generates a Topic + Learning Path.

Each Learning Path has structured Lessons (week/day-wise).

Each Lesson gets:

Narration script from LLM

Audio via gTTS

Avatar + audio merged via Wav2Lip → creates video.

User views video, marks complete → Progress saved.

Assets (audio, avatar, video) stored in S3/R2, tracked in assets.

🌐 REST API Endpoint Design (Scalable)

🧑‍💻 Users

POST /api/auth/register

POST /api/auth/login

GET /api/users/me

PUT /api/users/me/preferences

📚 Topics

POST /api/topics

GET /api/topics

GET /api/topics/:id

🧭 Learning Paths

POST /api/learning-paths

GET /api/topics/:topicId/learning-paths

GET /api/learning-paths/:id

PUT /api/learning-paths/:id

📘 Lessons

POST /api/lessons

GET /api/learning-paths/:pathId/lessons

GET /api/lessons/:id

PUT /api/lessons/:id

🎬 Videos

POST /api/videos → triggers Wav2Lip + gTTS job

GET /api/lessons/:lessonId/videos

GET /api/videos/:id

📈 Progress

POST /api/progress

GET /api/users/me/progress

GET /api/lessons/:lessonId/progress

🖼️ Assets (Uploads)

POST /api/assets/upload (signed URL or direct)

GET /api/assets/:id

DELETE /api/assets/:id
