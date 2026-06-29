# HabitForge

> A full-stack MERN application to build habits, track progress, maintain streaks, and visualize consistency through an interactive analytics dashboard.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Features

### Authentication
- Secure JWT Authentication
- HTTP-only Cookie Sessions
- Password Hashing with bcrypt
- Forgot & Reset Password via Email
- Change Password

### Habit Management
- Create, Edit & Delete Habits
- Daily / Weekly / Custom Recurring Habits
- Mark Daily Completion
- Automatic Streak Calculation
- Habit Consistency Tracking

### Todo Management
- Complete CRUD Operations
- Priority Levels
- Due Dates
- Pending / Completed / Overdue Filters

### Dashboard & Analytics
- Activity Overview
- Current & Longest Streak
- Overall Consistency Score
- Interactive Heatmap
- Weekly & Monthly Progress Charts
- Per-Habit Analytics

### User Experience
- Responsive Design
- Dark UI
- Protected Routes
- Modular Architecture

---

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Context API
- Axios
- CSS

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt
- Nodemailer

### Database
- MongoDB
- Mongoose

### Charts
- Recharts

---

## Project Structure

```
HabitForge
│
├── client
│   ├── components
│   ├── context
│   ├── hooks
│   ├── pages
│   ├── services
│   └── utils
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   └── utils
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/HabitForge.git
cd HabitForge
```

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` inside the **server** folder.

```env
PORT=5000
MONGO_URI=your_mongodb_uri

JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

---

## API Overview

### Authentication

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

POST   /api/auth/forgot-password
POST   /api/auth/reset-password/:token
PUT    /api/auth/change-password
```

### Habits

```
GET    /api/habits
POST   /api/habits
PUT    /api/habits/:id
DELETE /api/habits/:id

POST   /api/habits/:id/complete
DELETE /api/habits/:id/complete
```

### Todos

```
GET
POST
PUT
DELETE
/api/todos
```

### Analytics

```
GET /api/analytics
GET /api/analytics/day/:date
```

---

## Screenshots

Add screenshots here.

```
Dashboard
Habits Page
Analytics
Heatmap
Todo Page
```

---

## Future Improvements

- Reminder Notifications
- Habit Categories
- Search & Filtering
- PWA Support
- Drag & Drop Todo Ordering
- Calendar Sync

---

## What I Learned

- Building scalable REST APIs with Express
- JWT Authentication & Cookie-based Sessions
- MongoDB Data Modeling
- React Context API
- Full CRUD Architecture
- Dashboard & Data Visualization
- Secure Authentication Flows
- Component-based Frontend Design

---

## License

This project is licensed under the MIT License.