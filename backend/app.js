const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // Load environment variables from .env file

// Create the Express app
const app = express();

// Parse allowed origins from environment variable (comma-separated)
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map(origin => origin.trim())
  : [];

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error("Not allowed by CORS")); // Reject the request
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Support credentials (cookies, authorization headers)
};

// Apply CORS middleware with options
app.use(cors(corsOptions));
app.use(bodyParser.json()); // For parsing JSON requests

// Health check route
app.get("/", (req, res) => {
  res.status(200).send("Server is running ✅");
});

// SMTP Configuration using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.vertexglobalsourcing.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true" || false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // required on many shared hosts
  },
});

// Send email function
app.post("/send-email", (req, res) => {
  const { name, email, message } = req.body;

  // Setup email data
  const mailOptions = {
    from: process.env.EMAIL_USER, // use environment variable
    to: process.env.EMAIL_TO || "info@vertexglobalsourcing.com", // recipient email
    subject: "Contact Form Submission",
    html: generateEmailTemplate(name, email, message),
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: "Failed to send email", error });
    }
    res.status(200).json({ message: "Email sent successfully", info });
  });
});

// Generate HTML email template
function generateEmailTemplate(name, email, message) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; color: #333;">
      <div class="email-container" style="max-width: 650px; margin: 0 auto; background-color: #ffffff; padding: 40px 40px 40px 60px; border-radius: 10px; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);">
        
        <!-- Header Section -->
        <div class="email-header" style="background-color: #0070C5; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; color: white;">
          <h1 style="font-family: 'Syne', sans-serif; font-size: 28px; margin: 0;">New Message Notification</h1>
        </div>
        
        <!-- Content Section -->
        <div class="email-content" style="padding: 20px 0; font-size: 16px; line-height: 1.6;">
          <p>Hello,</p>
          <p>You received a new message from <strong style="color: #0070C5;">${name}</strong>:</p>
          
          <!-- Message Box -->
          <div class="message-box" style="background-color: #2F9A5D; border-left: 4px solid #0070C5; padding: 15px 20px; font-style: italic; margin-bottom: 30px; color: #ffffff;">
            <strong>Name:</strong> ${name} <br>
            <strong>Email:</strong> ${email} <br>
            <strong>Message:</strong> ${message}
          </div>
        </div>

        <!-- Footer Section -->
        <div class="email-footer" style="background-color: #0070C5; padding: 20px; border-radius: 0 0 10px 10px; color: white; text-align: center;">
          <img src="https://www.vertexglobalsourcing.com/assets/logo.png" alt="Vertex Global Sourcing Logo" style="height: 50px; margin-bottom: 10px;">
          <p style="margin: 5px 0; font-size: 14px;">
            Vertex Global Sourcing<br>
            Email: <a href="mailto:info@vertexglobalsourcing.com" style="color: #ffffff; text-decoration: underline;">info@vertexglobalsourcing.com</a><br>
            Phone: <a href="tel:+1234567890" style="color: #ffffff; text-decoration: underline;">+1 (234) 567-890</a><br>
            Website: <a href="https://www.vertexglobalsourcing.com" style="color: #ffffff; text-decoration: underline;">www.vertexglobalsourcing.com</a>
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}


// Handle preflight requests
app.options("/send-email", cors(corsOptions));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
