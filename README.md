# DOOH Campaign Analytics Platform

A full-stack Digital Out-Of-Home (DOOH) campaign tracking system with real-time analytics and asynchronous event processing.

**Live Demo:** [Frontend](https://blindspot-challenge.netlify.app) | [Backend API](https://blindspot-challenge.onrender.com)

## What It Does

Simulates a DOOH platform where digital screens play advertising campaigns. Events are queued, processed asynchronously in batches, and visualized in real-time on a dashboard.

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your MongoDB connection string to .env
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Tech Stack

**Backend:**
- Node.js + Express - Simple and fast for REST APIs
- MongoDB Atlas - Cloud database, easy to share
- In-memory queue - Events processed asynchronously every 3 seconds

**Frontend:**
- React + TypeScript - Type safety and component reusability
- Vite - Fast dev server and builds
- Recharts - Clean data visualization
- SCSS - Better styling organization

**Deployment:**
- Render (backend) - Free tier, easy setup
- Netlify (frontend) - Auto-deploy on push
- MongoDB Atlas - Free 512MB database

## Key Features

- Asynchronous event queue processing (batch of 10 every 3 seconds)
- Real-time campaign performance tracking
- Screen-level impression analytics
- Pause/resume queue processor
- Continuous event simulation for testing
- Auto-refresh dashboard (3-second intervals)
- Bar charts for visual analytics

## Time Spent

About **6-7 hours** total:
- Initial setup and backend queue system: ~2h
- Frontend dashboard with React: ~1.5h
- Styling and UI polish: ~1h
- MongoDB integration: ~1h
- Deployment and debugging: ~1.5h

## What I'd Improve

**If I had more time:**

1. **Redis for queue** - Replace in-memory queue with Redis for persistence and scalability
2. **WebSockets** - Real-time updates instead of polling every 3 seconds
3. **User authentication** - Secure campaign management
4. **Date range filters** - Filter analytics by time period
5. **Error handling** - Better retry logic for failed events
6. **Testing** - Unit tests for backend services, E2E tests for frontend
7. **Rate limiting** - Prevent API abuse
8. **Pagination** - For when campaigns list gets large
9. **Docker** - Containerize for easier local development
10. **Performance monitoring** - Track queue processing metrics

**Production considerations:**
- Move to a proper job queue (Bull, BullMQ)
- Add database indexes for faster queries
- Implement proper logging (Winston, Pino)
- Set up CI/CD pipelines
- Add environment-specific configs




