const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // Load environment variables from .env file

// Create the Express app
const app = express();

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://www.ssbgroupllc.com", // Production frontend origin
      "http://localhost:4200", // Local development frontend
    ];
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

// SMTP Configuration using environment variables
const transporter = nodemailer.createTransport({
  host: "premium249.web-hosting.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER, // use environment variable
    pass: process.env.EMAIL_PASS, // use environment variable
  },
});

// Send email function
app.post("/send-email", (req, res) => {
  const { name, email, message } = req.body;

  // Setup email data
  const mailOptions = {
    from: process.env.EMAIL_USER, // use environment variable
    to: "info@ssbgroupllc.com", // recipient email
    subject: "Contact Form Submission",
    html: generateEmailTemplate(name, email, message), // Use the HTML template function
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
        <div class="email-header" style="background-color: #27548A; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; color: white;">
          <h1 style="font-family: 'Syne', sans-serif; font-size: 28px; margin: 0;">New Message Notification</h1>
        </div>

        <!-- Content Section -->
        <div class="email-content" style="padding: 20px 0; font-size: 16px; line-height: 1.6;">
          <p>Hello,</p>
          <p>You received a new message from <strong style="color: #27548A;">${name}</strong>:</p>

          <!-- Message Box -->
          <div class="message-box" style="background-color: #f1f1f1; border-left: 4px solid #27548A; padding: 15px 20px; font-style: italic; margin-bottom: 30px;">
            <strong>Name:</strong> ${name} <br>
            <strong>Email:</strong> ${email} <br>
            <strong>Message:</strong> ${message}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Handle preflight requests (if needed)
app.options("/send-email", cors(corsOptions)); // Handle preflight request for the /send-email route

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
