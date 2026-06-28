import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
console.log("MONGO_URI =", process.env.MONGO_URI);
connectDB();

const app = express();

// --- Global middleware (runs on every request) ---
app.use(express.json()); // parse JSON request bodies
app.use(cookieParser()); // read the auth cookie
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // allow the browser to send/receive our cookie
  })
);

// --- Routes ---
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/analytics", analyticsRoutes);

// --- Error handling (must be registered LAST) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
