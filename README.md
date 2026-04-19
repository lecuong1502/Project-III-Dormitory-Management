# 🏠 Dormitory Student Management System

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [User Roles](#user-roles)
- [Deployment](#deployment)
- [Contributors](#contributors)

---

## Overview

Managing dormitory operations at large universities involves enormous administrative overhead — manual room assignments, paper-based billing, and fragmented support request handling. This system digitizes and automates the entire student residency lifecycle:

- **Registration** → **Room Assignment** → **Monthly Billing** → **Support Requests** → **Check-out**

The platform provides two separate interfaces: a **Student Portal** (simple, mobile-friendly) and an **Admin Dashboard** (data-rich, action-oriented).

---

## Features

### 👨‍🎓 Student Features
| Feature | Description |
|---|---|
| Account Registration & Login | Create an account using student ID and email |
| Dormitory Registration | Submit a room preference application |
| View Residency Info | See current room, bed, roommates, and regulations |
| Payment Management | View monthly invoices and upload payment proof |
| Support Requests | Report maintenance issues, request room transfer or check-out |
| Notifications | Receive real-time notifications from management |

### 🛠️ Admin Features
| Feature | Description |
|---|---|
| Dashboard | Real-time stats: empty beds, pending invoices, new requests |
| Room Map Management | Visual grid of buildings, rooms, and bed availability |
| Application Management | Review, approve or reject student registrations; assign rooms |
| Financial Management | Generate monthly invoices, track debts, confirm payments |
| Request Management | Process student support requests through status workflow |
| Notification Management | Send announcements to all students or specific individuals |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js (SPA), JSX, CSS Modules |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (NoSQL), Mongoose ODM |
| **Authentication** | JWT (JSON Web Token) |
| **API Style** | RESTful API |
| **Deployment (optional)** | Vercel (frontend), Render (backend), MongoDB Atlas (DB), Docker |

---

## System Architecture

This project follows the **MVC (Model-View-Controller)** architectural pattern:

```
┌─────────────────────────────────────────────────┐
│                    CLIENT                        │
│          React.js SPA (View Layer)               │
└──────────────────────┬──────────────────────────┘
                       │ HTTP / REST API
┌──────────────────────▼──────────────────────────┐
│                  EXPRESS SERVER                  │
│           Controllers (Route Handlers)           │
│           Services (Business Logic)              │
└──────────────────────┬──────────────────────────┘
                       │ Mongoose
┌──────────────────────▼──────────────────────────┐
│                   MONGODB                        │
│              Collections (Models)                │
└─────────────────────────────────────────────────┘
```

### Application Packages

```
Dashboard Package
       │
       ├── Registration Package ◄──── Billing Package ──── Request Package
       │
       ├── User Package
       └── Room Package
                              └── Notification Package
```

---

## Database Schema

| # | Entity | Primary Key | Foreign Keys | Key Fields |
|---|---|---|---|---|
| 1 | Account | id | student_id | username, password (hashed), role |
| 2 | Student | id | — | student_code, fullname, dob, gender, phone |
| 3 | Building | id | — | name, address |
| 4 | Room | id | building_id | room_number, room_type, status |
| 5 | Bed | id | room_id | bed_number, status |
| 6 | Contract | id | student_id, bed_id | start_date, end_date, status |
| 7 | Registration | id | student_id | content, status, created_at |
| 8 | Bill | id | student_id | month, total_amount, status |
| 9 | Service | id | student_id | service_name, unit_price, total |
| 10 | Electricity_Water | id | room_id | month, electricity_index, water_index |
| 11 | Request | id | student_id | category, content, status, created_at, resolved_at |
| 12 | Notification | id | user_id | title, content, created_at, is_read |


---

## Project Structure

```
dormitory-management/
├── client/                          # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/                  # Images, icons, fonts
│   │   ├── components/              # Reusable UI components
│   │   │   ├── common/              # Button, Modal, Table, Badge...
│   │   │   ├── layout/              # Sidebar, Navbar, Footer
│   │   │   └── charts/              # Dashboard chart components
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── student/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── RoomInfo.jsx
│   │   │   │   ├── Payment.jsx
│   │   │   │   ├── Requests.jsx
│   │   │   │   └── Notifications.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── RoomMap.jsx
│   │   │       ├── Applications.jsx
│   │   │       ├── Finance.jsx
│   │   │       ├── Requests.jsx
│   │   │       └── Notifications.jsx
│   │   ├── services/                # Axios API call functions
│   │   │   ├── authService.js
│   │   │   ├── roomService.js
│   │   │   ├── billingService.js
│   │   │   ├── requestService.js
│   │   │   └── notificationService.js
│   │   ├── context/                 # React Context (Auth, etc.)
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── utils/                   # Helper functions, constants
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
│
├── server/                          # Node.js / Express backend
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── models/                      # Mongoose schemas
│   │   ├── Account.js
│   │   ├── Student.js
│   │   ├── Building.js
│   │   ├── Room.js
│   │   ├── Bed.js
│   │   ├── Contract.js
│   │   ├── Registration.js
│   │   ├── Bill.js
│   │   ├── Service.js
│   │   ├── ElectricityWater.js
│   │   ├── Request.js
│   │   └── Notification.js
│   ├── controllers/                 # Route handler logic
│   │   ├── authController.js
│   │   ├── roomController.js
│   │   ├── registrationController.js
│   │   ├── billingController.js
│   │   ├── requestController.js
│   │   └── notificationController.js
│   ├── routes/                      # Express routers
│   │   ├── auth.js
│   │   ├── rooms.js
│   │   ├── registrations.js
│   │   ├── billing.js
│   │   ├── requests.js
│   │   └── notifications.js
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification
│   │   └── roleMiddleware.js        # Role-based access control
│   ├── utils/
│   │   └── generateInvoices.js      # Batch invoice generation logic
│   ├── .env
│   ├── server.js                    # Entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Prerequisites

Make sure you have the following installed before proceeding:

- **Node.js** v18 or later — [Download](https://nodejs.org/)
- **npm** v9 or later (comes with Node.js)
- **MongoDB** v6 or later (local) — [Download](https://www.mongodb.com/try/download/community), or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud, free tier available)
- **Git** — [Download](https://git-scm.com/)

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/lecuong1502/Project-III-Dormitory-Management.git
cd dormitory-management
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

### 4. Configure environment variables

**Backend** — create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dormitory_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Frontend** — create a `.env` file inside the `client/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> **Note:** If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string:
> ```
> MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/dormitory_db
> ```

---

## Running the Application

### Run backend server

```bash
cd server
npm run dev
```

The server will start at `http://localhost:5000`.

### Run frontend (in a separate terminal)

```bash
cd client
npm run dev
```

The React app will start at `http://localhost:5173`.

### Run both concurrently (optional)

From the project root, if you have a `package.json` with `concurrently` set up:

```bash
npm run dev
```

---

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `PORT` | server/.env | Port for the Express server (default: 5000) |
| `MONGO_URI` | server/.env | MongoDB connection string |
| `JWT_SECRET` | server/.env | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | server/.env | JWT expiration duration (e.g., `7d`) |
| `NODE_ENV` | server/.env | `development` or `production` |
| `VITE_API_BASE_URL` | client/.env | Base URL of the backend API |

---

## API Overview

All API endpoints are prefixed with `/api`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new student account |
| POST | `/api/auth/login` | Public | Login and receive JWT token |
| GET | `/api/rooms` | Admin | Get all rooms and availability |
| POST | `/api/rooms` | Admin | Add a new room |
| PATCH | `/api/rooms/:id/beds/:bedId` | Admin | Update bed status |
| GET | `/api/registrations` | Admin | Get all pending registrations |
| POST | `/api/registrations` | Student | Submit a dormitory application |
| PATCH | `/api/registrations/:id/approve` | Admin | Approve registration and assign room |
| PATCH | `/api/registrations/:id/reject` | Admin | Reject registration with reason |
| GET | `/api/billing/invoices` | Student/Admin | Get invoices |
| POST | `/api/billing/generate` | Admin | Generate monthly invoices for all residents |
| PATCH | `/api/billing/:id/confirm` | Admin | Confirm payment |
| GET | `/api/requests` | Admin | Get all support requests |
| POST | `/api/requests` | Student | Submit a support request |
| PATCH | `/api/requests/:id/status` | Admin | Update request status |
| GET | `/api/notifications` | Student | Get notifications for current user |
| POST | `/api/notifications` | Admin | Send a notification |
| GET | `/api/dashboard/stats` | Admin | Get dashboard statistics |

---

## User Roles

| Role | Access |
|---|---|
| **student** | Personal profile, own room info, own invoices, own requests, own notifications |
| **admin** | Full system access — all rooms, all students, all invoices, all requests, global notifications |

Role is stored in the `Account` collection as a `role` field (`"student"` or `"admin"`). JWT middleware enforces role-based access on all protected routes.

---

## Deployment

### Frontend → Vercel

```bash
cd client
npm run build
# Deploy the dist/ folder to Vercel
```

Or connect your GitHub repo to [Vercel](https://vercel.com) for automatic deployments.

### Backend → Render

1. Push your `server/` code to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Set the build command: `npm install`
4. Set the start command: `node server.js`
5. Add all environment variables from `server/.env` in the Render dashboard.

### Database → MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Whitelist your server's IP address.
3. Copy the connection string and set it as `MONGO_URI` in your production environment.

### Docker (optional)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

> A `docker-compose.yml` should define services for `client`, `server`, and `mongo`.

---

## Non-Functional Requirements

| Requirement | Target |
|---|---|
| Response time (normal queries) | < 2 seconds |
| Concurrent users supported | ≥ 500 |
| Batch invoice generation (all students) | < 5 minutes |
| System uptime | ≥ 99% (24/7) |
| Password storage | Bcrypt hashed — plaintext never stored |
| Security | JWT auth, XSS prevention, input validation |
| Backup | Daily automated database backup |
| Recovery time (on crash) | ≤ 30 minutes |
| UI language | Vietnamese |
| Responsive design | Desktop and Mobile |

---

## Contributors

| Name | Student ID | Class | Email |
|---|---|---|---|
| Lê Kiên Cường | 20235025 | IT1-04 K68 | cuong.lk235025@sis.hust.edu.vn |
| Phạm Tiến Đạt | 20224950 | IT1-07 K67 | dat.pt224950@sis.hust.edu.vn |

**Supervisor:** Assoc. Prof. Dr. Trần Đình Khang
**Department:** Computer Science
**School:** School of Information and Communication Technology (SOICT)
**University:** Hanoi University of Science and Technology (HUST)

---

*Project III Report — March 2026*