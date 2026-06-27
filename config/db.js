import mongoose from "mongoose";

// Connects to MongoDB once when the server boots.
// We keep this in its own file so index.js stays clean and the
// connection logic is easy to find and explain.
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // If we cannot reach the database there is no point staying up.
    process.exit(1);
  }
};
