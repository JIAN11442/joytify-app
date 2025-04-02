# Joytify

A Spotify Clone - A music sharing platform under development. Inspired by Spotify's core features and user experience.

## Current Status

🚧 **Under Development**

### Implemented Features

- Basic project structure
- Authentication system (Firebase)
- Basic API endpoints
- Frontend routing and layout

### In Progress

- Music upload functionality
- User profile management
- Music player implementation

## Tech Stack

### Frontend

- React 18 + TypeScript
- Vite
- TailwindCSS
- React Query
- Zustand
- Firebase Auth

### Backend

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- AWS S3
- JWT
- Firebase Admin
- Resend

## Development Setup

### Prerequisites

- Node.js >= 18
- MongoDB
- AWS Account
- Firebase Project
- Resend Account

### Environment Variables

#### Backend (.env)

```env
# Server Configuration
NODE_ENV=development
USE_NGINX_PROXY=false
BACKEND_PORT=4004
ORIGIN_APP=http://localhost:5173

# Database
MONGODB_CONNECTION_STRING=

# Email Service
RESEND_API_KEY=
TEST_EMAIL=onboarding@resend.dev
SENDER_EMAIL=joytify35@gmail.com
SEND_LIMIT_PER_PERIOD=3
PROFILE_FETCH_LIMIT=2
FETCH_LIMIT_PER_PAGE=2

# JWT Secrets
ACCESS_SECRET_KEY=
REFRESH_SECRET_KEY=
VERIFICATION_SECRET_KEY=

# AWS Configuration
AWS_REGION=ap-northeast-1
AWS_BUCKET_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE=

# Firebase Configuration
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
```

#### Frontend (.env)

```env
VITE_SERVER_URL=http://localhost:4004
```

### Local Development

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Run development servers
# Terminal 1
cd backend && npm run node # or npm run dev

# Terminal 2
cd frontend && npm run dev
```

## Project Structure

```
joytify/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── states/       # State management
│   │   └── utils/        # Utility functions
├── backend/           # Express backend
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── services/     # Business logic
├── share/            # Shared types (local development only)
└── terraform/        # Infrastructure
```

### Shared Types Development

The `share` directory is a separate npm package that contains shared TypeScript types and constants used by both frontend and backend. During development:

1. The `share` directory is a local copy of the shared types package
2. Use `npm link` to link the local share package for development
3. In production, the package is installed via npm as `@joytify/shared-types`

## Development Guidelines

### Code Style

- ESLint + Prettier
- TypeScript strict mode
- Conventional commits

### Git Workflow

- Feature branches
- Pull request reviews
- Conventional commits

## License

MIT
