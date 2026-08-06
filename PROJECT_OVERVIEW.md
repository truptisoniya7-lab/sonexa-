# Sonexa Project Overview

Sonexa is a full-stack web application organized as a monorepo, featuring a modern web frontend and a robust API backend. The project focuses on a multimedia/music experience (potentially with live rooms, listening history, and audio playback features).

## Repository Structure

The project is structured into two main directories within a monorepo setup:

- **`/frontend`**: A Next.js based web application.
- **`/backend`**: A Node.js/Express.js backend server.

There are also shared configurations at the root level (`package.json`, `vercel.json`) to manage building and installing dependencies across both parts.

---

## Tech Stack & Dependencies

### Frontend
The frontend is a highly interactive, modern React application built with Next.js.
- **Framework**: [Next.js](https://nextjs.org/) (v16) with React 19.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) combined with [Radix UI](https://www.radix-ui.com/) primitives (often used via Shadcn UI components).
- **Animations & 3D**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/), and [Three.js](https://threejs.org/) (via `@react-three/fiber` and `@react-three/drei`) for rich, 3D interactive graphics.
- **Data Fetching**: [React Query](https://tanstack.com/query/latest) (`@tanstack/react-query`).
- **Authentication & Backend Client**: Supabase Client (`@supabase/supabase-js`) and Google OAuth (`@react-oauth/google`).
- **Media**: `react-youtube` and Spotify Web Playback SDK for audio/video playback integration.

### Backend
The backend provides RESTful APIs to serve the frontend and handle database operations.
- **Framework**: Node.js with [Express.js](https://expressjs.com/).
- **Database**: PostgreSQL (connected via the `pg` library), managed with Supabase. The database structure includes tables for users, live rooms, listening history, and fallback data.
- **Authentication**: JWT (`jsonwebtoken`) and Google Auth Library (`google-auth-library`).
- **External APIs**: Uses `yt-search` to search YouTube for media.
- **Scripts**: Contains various `.sql` schema files and `.js` utility scripts (`setup_db.js`, `fetch_top_charts.js`, `update_fallback.js`) for managing database schema updates, fallback data generation, and mock data insertion.

---

## Key Features (Inferred from Codebase)
1. **Authentication**: Supports Google OAuth and potentially standard email/password authentication using bcrypt.
2. **Music / Media Playback**: Integration with YouTube and Spotify APIs to search and play music.
3. **Live Rooms**: Database schemas and backend scripts suggest a feature for users to join "live rooms" to listen to music together.
4. **Listening History**: Tracks user listening history (schema scripts like `listening_history.sql`).
5. **Interactive UI**: Uses Three.js and advanced animation libraries for a dynamic and engaging user interface.
6. **Fallback Mechanism**: Features robust fallback data handling (`fallback_data.json`, `generate_all_fallbacks.js`) to ensure media availability.

## Getting Started

To get started with development, you can use the root-level scripts:

1. **Install dependencies**:
   ```bash
   npm run install
   ```
   *(This will install dependencies for both the frontend and backend).*

2. **Run Backend**:
   Navigate to `/backend` and start the Express server (typically `npm run dev`). Make sure your `.env` is configured with PostgreSQL/Supabase credentials.

3. **Run Frontend**:
   Navigate to `/frontend` and start the Next.js development server (`npm run dev`).

4. **Build**:
   To build the frontend for production, run `npm run build` from the root directory.
