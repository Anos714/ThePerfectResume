import nodemailer from "nodemailer";
import { env } from "./env";

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: "Verify Your Email - The Perfect Resume",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2>Welcome to The Perfect Resume!</h2>
        <p>Thank you for registering. Please use the verification code below to verify your email address:</p>
        <h1 style="color: #4A90E2; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${email}`);
  } catch (error) {
    console.error("Error sending email via Brevo:", error);
    throw new Error("Failed to send verification email");
  }
};


export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: "Your OTP Code - The Perfect Resume",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2>Your OTP Code</h2>
        <p>Please use the OTP code below to complete your request:</p>
        <h1 style="color: #4A90E2; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email via Brevo:", error);
    throw new Error("Failed to send OTP email");
  }
};
