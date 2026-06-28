import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // --- Forgot-password fields (NEW) ---
    // We store only the HASHED token, never the raw one. Even if the DB
    // leaks, the stored value can't be used as a reset link.
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
  },
  { timestamps: true }
);

// ⚠️ UNCHANGED pre-save hook. This is the ONLY pre('save') hook in the app.
// All password flows (register, reset, change) go through user.save() so
// they reuse this single, correct hook — no new middleware is introduced.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // skip if password unchanged

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generates a reset token. Returns the RAW token (to email to the user) but
// stores the SHA-256 HASH on the document. NOTE: this is a plain instance
// method, NOT middleware — it never touches next(), so it cannot reintroduce
// the "next is not a function" bug.
userSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  return rawToken;
};

const User = mongoose.model("User", userSchema);
export default User;
