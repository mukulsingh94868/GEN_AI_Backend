# GEN AI Backend

A Node.js backend for generating AI-powered interview reports and tailored resumes using Google Gemini (GenAI). This repository includes user authentication, interview report creation from a resume and job description, and PDF resume generation.

## Features

- User registration and login with JWT cookies
- Protected routes for authenticated users
- Upload resume PDF and generate interview report based on resume, self description, and job description
- Retrieve saved interview reports and individual report details
- Generate a downloadable resume PDF tailored to the job description
- Uses Google GenAI Gemini for AI content generation

## Tech Stack

- Node.js
- Express
- MongoDB / Mongoose
- Google GenAI (`@google/genai`)
- Puppeteer for PDF generation
- Multer for file uploads
- JSON Web Tokens and cookie authentication
- Zod for schema validation

## Getting Started

### Prerequisites

- Node.js v18+ installed
- MongoDB connection URI
- Google GenAI API key

### Installation

1. Clone the repository

```bash
git clone <repo-url>
cd GEN_AI_Backend
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the project root

```env
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
NODE_ENV=development
```

4. Start the server

```bash
npm run dev
```

The app listens on port `5000` by default.

## API Endpoints

### Auth

- `POST /api/auth/register`
  - Body: `{ username, email, password }`
  - Registers a new user and sets an auth cookie

- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Logs in a user and sets an auth cookie

- `GET /api/auth/logout`
  - Clears auth cookie and blacklists the token

- `GET /api/auth/get-me`
  - Returns the current logged in user
  - Protected route

### Interview

- `POST /api/interview/`
  - Protected route
  - Upload one PDF resume as form-data field `resume`
  - Body fields: `selfDescription`, `jobDescription`
  - Generates and stores an interview report

- `GET /api/interview/`
  - Protected route
  - Returns all interview reports for the current user

- `GET /api/interview/report/:interviewId`
  - Protected route
  - Returns a single interview report by ID

- `POST /api/interview/resume/pdf/:interviewReportId`
  - Protected route
  - Generates a downloadable resume PDF from the saved report

## Notes

- The backend uses cookies for authentication, so client requests must support cookies.
- Uploaded resumes are stored in memory before AI processing, and file size is limited to 3MB.
- The AI service relies on Google GenAI Gemini, so valid API credentials are required.

## Folder Structure

- `server.js` - application entry point
- `src/app.js` - Express app and route registration
- `src/config/database.js` - MongoDB connection
- `src/controllers/` - route logic
- `src/middlewares/` - auth and file upload middleware
- `src/models/` - Mongoose models
- `src/routes/` - API route definitions
- `src/services/ai.service.js` - AI report and resume PDF generation

## License

This project is released under the ISC License.
