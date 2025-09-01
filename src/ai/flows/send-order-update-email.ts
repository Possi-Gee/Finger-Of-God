
'use server';

/**
 * @fileOverview A Genkit flow for sending order update emails.
 *
 * - sendOrderUpdateEmail - A function that sends an email notification to a customer when their order status changes.
 * - SendOrderUpdateEmailInput - The input type for the sendOrderUpdateEmail function.
 * - SendOrderUpdateEmailOutput - The return type for the sendOrderUpdateEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import nodemailer from 'nodemailer';

const SendOrderUpdateEmailInputSchema = z.object({
  orderId: z.string().describe('The ID of the order.'),
  status: z.string().describe('The new status of the order.'),
  recipientEmail: z.string().email().describe('The email address of the customer.'),
  customerName: z.string().describe('The name of the customer.'),
  appName: z.string().describe('The name of the application.'),
});
export type SendOrderUpdateEmailInput = z.infer<typeof SendOrderUpdateEmailInputSchema>;

const SendOrderUpdateEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was sent successfully.'),
  message: z.string().describe('A message indicating the result of the operation.'),
});
export type SendOrderUpdateEmailOutput = z.infer<typeof SendOrderUpdateEmailOutputSchema>;

const getEmailContent = (status: string, orderId: string, customerName: string, appName: string) => {
    let subject = `Your ${appName} Order #${orderId} has been updated`;
    let html = `<p>Hi ${customerName},</p><p>There's an update on your order #${orderId}. The new status is: <strong>${status}</strong>.</p>`;

    switch (status.toLowerCase()) {
        case 'shipped':
            subject = `🚀 Your ${appName} Order #${orderId} Has Shipped!`;
            html = `
                <h2>Great News, ${customerName}!</h2>
                <p>Your order #${orderId} is on its way to you. You can track its progress from your order history page.</p>
                <p>We're so excited for you to receive your items!</p>
            `;
            break;
        case 'delivered':
            subject = `✅ Your ${appName} Order #${orderId} Has Been Delivered!`;
            html = `
                <h2>Hooray, ${customerName}!</h2>
                <p>Your order #${orderId} has arrived. We hope you enjoy your new items!</p>
                <p>Thank you for shopping with us.</p>
            `;
            break;
        case 'cancelled':
            subject = `Your ${appName} Order #${orderId} Has Been Cancelled`;
            html = `
                <h2>Order Cancellation</h2>
                <p>Hi ${customerName}, as requested, your order #${orderId} has been cancelled.</p>
                <p>If you have any questions, please feel free to contact our support team.</p>
            `;
            break;
    }
     return { subject, html: styleEmail(html, appName) };
};

const styleEmail = (content: string, appName: string) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
              .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
              .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
              .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
              h2 { color: #1a1a1a; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>${appName}</h1>
              </div>
              ${content}
              <div class="footer">
                  <p>Thank you for choosing ${appName}!</p>
              </div>
          </div>
      </body>
      </html>
    `;
};


export async function sendOrderUpdateEmail(input: SendOrderUpdateEmailInput): Promise<SendOrderUpdateEmailOutput> {
  return sendOrderUpdateEmailFlow(input);
}


const sendOrderUpdateEmailFlow = ai.defineFlow(
  {
    name: 'sendOrderUpdateEmailFlow',
    inputSchema: SendOrderUpdateEmailInputSchema,
    outputSchema: SendOrderUpdateEmailOutputSchema,
  },
  async (input) => {
    const { orderId, status, recipientEmail, customerName, appName } = input;
    
    const {
        EMAIL_HOST,
        EMAIL_PORT,
        EMAIL_USER,
        EMAIL_PASS,
        SENDER_EMAIL
    } = process.env;

    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS || !SENDER_EMAIL) {
        const errorMessage = 'Email service is not configured. Please set EMAIL environment variables.';
        console.error(errorMessage);
        return { success: false, message: errorMessage };
    }

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT, 10),
      secure: parseInt(EMAIL_PORT, 10) === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const { subject, html } = getEmailContent(status, orderId, customerName, appName);

    const mailOptions = {
      from: `"${appName}" <${SENDER_EMAIL}>`,
      to: recipientEmail,
      subject: subject,
      html: html,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${recipientEmail}`);
      return { success: true, message: `Update email sent to ${recipientEmail}.` };
    } catch (error: any) {
      console.error('Failed to send email:', error);
      return { success: false, message: `Failed to send email: ${error.message}` };
    }
  }
);
