
'use server';

/**
 * @fileOverview A Genkit flow for sending order update emails using Nodemailer.
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
  status: z.string().describe('The new status of the order. Can be custom for different email types (e.g., "Confirmed").'),
  recipientEmail: z.string().email().describe('The email address of the recipient (customer or admin).'),
  customerName: z.string().describe('The name of the customer.'),
  appName: z.string().describe('The name of the application.'),
});
export type SendOrderUpdateEmailInput = z.infer<typeof SendOrderUpdateEmailInputSchema>;

const SendOrderUpdateEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was sent successfully.'),
  message: z.string().describe('A message indicating the result of the operation.'),
});
export type SendOrderUpdateEmailOutput = z.infer<typeof SendOrderUpdateEmailOutputSchema>;

const getEmailContent = (status: string, orderId: string, customerName: string, appName: string, recipient: 'customer' | 'admin') => {
    let subject = `Your ${appName} Order #${orderId} has been updated`;
    let html = `<p>Hi ${customerName},</p><p>There's an update on your order #${orderId}. The new status is: <strong>${status}</strong>.</p>`;

    switch (status.toLowerCase()) {
        case 'confirmed':
             subject = `✅ Your ${appName} Order Confirmation #${orderId}`;
             html = `
                <h2>Thanks for your order, ${customerName}!</h2>
                <p>We've received your order #${orderId} and are getting it ready. We'll notify you as soon as it has shipped.</p>
                <p>You can view your order details anytime by clicking the button below.</p>
            `;
            break;
        case 'new order': // For Admin
            subject = `🎉 New Order Received! #${orderId}`;
            html = `
                <h2>You've received a new order!</h2>
                <p>A new order (#${orderId}) was placed by ${customerName}.</p>
                <p>Please review it in the admin dashboard to begin processing.</p>
            `;
            break;
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
     return { subject, html: styleEmail(html, appName, orderId, recipient) };
};

const styleEmail = (content: string, appName: string, orderId: string, recipient: 'customer' | 'admin') => {
    const orderUrl = recipient === 'customer' 
      ? `https://shopwave-6mh7a.web.app/orders/${orderId}`
      : `https://shopwave-6mh7a.web.app/admin/orders/${orderId}`;
      
    const buttonText = recipient === 'customer' ? 'View Your Order' : 'View in Admin';

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); background-color: #fff; }
              .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
              .header h1 { color: #1a1a1a; font-size: 24px; margin: 0;}
              .content { padding: 20px 0; }
              .button-container { text-align: center; margin-top: 20px; }
              .button { background-color: #1976d2; color: #ffffff !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
              .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
              h2 { color: #1a1a1a; }
              p { margin-bottom: 1em; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>${appName}</h1>
              </div>
              <div class="content">
                ${content}
                <div class="button-container">
                    <a href="${orderUrl}" class="button">${buttonText}</a>
                </div>
              </div>
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
        ADMIN_EMAIL
    } = process.env;

    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
        const errorMessage = 'Email service is not configured. Please set required EMAIL environment variables for Nodemailer.';
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
    
    const recipientType = recipientEmail === ADMIN_EMAIL ? 'admin' : 'customer';

    const { subject, html } = getEmailContent(status, orderId, customerName, appName, recipientType);
    
    const fromAddress = `"${appName}" <${EMAIL_USER}>`;

    const mailOptions = {
      from: fromAddress,
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
