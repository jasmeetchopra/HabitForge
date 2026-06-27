import jwt from "jsonwebtoken";

// Creates a signed JWT that proves "this request belongs to user X".
// We only put the user id inside the token. The token is signed with our
// secret, so the client can hold it but cannot forge or change it.
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};
