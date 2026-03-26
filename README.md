# 🖥️ Job Dekho — Backend (Node.js / Express)

> Part of the **Job Dekho** full-stack job portal project.

---

## 🔗 Project Repositories

| Repo | Description |
|------|-------------|
| **[📦 Backend (this repo)](https://github.com/aayRJ23/Project-Job-Dekho-Server)** | Express + MongoDB REST API + Socket.IO |
| **[🌐 Frontend (Client)](https://github.com/aayRJ23/Project-Job-Dekho-Client)** | React + Vite SPA |
| **[🤖 ChatBot](https://github.com/aayRJ23/ChatBot-JobDekho)** | Flask ML chatbot microservice |

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Reference](#api-reference)
- [Environment Variables (.env Setup)](#environment-variables-env-setup)
- [Installation & Running](#installation--running)
- [Sample Data](#sample-data)
- [Socket.IO Events](#socketio-events)

---

## Overview

The backend is a RESTful API server built with **Node.js + Express**, connected to **MongoDB Atlas** via Mongoose. It handles:

- User authentication (JWT, cookie-based)
- Job postings by employers
- Job applications by seekers (with Cloudinary resume uploads)
- Real-time notifications via **Socket.IO**
- Application status management (accept / reject / schedule interview / final verdict)

---

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** JWT + bcrypt + cookie-parser
- **File Uploads:** express-fileupload + Cloudinary
- **Real-time:** Socket.IO
- **Env Config:** dotenv

---

## Project Structure

```
Project-Job-Dekho-Server/
├── config/
│   └── .env                  # Environment variables (do NOT commit)
├── controllers/
│   ├── userController.js     # Register, Login, Logout, GetUser
│   ├── jobController.js      # Post, Get, Update, Delete jobs
│   ├── applicationController.js  # Apply, Status, Verdict
│   └── notificationController.js # Fetch & mark-read notifications
├── database/
│   └── dbConnection.js       # Mongoose connection
├── middlewares/
│   ├── auth.js               # isAuthenticated middleware
│   ├── catchAsyncError.js    # Async error wrapper
│   └── error.js              # Global error handler
├── models/
│   ├── userSchema.js         # User model (Job Seeker / Employer)
│   ├── jobSchema.js          # Job model
│   ├── applicationSchema.js  # Application model (with interview + verdict)
│   └── notificationSchema.js # Notification model
├── routes/
│   ├── userRoutes.js
│   ├── jobRoutes.js
│   ├── applicationRoutes.js
│   └── notificationRoutes.js
├── utils/
│   └── jwtToken.js           # JWT cookie generator
├── app.js                    # Express app setup
└── server.js                 # HTTP server + Socket.IO setup
```

---

## Features

- 🔐 **JWT Authentication** — Token stored in HTTP-only cookie; validated on every protected route
- 👤 **Two Roles** — `Employer` and `Job Seeker` with role-based access control
- 📝 **Job Management** — Employers post, update, delete, and expire jobs
- 📨 **Applications** — Seekers apply with resume (PNG/JPG/WEBP → Cloudinary), cover letter, contact info
- ✅ **Application Lifecycle** — `Pending → Accepted (interview scheduled) → Final Verdict`
- 🔔 **Real-time Notifications** — Socket.IO emits live events when:
  - A new job is posted (all seekers notified)
  - An application is submitted (employer + seeker notified)
  - Application is accepted/rejected
  - Final verdict (selected / not selected) is set
- 🗄️ **Notification Store** — Notifications persisted in DB; unread count tracked

---

## API Reference

### Auth — `/api/v1/user`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register a new user |
| POST | `/login` | ❌ | Login and receive JWT cookie |
| GET | `/logout` | ✅ | Logout (clears cookie) |
| GET | `/getuser` | ✅ | Get current logged-in user |

### Jobs — `/api/v1/job`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/getall` | ❌ | Any | Get all active (non-expired) jobs |
| POST | `/post` | ✅ | Employer | Post a new job |
| GET | `/getmyjobs` | ✅ | Employer | Get jobs posted by this employer |
| PUT | `/update/:id` | ✅ | Employer | Update a job |
| DELETE | `/delete/:id` | ✅ | Employer | Delete a job |
| GET | `/:id` | ✅ | Any | Get a single job by ID |

### Applications — `/api/v1/application`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/post` | ✅ | Job Seeker | Submit application (multipart with resume file) |
| GET | `/employer/getall` | ✅ | Employer | Get all applications for employer's jobs |
| GET | `/jobseeker/getall` | ✅ | Job Seeker | Get all applications submitted by seeker |
| DELETE | `/delete/:id` | ✅ | Job Seeker | Delete own application |
| PATCH | `/status/:id` | ✅ | Employer | Accept (1) or Reject (0) application |
| PATCH | `/verdict/:id` | ✅ | Employer | Set final verdict: `selected` or `not_selected` |

### Notifications — `/api/v1/notification`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/getall` | ✅ | Get all notifications for current user |
| PATCH | `/markread` | ✅ | Mark all notifications as read |

---

## Environment Variables (.env Setup)

Create the file at `config/.env` (this path is already configured in `app.js`).

```env
# ─── Server ───────────────────────────────────────────────
PORT=4000

# ─── Frontend URL (used for CORS & Socket.IO) ─────────────
FRONTEND_URL=http://localhost:5173

# ─── MongoDB ──────────────────────────────────────────────
# Get this from MongoDB Atlas → Connect → Drivers
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0

# ─── JWT ──────────────────────────────────────────────────
JWT_SECRET_KEY=your_super_secret_key_here
JWT_EXPIRES=7d
COOKIE_EXPIRE=7

# ─── Cloudinary (for resume uploads) ──────────────────────
# Get these from cloudinary.com → Dashboard
CLOUDINARY_CLIENT_NAME=your_cloud_name
CLOUDINARY_CLIENT_API=your_api_key
CLOUDINARY_CLIENT_SECRET=your_api_secret
```

> ⚠️ **Never commit `.env` to Git.** It is already listed in `.gitignore`.

### Where to get Cloudinary credentials

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to **Dashboard → API Keys**
3. Copy Cloud Name, API Key, and API Secret

### Where to get MongoDB URI

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster → **Connect → Drivers → Node.js**
3. Copy the connection string and replace `<password>`

---

## Installation & Running

### Prerequisites

- Node.js v18+
- npm
- MongoDB Atlas account
- Cloudinary account

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/aayRJ23/Project-Job-Dekho-Server.git
cd Project-Job-Dekho-Server

# 2. Install dependencies
npm install

# 3. Create environment file
mkdir -p config
cp config/.env.example config/.env   # then fill in your values

# 4. Start development server (with auto-reload)
npm run dev

# 5. Or start production server
npm start
```

The server will run on **http://localhost:4000**

---

## Sample Data

Use these ready-made payloads to populate the database for testing. The scenario:

- **Employer 1 — TechNova Solutions** posts 3 jobs
- **Employer 2 — GreenBridge Consulting** posts 2 jobs
- **Job Seeker — Arjun Sharma** applies to all 5 jobs

---

### Step 1 — Register Users

**Employer 1**
```json
POST /api/v1/user/register
{
  "name": "TechNova HR",
  "email": "hr@technovasolutions.in",
  "phone": 9876543210,
  "password": "TechNova@123",
  "role": "Employer"
}
```

**Employer 2**
```json
POST /api/v1/user/register
{
  "name": "GreenBridge HR",
  "email": "recruit@greenbridgeconsulting.in",
  "phone": 9812345678,
  "password": "GreenBridge@123",
  "role": "Employer"
}
```

**Job Seeker**
```json
POST /api/v1/user/register
{
  "name": "Arjun Sharma",
  "email": "arjun.sharma@gmail.com",
  "phone": 9988776655,
  "password": "Arjun@Sharma123",
  "role": "Job Seeker"
}
```

---

### Step 2 — Post Jobs (login as each employer first)

**Login as Employer 1** → `POST /api/v1/user/login`

```json
{ "email": "hr@technovasolutions.in", "password": "TechNova@123", "role": "Employer" }
```

**Job 1 — Full Stack Developer**
```json
POST /api/v1/job/post
{
  "title": "Full Stack Developer",
  "description": "We are looking for a skilled Full Stack Developer to join our product team at TechNova Solutions. You will be responsible for developing and maintaining web applications using React and Node.js. Candidates must have strong knowledge of REST APIs, MongoDB, and modern JavaScript practices.",
  "category": "Information Technology",
  "country": "India",
  "city": "Bengaluru",
  "location": "TechNova Solutions, 4th Floor, Prestige Tech Park, Outer Ring Road, Bengaluru, Karnataka 560103",
  "salaryFrom": 800000,
  "salaryTo": 1400000
}
```

**Job 2 — React Native Developer**
```json
POST /api/v1/job/post
{
  "title": "React Native Developer",
  "description": "TechNova Solutions is hiring a React Native Developer to build and ship cross-platform mobile applications for our enterprise clients. You should have 1–3 years of experience with React Native, Redux, and REST API integrations. Good debugging skills and attention to UI/UX are a must.",
  "category": "Mobile Development",
  "country": "India",
  "city": "Bengaluru",
  "location": "TechNova Solutions, 4th Floor, Prestige Tech Park, Outer Ring Road, Bengaluru, Karnataka 560103",
  "salaryFrom": 700000,
  "salaryTo": 1200000
}
```

**Job 3 — DevOps Engineer**
```json
POST /api/v1/job/post
{
  "title": "DevOps Engineer",
  "description": "Join TechNova Solutions as a DevOps Engineer and take ownership of our CI/CD pipelines and cloud infrastructure on AWS. You will work with Docker, Kubernetes, Terraform, and GitHub Actions. The ideal candidate has experience in automating deployments and monitoring production environments.",
  "category": "Cloud & Infrastructure",
  "country": "India",
  "city": "Hyderabad",
  "location": "TechNova Solutions, 2nd Floor, Cyber Pearl Building, HITEC City, Hyderabad, Telangana 500081",
  "fixedSalary": 1600000
}
```

---

**Login as Employer 2** → `POST /api/v1/user/login`

```json
{ "email": "recruit@greenbridgeconsulting.in", "password": "GreenBridge@123", "role": "Employer" }
```

**Job 4 — Business Analyst**
```json
POST /api/v1/job/post
{
  "title": "Business Analyst",
  "description": "GreenBridge Consulting is seeking an experienced Business Analyst to bridge the gap between business goals and technical solutions. You will gather requirements, create detailed BRDs and user stories, and work closely with development teams. Prior experience in BFSI or consulting domain is preferred.",
  "category": "Consulting & Strategy",
  "country": "India",
  "city": "Mumbai",
  "location": "GreenBridge Consulting, 9th Floor, One BKC Tower, Bandra Kurla Complex, Mumbai, Maharashtra 400051",
  "salaryFrom": 900000,
  "salaryTo": 1500000
}
```

**Job 5 — Data Analyst**
```json
POST /api/v1/job/post
{
  "title": "Data Analyst",
  "description": "We at GreenBridge Consulting are hiring a Data Analyst to help our clients make sense of their data. You will work with large datasets using Python, SQL, and Tableau to extract actionable insights. Strong communication skills are essential to present findings to non-technical stakeholders.",
  "category": "Data & Analytics",
  "country": "India",
  "city": "Pune",
  "location": "GreenBridge Consulting, 3rd Floor, Cybercity Tower, Magarpatta City, Pune, Maharashtra 411013",
  "salaryFrom": 600000,
  "salaryTo": 1000000
}
```

---

### Step 3 — Submit Applications (login as Job Seeker)

**Login as Job Seeker** → `POST /api/v1/user/login`

```json
{ "email": "arjun.sharma@gmail.com", "password": "Arjun@Sharma123", "role": "Job Seeker" }
```

Each application requires a **multipart/form-data** request with a resume image file. Example body fields (repeat for all 5 jobs, change `jobId` each time):

```
POST /api/v1/application/post
Content-Type: multipart/form-data

name          = Arjun Sharma
email         = arjun.sharma@gmail.com
phone         = 9988776655
address       = 12, Rajpur Road, Dehradun, Uttarakhand 248001
coverLetter   = I am a passionate software engineer with 2 years of experience in full-stack development. I have worked with React, Node.js, and MongoDB. I believe my skills align perfectly with this role and I am eager to contribute to your team's success.
jobId         = <paste the _id returned from the job post response>
resume        = <attach a PNG/JPG image file>
```

---

## Socket.IO Events

| Event (emit) | Direction | Payload | Description |
|---|---|---|---|
| `register` | Client → Server | `userId` | Register socket session for a user |
| `new_notification` | Server → Client | Notification object | Real-time push for any notification |
| `disconnect` | Client → Server | — | Auto-cleanup of online user map |

---

## Notes

- Resumes are uploaded as **image files** (PNG / JPG / WEBP) to Cloudinary. PDF support can be added by extending `allowedFormats` in `applicationController.js`.
- The `accepted` field on an application uses numeric values: `-1` = pending, `0` = rejected, `1` = accepted + interview scheduled.
- Notifications are both **persisted in MongoDB** and **emitted in real-time** via Socket.IO for online users.