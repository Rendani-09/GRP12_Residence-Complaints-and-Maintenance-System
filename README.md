# Student Residence Complaints & Maintenance System

A centralized system designed to streamline the reporting and management of maintenance issues within a student residence. The system replaces the traditional communication chain with a structured, trackable, and efficient database-driven solution.

---

## Overview
Students can report maintenance issues directly through the system, while the residence warden manages and assigns contractors. Each complaint is tracked from submission to completion, ensuring transparency and accountability.

---

## Key Features
- Student registration and login  
- Submit complaints (room or facility-based)  
- Complaint categorization:
  - Structural
  - Electrical
  - Plumbing
  - Hygiene  
- Complaint status tracking:
  - Pending → Assigned → Completed  
- Contractor assignment by admin/warden  
- Centralized database for tracking and reporting  

---

## System Roles
- **Student:** Submits and tracks complaints  
- **Admin/Warden:** Manages complaints and assigns contractors  
- **Contractor:** Stored in the database (no system login access)  

---

## Backend Environment Variables
The backend validates required variables at startup.

Required:
- `DATABASE_URL`
- `JWT_SECRET`

Optional:
- `PORT` (default: `4000`)
- `NODE_ENV` (default: `development`)
- `JWT_EXPIRES_IN` (default: `12h`)
- `CORS_ORIGIN` (default: `http://localhost:8080`)

Use `backend/.env.example` as a template for local development.

---

## Render Deployment Notes
If Render fails with `Missing required environment variable: JWT_SECRET`, add the following in your Render service settings under Environment:

- `DATABASE_URL` = your Postgres connection string
- `JWT_SECRET` = a long random secret value

Then redeploy the latest commit.

If your service start command is still set manually, make sure it is:

- `npm start`

The backend should not be started with `node src/server.js` unless using the compatibility file included in this repository.

---
