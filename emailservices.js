// emailservices.js
import nodemailer from 'nodemailer';

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',  // or any service like SendGrid, Mailgun, etc.
  auth: {
    user: process.env.EMAIL_USER,  // Add your email here
    pass: process.env.EMAIL_PASS,  // Add your email password or App password here
  },
});

// Function to send email
export const sendEmail = async (recipient, subject, message) => {
  try {
    const info = await transporter.sendMail({
      from: '"Your App" <your-email@gmail.com>', // sender address
      to: recipient, // recipient
      subject, // Subject line
      text: message, // plain text body
      html: `<p>${message}</p>`, // HTML body content
    });

    console.log('Email sent: ' + info.response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: error.message };
  }
};
