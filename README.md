# Login/Registration Backend (Internship Task)

Backend-first Node.js + Express + MongoDB project with minimal frontend and role-based access for:
- `employee`
- `manager`
- `admin`

## Features
- Registration with required fields: `name`, `email`, `password`
- Optional profile fields: `profilePic`, `dob`, `salary`
- Cookie-session based authentication
- Role-protected APIs
- Admin APIs for user management (search, promote, edit, delete)
- Minimal frontend at `/ui` to test all APIs

## Setup
1. Copy `.env.example` to `.env`
2. Fill MongoDB connection string with DB name in URI path (example: `loginreg_db`)
3. Install and run:
   - `npm install`
   - `npm start`

Server default: `http://localhost:3000`  
UI for testing: `http://localhost:3000/ui`

## Core APIs

### Auth
- `POST /api/auth/signup` (multipart/form-data)
  - Required: `name`, `email`, `password`
  - Optional: `role`, `dob`, `salary`, `profilePic`
  - Public signup roles allowed: `employee`, `manager`
- `POST /api/auth/signin` (JSON): `{ "email": "...", "password": "..." }`
- `GET /api/auth/me` (requires login)
- `POST /api/auth/signout`

### Role test
- `GET /api/test/all`
- `GET /api/test/user` (logged-in user)
- `GET /api/test/manager` (manager role)
- `GET /api/test/admin` (admin role)

### Admin management
- `GET /api/admin/users?search=&page=1&limit=10`
- `PATCH /api/admin/users/:id/promote-manager`
- `PATCH /api/admin/users/:id` (can update `name`, `dob`, `salary`, `profilePic`)
  - Email/password updates are blocked by design
- `DELETE /api/admin/users/:id`
  - Admin cannot delete own account
  - Admin accounts cannot be deleted from this endpoint

## How to access `/admin`
There is no default admin user seeded automatically.  
1. Register/login from `/ui` first.
2. Promote/create admin (one-time) using:
   - `npm run make-admin -- your-email@example.com yourPassword "Your Name"`
3. Login again from `/ui` with that account.
4. Open `/admin` to access the admin panel.
