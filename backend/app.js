const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();

// Security headers
app.use(helmet());

// Rate limiting (max 5 requests per minute per IP for /send-email)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { message: "Too many requests, please try again later." },
});
app.use("/send-email", limiter);

// Parse allowed origins from environment variable
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).send("Server is running ✅");
});

// SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Helper: validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Send email with reCAPTCHA verification
app.post("/send-email", async (req, res) => {
  try {
    const { name, email, message, recaptchaToken } = req.body;

    // Basic input validation
    if (
      !name ||
      !email ||
      !message ||
      name.length < 3 ||
      message.length < 10 ||
      !isValidEmail(email)
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }

    if (!recaptchaToken) {
      return res.status(400).json({ message: "reCAPTCHA token is missing" });
    }

    // Verify reCAPTCHA
    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      }
    );
    const recaptchaData = await recaptchaResponse.json();
    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      return res.status(403).json({ message: "Failed reCAPTCHA verification" });
    }

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: "Contact Form Submission",
      html: generateEmailTemplate(name, email, message),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return res.status(500).json({ message: "Email failed", error });
      res.status(200).json({ message: "Email sent successfully", info });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// HTML Email template (colors & footer as requested)
function generateEmailTemplate(name, email, message) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
  <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0; color: #333;">
    <div style="max-width: 650px; margin: 0 auto; padding: 40px 40px 40px 60px; border-radius: 10px; box-shadow: 0 6px 15px rgba(0,0,0,0.1);">
      <div style="background-color: #0070C5; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; color: white;">
        <h1 style="font-family: 'Syne', sans-serif; font-size: 28px; margin: 0;">New Message Notification</h1>
      </div>
      <div style="padding: 20px 0; font-size: 16px; line-height: 1.6;">
        <p>Hello,</p>
        <p>You received a new message from <strong style="color: #0070C5;">${name}</strong>:</p>
        <div style="background-color: #f1f1f1; border-left: 4px solid #2F9A5D; padding: 15px 20px; font-style: italic; margin-bottom: 30px;">
          <strong>Name:</strong> ${name} <br>
          <strong>Email:</strong> ${email} <br>
          <strong>Message:</strong> ${message}
        </div>
      </div>
      <div style="background-color: #0070C5; padding: 20px; border-radius: 0 0 10px 10px; color: white; text-align: center;">
        <img src="https://vertexglobalsourcing.com/assets/logo_vertex_global_sourcing.png" alt="Logo" style="height: 50px; margin-bottom: 10px;">
        <p style="margin: 5px 0; font-size: 14px;">
          Vertex Global Sourcing<br>
          Address: Houston, Texas<br>
          Email: <a href="mailto:info@vertexglobalsourcing.com" style="color: #2F9A5D; text-decoration: underline;">info@vertexglobalsourcing.com</a><br>
          Website: <a href="https://www.vertexglobalsourcing.com" style="color: #2F9A5D; text-decoration: underline;">www.vertexglobalsourcing.com</a>
        </p>
      </div>
    </div>
  </body>
  </html>`;
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
