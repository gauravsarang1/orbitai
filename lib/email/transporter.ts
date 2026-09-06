import nodemailer from 'nodemailer';

export const EMAIL_FROM = process.env.EMAIL_USER || 'gauravsarang223@gmail.com';

let transporterInstance: nodemailer.Transporter | null = null;

export function getEmailTransporter(): nodemailer.Transporter | null {
  if (transporterInstance) {
    return transporterInstance;
  }

  const user = process.env.EMAIL_USER || 'gauravsarang223@gmail.com';
  const pass = process.env.EMAIL_PASS;

  if (!pass) {
    console.warn(
      '⚠️ [Nodemailer] EMAIL_PASS environment variable is not set. Emails will be logged to server console.'
    );
    return null;
  }

  try {
    transporterInstance = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
    return transporterInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Nodemailer transporter:', error);
    return null;
  }
}
