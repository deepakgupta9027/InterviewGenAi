# 🤖 GenAI Interview Prep

> An AI-powered full-stack web application that generates personalized interview reports by analyzing your resume and a job description using Google's Gemini AI.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#-environment-variables)
- [How It Works](#-how-it-works)
- [Data Models](#-data-models)

---

## 🌟 Overview

**GenAI Interview Prep** is a full-stack MERN-like application that uses **Google Gemini AI** to generate comprehensive, personalized interview preparation reports. Users upload a PDF resume (or write a self-description) along with a job description, and the AI produces:

- A **match score** (0–100) for the role
- **Technical interview questions** with expected answers
- **Behavioral interview questions** with expected answers
- **Skill gap analysis** with severity ratings
- A **day-by-day preparation plan**

All reports are persisted per user and accessible at any time from their dashboard.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register, login, and logout with HTTP-only cookie tokens
- 🚪 **Token Blacklisting** — Invalidated tokens are stored in MongoDB to prevent reuse after logout
- 📄 **PDF Resume Parsing** — Upload a PDF resume (up to 3 MB); text is extracted server-side via `pdf-parse`
- 🤖 **AI Report Generation** — Google Gemini (`gemini-3-flash-preview`) produces structured JSON interview reports with retry logic and bulletproof normalisation
- 📊 **Report Dashboard** — View all past interview reports in a clean, cyber-vibrant UI
- 🔒 **Protected Routes** — Frontend route guards ensure only authenticated users can access the dashboard and reports
- 📱 **Responsive UI** — Built with React + SCSS, featuring a dark "cyber-vibrant" theme

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **MongoDB + Mongoose** | Database & ODM |
| **Google GenAI SDK** | Gemini AI integration |
| **Multer** | PDF file upload (memory storage) |
| **pdf-parse** | Extract text from PDF resumes |
| **bcrypt** | Password hashing |
| **jsonwebtoken** | JWT authentication |
| **Zod + zod-to-json-schema** | AI response schema validation |
| **dotenv** | Environment variable management |
| **cors + cookie-parser** | CORS and cookie middleware |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite 8** | Build tool & dev server |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client |
| **SCSS (Sass)** | Styling with cyber-vibrant theme |

---

## 📁 Project Structure

```
GenAIFullSTack/
├── Backend/
│   ├── server.js                  # Entry point — starts Express & DB
│   ├── package.json
│   ├── .env                       # Environment variables (not committed)
│   └── src/
│       ├── app.js                 # Express app, middleware, route registration
│       ├── config/
│       │   └── database.js        # MongoDB connection
│       ├── controllers/
│       │   ├── auth.controller.js      # Register, login, logout, getMe
│       │   └── interview.controller.js # Generate report, get report, get all reports
│       ├── middlewares/
│       │   ├── auth.middleware.js      # JWT verification + blacklist check
│       │   └── file.middleware.js      # Multer memory storage (3 MB limit)
│       ├── models/
│       │   ├── user.model.js           # User schema
│       │   ├── blacklist.model.js      # Blacklisted JWT tokens
│       │   └── interviewReport.model.js # Full interview report schema
│       ├── routes/
│       │   ├── auth.routes.js          # /api/auth/*
│       │   └── interview.routes.js     # /api/interview/*
│       └── services/
│           └── ai.service.js           # Gemini AI call, schema, retry & normalisation
│
└── Frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx               # React entry point
        ├── App.jsx                # Root — wraps providers + router
        ├── app.routes.jsx         # Route definitions
        ├── style.scss             # Global design system (cyber-vibrant theme)
        └── features/
            ├── auth/
            │   ├── auth.context.jsx       # Auth context definition
            │   ├── auth.provider.jsx      # Auth state & user fetching
            │   ├── components/
            │   │   └── Protected.jsx      # Route guard component
            │   ├── hooks/                 # Custom auth hooks
            │   ├── pages/
            │   │   ├── Login.jsx
            │   │   └── Register.jsx
            │   └── services/             # Auth API calls (axios)
            └── interview/
                ├── interview.context.jsx        # Interview context definition
                ├── interviewProvide.jsx          # Interview state provider
                ├── hooks/                       # Custom interview hooks
                ├── pages/
                │   ├── Home.jsx                 # Dashboard — list all reports
                │   └── interview.jsx            # Single report view
                └── services/                   # Interview API calls (axios)
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vite + React)              │
│                                                             │
│  AuthProvider ──► InterviewProvider ──► RouterProvider      │
│       │                  │                                  │
│  Login / Register    Home (Dashboard)   Interview Report    │
│       │                  │                   │             │
│    axios                axios             axios            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP + cookies (JWT)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Express 5 on :3000)               │
│                                                             │
│  /api/auth/*   ──►  authController  ──►  userModel         │
│  /api/interview/*  ──► [authMiddleware] ──► [upload]        │
│                          │                                  │
│                   interviewController                       │
│                     ├── pdf-parse (PDF → text)             │
│                     ├── ai.service (Gemini AI)             │
│                     └── interviewReportModel (MongoDB)     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Google Gemini AI API  │
              │  (gemini-3-flash)      │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  MongoDB Atlas         │
              │  users, blacklist,     │
              │  interviewReports      │
              └────────────────────────┘
```

---

## 📡 API Reference

### Auth Endpoints — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Register a new user |
| `POST` | `/login` | ❌ | Login and receive JWT cookie |
| `GET` | `/logout` | ❌ | Logout and blacklist the token |
| `GET` | `/getMe` | ✅ | Fetch current authenticated user |

#### `POST /api/auth/register`
```json
// Request Body
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}

// Response 201
{
  "message": "user registered successfully",
  "user": { "id": "...", "username": "johndoe", "email": "john@example.com" }
}
```

#### `POST /api/auth/login`
```json
// Request Body
{
  "email": "john@example.com",
  "password": "securepassword"
}

// Response 200  (sets HttpOnly cookie: token)
{
  "message": "user logged in successfully",
  "user": { "id": "...", "username": "johndoe", "email": "john@example.com" }
}
```

---

### Interview Endpoints — `/api/interview`

> All routes require a valid JWT cookie (`authUser` middleware).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/` | Generate a new interview report |
| `GET` | `/` | Get all reports for the logged-in user (summary) |
| `GET` | `/report/:interviewId` | Get a specific report by ID (full detail) |

#### `POST /api/interview`
Accepts `multipart/form-data`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resume` | File (PDF, ≤ 3 MB) | No | Candidate's PDF resume |
| `selfDescription` | String | No | Text self-description (used if no PDF) |
| `jobDescription` | String | **Yes** | The target job description |

```json
// Response 201
{
  "success": true,
  "message": "Interview report generated successfully",
  "data": { /* full InterviewReport document */ }
}
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **MongoDB Atlas** cluster (or local MongoDB)
- A **Google AI Studio** API Key ([get one here](https://aistudio.google.com/))

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd Backend

# 2. Install dependencies
npm install

# 3. Create a .env file (see Environment Variables section below)
# 4. Start the development server
npm run dev
```

The server will start on **http://localhost:3000**.

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd Frontend

# 2. Install dependencies
npm install

# 3. Start the Vite dev server
npm run dev
```

The frontend will be available at **http://localhost:5173**.

> ⚠️ The backend CORS config is set to `http://localhost:5173`. Both servers must run concurrently during development.

---

## 🔑 Environment Variables

Create a `.env` file in the `Backend/` directory with the following keys:

```env
# MongoDB connection string
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0

# JWT signing secret (use a long random string)
JWT_SECRET=your_jwt_secret_here

# Google Gemini AI API Key
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
```

> ⚠️ Never commit your `.env` file. Make sure it is listed in `.gitignore`.

---

## ⚙️ How It Works

1. **User registers/logs in** → a JWT is issued and stored as an HTTP-only cookie.
2. **User submits** a job description + optional PDF resume or self-description on the Home page.
3. **Backend** receives the `multipart/form-data` request:
   - Multer stores the PDF in memory (no disk writes).
   - `pdf-parse` extracts plain text from the PDF buffer.
4. **`ai.service.js`** sends a structured prompt to **Google Gemini** requesting a strict JSON response conforming to the Zod schema.
   - If the response is malformed, normalizer functions fix or fill in defaults.
   - The service retries up to **2 times** on failure.
5. **The parsed report** is saved to MongoDB under the authenticated user and returned to the frontend.
6. The frontend redirects the user to the **Interview Report** page where they can review questions, skill gaps, match score, and their preparation plan.

---

## 🗃 Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| `username` | String | Unique |
| `email` | String | Unique |
| `password` | String | bcrypt hashed |

### Token Blacklist
| Field | Type | Notes |
|-------|------|-------|
| `token` | String | Invalidated JWT |

### Interview Report
| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId | Ref: `users` |
| `title` | String | AI-generated job title |
| `jobDescription` | String | Submitted by user |
| `resume` | String | Extracted PDF text |
| `selfDescription` | String | Optional user text |
| `matchScore` | Number | 0–100 |
| `technicalQuestions` | Array | `{ question, intention, answer }` |
| `behavioralQuestions` | Array | `{ question, intention, answer }` |
| `skillGaps` | Array | `{ skill, severity: low\|medium\|high }` |
| `preparationPlan` | Array | `{ day, focus, tasks[] }` |
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) |

---

## 📄 License

This project is for educational/personal use. No license has been specified.

---

<p align="center">Built with ❤️ using React, Express, MongoDB, and Google Gemini AI</p>
