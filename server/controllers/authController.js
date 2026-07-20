import crypto from "crypto";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  validateRegister,
  validateLogin,
  validateForgot,
  validateNewPassword,
  validateChangePassword,
} from "../middleware/validators.js";
import { OAuth2Client } from "google-auth-library";

// Google verifier — the client id is loaded from the environment, never hardcoded.
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Sets the JWT as an httpOnly cookie. httpOnly means JavaScript on the page
// cannot read it, which protects the token from XSS attacks. The browser
// sends it automatically on every request.
const sendTokenCookie = (res, userId) => {
  const token = generateToken(userId);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // https only in prod
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};

// Standard shape we return for a user (never includes the password).
const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  provider: user.provider,
  createdAt: user.createdAt,
});

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
export const register = asyncHandler(async (req, res) => {
  validateRegister(req, res);
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("An account with that email already exists");
  }

  // Password is hashed automatically by the model's pre-save hook.
  const user = await User.create({ name, email, password });

  sendTokenCookie(res, user._id);
  res.status(201).json(publicUser(user));
});

// @desc   Log a user in
// @route  POST /api/auth/login
// @access Public
export const login = asyncHandler(async (req, res) => {
  validateLogin(req, res);
  const { email, password } = req.body;

  // We must explicitly ask for the password because the schema hides it.
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  sendTokenCookie(res, user._id);
  res.json(publicUser(user));
});

// @desc   Log out (clear the cookie)
// @route  POST /api/auth/logout
// @access Public
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// @desc   Get the currently logged-in user (used to rehydrate the UI on refresh)
// @route  GET /api/auth/me
// @access Private
export const getMe = asyncHandler(async (req, res) => {
  // req.user is set by the protect middleware.
  res.json(publicUser(req.user));
});

// Hashes an incoming raw token the same way createPasswordResetToken stored it,
// so we can look the user up by the hashed value.
const hashToken = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");

// @desc   Start the forgot-password flow: email a reset link
// @route  POST /api/auth/forgot-password
// @access Public
export const forgotPassword = asyncHandler(async (req, res) => {
  validateForgot(req, res);
  const { email } = req.body;

  const user = await User.findOne({ email });

  // SECURITY: prevent user enumeration. We return the SAME success response
  // whether or not the email exists, so attackers can't probe for accounts.
  if (user) {
    const rawToken = user.createPasswordResetToken();
    // Save the hashed token + expiry. password is NOT modified, so the
    // pre-save hook skips hashing — no double-hash, no middleware risk.
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${rawToken}`;
    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your HabitForge password",
        text: `Reset your password (link valid 15 minutes): ${resetUrl}`,
        html: `<p>You requested a password reset.</p>
               <p><a href="${resetUrl}">Click here to reset your password</a></p>
               <p>This link expires in 15 minutes. If you didn't request this, ignore this email.</p>`,
      });
    } catch (err) {
      // If sending fails, roll back the token so a broken email doesn't leave
      // a dangling reset token on the account.
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500);
      throw new Error("Could not send reset email. Please try again later.");
    }
  }

  res.json({
    message: "If an account exists for that email, a reset link has been sent.",
  });
});

// @desc   Complete the reset using the token from the email link
// @route  POST /api/auth/reset-password/:token
// @access Public
export const resetPassword = asyncHandler(async (req, res) => {
  validateNewPassword(req, res);

  // Look the user up by the HASHED token AND an unexpired expiry.
  const hashed = hashToken(req.params.token);
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password +resetPasswordToken +resetPasswordExpire");

  if (!user) {
    res.status(400);
    throw new Error("Reset link is invalid or has expired");
  }

  // EDGE CASE: block reusing the current password.
  if (await user.matchPassword(req.body.password)) {
    res.status(400);
    throw new Error("New password must be different from the old one");
  }

  // Assign the new password and clear the reset fields. Because password IS
  // modified, the pre-save hook hashes it exactly once on save().
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password reset. You can now log in." });
});

// @desc   Logged-in user changes their own password
// @route  PUT /api/auth/change-password
// @access Private
export const changePassword = asyncHandler(async (req, res) => {
  validateChangePassword(req, res);
  const { currentPassword, newPassword } = req.body;

  // IMPORTANT: req.user comes from `protect`, which loads the user WITHOUT the
  // password (select: false). We must re-fetch WITH the password to verify it.
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  // EDGE CASE: don't allow setting the same password again.
  if (currentPassword === newPassword) {
    res.status(400);
    throw new Error("New password must be different from the current one");
  }

  user.password = newPassword; // pre-save hook hashes it once
  await user.save();

  res.json({ message: "Password updated successfully" });
});

// @desc   Log in or sign up with a Google credential (ID token from the popup).
//         Produces the EXACT same JWT cookie as normal login.
// @route  POST /api/auth/google
// @access Public
export const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    res.status(400);
    throw new Error("Missing Google credential");
  }

  // Verify the token with Google. Throws if it's invalid, expired, or forged.
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    res.status(401);
    throw new Error("Invalid Google credential");
  }

  if (!payload?.email || !payload.email_verified) {
    res.status(401);
    throw new Error("Google account email is not verified");
  }

  const email = payload.email.toLowerCase();
  const googleId = payload.sub;
  const name = payload.name || email.split("@")[0];
  const avatar = payload.picture || "";

  // ACCOUNT LINKING: if a user with this email already exists, link Google to
  // that account instead of creating a duplicate. Otherwise create a new
  // Google-based account (no password).
  let user = await User.findOne({ email });

  if (user) {
    let changed = false;
    if (!user.googleId) {
      user.googleId = googleId;
      changed = true;
    }
    if (!user.avatar && avatar) {
      user.avatar = avatar;
      changed = true;
    }
    if (changed) {
      // Password is untouched here, so skip validation (Google-only accounts
      // legitimately have no password) and avoid re-hashing anything.
      await user.save({ validateBeforeSave: false });
    }
  } else {
    user = await User.create({
      name,
      email,
      provider: "google",
      googleId,
      avatar,
      // no password — the schema only requires it for local accounts
    });
  }

  // Same JWT cookie helper every other login path uses.
  sendTokenCookie(res, user._id);
  res.json(publicUser(user));
});