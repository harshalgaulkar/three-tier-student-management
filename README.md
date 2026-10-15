# Design and Deployment of a Three-Tier Web Application Using Netlify, Render, and MongoDB Atlas

A cloud-based **Student Information Management System (SIMS)** built using a **Three-Tier Architecture**, in which the presentation layer, application layer, and database layer are hosted independently across different cloud platforms.

---

## 🏛️ Architecture Overview

The system strictly decouples the client interface, business logic, and cloud database:

```
                      INTERNET
                         │
                         ▼
                  ┌─────────────┐
                  │    USER     │
                  │ Web Browser │
                  └──────┬──────┘
                         │ HTTPS
                         ▼
        ┌──────────────────────────────────┐
        │        NETLIFY (TIER 1)          │
        │       Presentation Layer         │
        │  Modern Responsive Web Client    │
        │  (HTML5 / CSS3 / ES6 JavaScript) │
        └────────────────┬─────────────────┘
                         │ HTTPS REST API
                         ▼
        ┌──────────────────────────────────┐
        │         RENDER (TIER 2)          │
        │        Application Layer         │
        │    Node.js / Express REST API    │
        └────────────────┬─────────────────┘
                         │ Database Connection
                         │ (Mongoose / TLS)
                         ▼
        ┌──────────────────────────────────┐
        │      MONGODB ATLAS (TIER 3)      │
        │          Database Layer          │
        │        studentDB / students      │
        │  (User: harshalgaulkar43@gmail)  │
        └──────────────────────────────────┘
```

---

## 🚀 Cloud Platform Separation

| Tier | Layer | Cloud Platform | Role & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **Presentation Layer** | **Netlify** | Hosts user interface, captures input, displays student records, triggers REST API calls. Does NOT store DB credentials. |
| **Tier 2** | **Application Layer** | **Render** | Node.js / Express API server, validates input, applies business logic, manages CORS, talks to MongoDB Atlas securely. |
| **Tier 3** | **Database Layer** | **MongoDB Atlas** | Fully managed NoSQL cloud database cluster hosting `studentDB` and `students` collection. Connected via `harshalgaulkar43@gmail.com`. |

---

## 📦 Project Structure

```text
├── backend/                        # Tier 2: Application Layer (Render)
│   ├── config/
│   │   └── database.js             # MongoDB Atlas connection using Mongoose
│   ├── controllers/
│   │   └── studentController.js    # CRUD business logic
│   ├── models/
│   │   └── Student.js              # Student Mongoose Schema
│   ├── routes/
│   │   └── studentRoutes.js        # REST API route handlers
│   ├── .env.example                # Sample environment variables
│   ├── .gitignore                  # Git ignore rules for backend
│   ├── package.json                # Node dependencies and scripts
│   └── server.js                   # Express application entrypoint
│
├── frontend/                       # Tier 1: Presentation Layer (Netlify)
│   ├── css/
│   │   └── style.css               # Clean, responsive styles with stats dashboard
│   ├── js/
│   │   ├── api.js                  # Modular REST API client
│   │   └── app.js                  # DOM manipulation, CRUD handlers, toasts
│   ├── index.html                  # Dashboard & management interface
│   ├── netlify.toml                # Netlify deployment & redirect rules
│   └── _redirects                  # Single Page Application fallback
│
├── DEPLOYMENT_GUIDE.md             # Complete step-by-step cloud deployment manual
├── render.yaml                     # Render Blueprint deployment definition
├── .gitignore                      # Git ignore rules for workspace
└── README.md                       # Project documentation
```

---

## 🛠️ Data Model & Schema

Each student document stored in MongoDB Atlas (`studentDB.students`) follows this structure:

```json
{
  "_id": "670ec08d1f2a3c0012ab34cd",
  "studentId": "ST101",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "department": "Computer Science",
  "semester": 5,
  "contact": "9876543210",
  "createdAt": "2026-10-15T10:30:00.000Z",
  "updatedAt": "2026-10-15T10:30:00.000Z"
}
```

---

## 🔌 REST API Endpoints (Render Backend)

| HTTP Method | Endpoint | Description | Sample Payload / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Architecture status and endpoint guide | None |
| `GET` | `/api/health` | Health check for uptime monitoring | None |
| `GET` | `/api/students` | Retrieve all students (supports `?search=` and `?department=`) | Query params |
| `GET` | `/api/students/:id` | Retrieve single student by ID or `studentId` | `id` parameter |
| `POST` | `/api/students` | Insert a new student | `{ "studentId": "ST101", "name": "...", ... }` |
| `PUT` | `/api/students/:id` | Update student details | `{ "name": "...", "semester": 6, ... }` |
| `DELETE` | `/api/students/:id` | Remove student record | `id` parameter |

---

## 🧪 Local Quickstart

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (`harshalgaulkar43@gmail.com`) or local MongoDB

### 2. Configure Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and supply your MONGODB_URI and FRONTEND_URL
npm start
```

### 3. Run Frontend
Open `frontend/index.html` in your web browser (or serve it with Live Server / http-server).

---

## ☁️ Cloud Deployment Links (Post-Deployment)

- **Presentation Tier (Netlify):** `https://<your-site-name>.netlify.app`
- **Application Tier (Render):** `https://<your-service-name>.onrender.com`
- **Database Tier (MongoDB Atlas):** Managed cluster under `harshalgaulkar43@gmail.com`

---

## 📜 Assignment Compliance Checklist

- [x] Three tiers physically and logically separated across 3 clouds (Netlify, Render, MongoDB Atlas).
- [x] RESTful API handling full CRUD operations (`GET`, `POST`, `PUT`, `DELETE`).
- [x] MongoDB connection credentials hidden in environment variables (`MONGODB_URI`).
- [x] CORS configured for authorized frontend origin.
- [x] Interactive UI with stats, real-time search, modals, and toast alerts.
- [x] Git repository configured for personal account (`harshalgaulkar`).
