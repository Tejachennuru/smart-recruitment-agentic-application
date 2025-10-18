import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendInterviewInvite = async (interviewerEmail, jobTitle, interviewUrl) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: interviewerEmail,
    subject: `Interview Access: ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Interview Access Granted</h2>
        <p>You have been granted access to review candidates for the position:</p>
        <h3 style="color: #1e40af;">${jobTitle}</h3>
        <p>Click the link below to access the interview dashboard:</p>
        <a href="${interviewUrl}" 
           style="display: inline-block; background-color: #2563eb; color: white; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                  margin: 20px 0;">
          Access Interview Dashboard
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This link will expire in 30 days. If you have any questions, please contact HR.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};