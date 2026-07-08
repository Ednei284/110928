import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_APP_EMAIL, // Your Gmail address
    pass: process.env.GOOGLE_APP_PASSWORD, // The 16-character App Password
  },
});