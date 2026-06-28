import nodemailer from "nodemailer";

// Sends an email. In development, if no SMTP credentials are configured, we
// fall back to logging the message to the console so the whole forgot-password
// flow is testable without a real mail server. In production you MUST set the
// SMTP_* env vars.
export const sendEmail = async ({ to, subject, html, text }) => {
  const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER;

  if (!hasSmtp) {
    console.log("\n========== DEV EMAIL (no SMTP configured) ==========");
    console.log("To:     ", to);
    console.log("Subject:", subject);
    console.log("Body:   ", text || html);
    console.log("====================================================\n");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false otherwise
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "HabitForge <no-reply@habitforge.app>",
    to,
    subject,
    text,
    html,
  });
};
