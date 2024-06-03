# Project - Job - Dekho - Server
Ongoing Project of MERN Stack based Online Job Portal - Server (API)

## Introduction

Welcome to **Project Job Dekho Server**, a comprehensive backend solution for a job-seeking portal. This project aims to provide a seamless and efficient platform for job seekers and employers to connect. Job seekers can find and apply for jobs, while employers can post job listings and search for potential employees. This repository contains the server-side code, including routing, controllers, middleware, and database configurations.

## Features

- **User Authentication and Authorization:** Separate login systems for job seekers and employers.
- **Job Management:** Employers can post jobs, and job seekers can search and apply for jobs.
- **Detailed Job Descriptions:** Each job posting contains comprehensive details to help job seekers make informed decisions.
- **Error Handling:** Robust middleware for handling errors and asynchronous operations.

## Technologies Used

- **Node.js:** JavaScript runtime environment.
- **Express.js:** Web application framework for Node.js.
- **MongoDB:** NoSQL database for storing user and job data.
- **Mongoose:** ODM for MongoDB and Node.js.
- **JWT:** For user authentication and authorization.

## Project Structure

```plaintext
PROJECT JOB DEKHO SERVER/
├── controllers/
│   ├── applicationController.js
│   ├── jobController.js
│   └── userController.js
├── middlewares/
│   ├── error.js
│   ├── catchAsyncError.js
│   └── authorization.js
├── routes/
│   ├── applicationRoutes.js
│   ├── jobRoutes.js
│   └── userRoutes.js
├── models/
│   ├── jobModel.js
│   ├── userModel.js
│   └── applicationModel.js
├── config/
│   └── db.js
├── utils/
│   ├── sendEmail.js
│   └── logger.js
├── app.js
├── server.js
└── README.md
```

## Controllers

- **Application Controller:** Manages the application process for job seekers.
- **Job Controller:** Handles job posting, updating, and retrieval operations.
- **User Controller:** Manages user registration, login, and profile operations.

## Middlewares

- **error.js:** Centralized error handling middleware.
- **catchAsyncError.js:** Middleware for catching asynchronous errors.
- **auth.js:** Middleware for checking user roles and permissions.

## Routes

- **Application Routes:** Routes related to job applications.
- **Job Routes:** Routes for job management (CRUD operations).
- **User Routes:** Routes for user management and authentication.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/(my_username)/PROJECT-JOB-DEKHO-SERVER.git
   ```
2. Navigate to the project directory:
   ```bash
   cd PROJECT-JOB-DEKHO-SERVER
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables by creating a `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### User Routes

- **POST /api/users/register**: Register a new user.
- **POST /api/users/login**: Login a user.
- **GET /api/users/profile**: Get user profile.

### Job Routes

- **POST /api/jobs**: Create a new job.
- **GET /api/jobs**: Get all jobs.
- **GET /api/jobs/:id**: Get a job by ID.
- **PUT /api/jobs/:id**: Update a job by ID.
- **DELETE /api/jobs/:id**: Delete a job by ID.

### Application Routes

- **POST /api/applications**: Apply for a job.
- **GET /api/applications**: Get all applications.
- **GET /api/applications/:id**: Get an application by ID.

---

Thank you for using Project-Job-Dekho-Server! If you have any questions or need further assistance, please feel free to open an issue on GitHub.
