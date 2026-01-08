const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
require("dotenv").config();
const fetch = require("node-fetch"); // ensure you have node-fetch installed

const app = express();

/* =========================
   CORS & REQUEST LOGGER
========================= */
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : [];

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("CORS blocked"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =========================
   HELMET (CORS-SAFE)
========================= */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

/* =========================
   BODY PARSER
========================= */
app.use(bodyParser.json({ limit: "10kb" }));

/* =========================
   RATE LIMIT (ANTI-BOT)
========================= */
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, try again later." },
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ message: "Too many requests" });
  },
});

app.use("/send-email", limiter);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server running ✅" });
});

/* =========================
   SMTP TRANSPORT
========================= */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

/* =========================
   HELPERS
========================= */
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/* =========================
   SEND EMAIL ROUTE
========================= */
app.post("/send-email", async (req, res) => {
  try {
    const { name, email, message, recaptchaToken } = req.body;

    console.log("Received /send-email request:", { name, email, message, recaptchaToken });

    // Basic validation
    if (
      !name ||
      !email ||
      !message ||
      name.length < 3 ||
      message.length < 10 ||
      !isValidEmail(email)
    ) {
      console.warn("Validation failed:", req.body);
      return res.status(400).json({ message: "Invalid input" });
    }

    if (!recaptchaToken) {
      console.warn("Missing reCAPTCHA token");
      return res.status(400).json({ message: "Missing reCAPTCHA token" });
    }

    // Verify reCAPTCHA
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      }
    );

    const data = await response.json();
    console.log("reCAPTCHA response:", data);

    if (!data.success) {
      console.warn("reCAPTCHA verification failed for token:", recaptchaToken);
      return res.status(403).json({ message: "reCAPTCHA failed" });
    }

    // Send email
    const mailInfo = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: "Contact Form Submission",
      html: generateEmailTemplate(name, email, message),
    });

    console.log("Email sent successfully:", mailInfo.response);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Error in /send-email:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   EMAIL TEMPLATE
========================= */
function generateEmailTemplate(name, email, message) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family:Arial;background:#fff;color:#333">
<div style="max-width:650px;margin:auto;box-shadow:0 6px 15px rgba(0,0,0,.1)">
<div style="background:#0070C5;color:#fff;padding:30px;text-align:center">
<h1>New Message Notification</h1>
</div>
<div style="padding:20px">
<p><strong>${name}</strong> sent a message:</p>
<div style="border-left:4px solid #2F9A5D;padding:15px;background:#f1f1f1">
<strong>Email:</strong> ${email}<br>
<strong>Message:</strong> ${message}
</div>
</div>
<div style="background:#0070C5;color:#fff;text-align:center;padding:20px">
<img src="https://vertexglobalsourcing.com/assets/logo_vertex_global_sourcing.png" height="50"><br>
Vertex Global Sourcing<br>
Houston, Texas<br>
<a href="https://vertexglobalsourcing.com" style="color:#2F9A5D">vertexglobalsourcing.com</a>
</div>
</div>
</body>
</html>`;
}

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
