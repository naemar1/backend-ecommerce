import http from "http";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create transporter manually with SMTP configuration
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",   // Gmail SMTP host
    port: 465,                // Secure SMTP port (SSL)
    secure: true,             // Use SSL
    auth: {
        user: process.env.EMAIL,  // Your Gmail address
        pass: process.env.EMAIL_PASS,  // Your App Password (not Gmail password)
    },
});

// Function to send an email
async function sendEmail(to, subject, text, html) {
    try {
        // console.log("to, subject, text, html", to, subject, text, html)
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject,
            text,
            html,
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        return { success: false, error: error.message }
    }
};

export default sendEmail;