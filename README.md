# HabitForge

> A modern full-stack habit tracking application built with the **MERN** stack that helps users build consistency through habit tracking, progress analytics, streak monitoring, and an intuitive productivity dashboard.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen?logo=mongodb)

---

## Overview

HabitForge is a productivity-focused web application designed to make habit building simple and engaging. Users can create recurring habits, track daily progress, manage personal todos, visualize their consistency with interactive charts and heatmaps, and monitor long-term growth through detailed analytics.

The project follows a modular MERN architecture with secure authentication, RESTful APIs, reusable React components, and MongoDB for persistent data storage.

---

## Features

### Authentication

* Secure JWT Authentication
* HTTP-only Cookie Sessions
* Password Hashing using bcrypt

### Habit Management

* Create, Update & Delete Habits
* Daily, Weekly & Custom Recurring Habits
* Daily Habit Completion Tracking
* Automatic Streak Calculation
* Habit Consistency Score

### Todo Management

* Full CRUD Operations
* Priority Levels
* Due Dates
* Pending, Completed & Overdue Filters

### Dashboard & Analytics

* Productivity Dashboard
* Current & Longest Streak
* Overall Consistency Score
* Interactive Activity Heatmap
* Weekly & Monthly Progress Charts
* Per-Habit Analytics

### User Experience

* Responsive Design
* Dark Theme
* Protected Routes
* Modular Component Architecture

---

## Tech Stack

### Frontend

* React
* Vite
* React Router
* Context API
* Axios
* CSS

### Backend

* Node.js
* Express.js
* JWT
* bcrypt
* Nodemailer

### Database

* MongoDB
* Mongoose

### Visualization

* Recharts

---

## Project Structure

```text
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

## Screenshots

> Add screenshots of the application here.

* Dashboard
* Habits
* Analytics
* Activity Heatmap
* Todos
* Profile

---

## Future Improvements

* Reminder Notifications
* Habit Categories
* Search & Filtering
* Forgot Password
* Change Password
