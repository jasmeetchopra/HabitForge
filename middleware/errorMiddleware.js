// Catches any request to a route that doesn't exist and turns it into a
// normal error so the JSON shape is consistent.
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

// The single place where all errors are turned into a JSON response.
// Because every controller forwards errors here (via asyncHandler), the
// client always receives the same { message } shape on failure.
export const errorHandler = (err, req, res, next) => {
  // If a controller set a status (e.g. res.status(400)) keep it,
  // otherwise default to 500 Internal Server Error.
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Something went wrong";

  // Friendlier messages for two common Mongo errors:
  // Bad ObjectId in the URL ("/habits/abc")
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }
  // Duplicate key (e.g. registering an email that already exists)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `That ${field} is already in use`;
  }

  res.status(statusCode).json({
    message,
    // Only leak the stack trace while developing, never in production.
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
