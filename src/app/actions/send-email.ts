'use server';

import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/components/emails/order-confirmation';
import type { Order } from '@/context/order-context';

interface SendEmailParams {
    order: Order;
    toEmail: string;
    appName: string;
    logoUrl?: string;
}

export const sendOrderConfirmationEmail = async ({ order, toEmail, appName, logoUrl }: SendEmailParams) => {

    if (!process.env.RESEND_API_KEY) {
        const errorMessage = 'Email service is not configured: RESEND_API_KEY is missing.';
        console.error(errorMessage);
        return { data: null, error: { message: errorMessage, name: 'Configuration Error' } };
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.send({
            from: `${appName} <onboarding@resend.dev>`,
            to: [toEmail],
            subject: `Your ${appName} Order Confirmation #${order.id}`,
            react: OrderConfirmationEmail({ order, appName, logoUrl }),
        });

        if (error) {
            console.error('Resend API Error:', error);
            return { data: null, error: { message: error.message, name: error.name } };
        }

        return { data, error: null };

    } catch (e: any) {
        console.error('Failed to send email:', e);
        return { data: null, error: { message: e.message || 'An unexpected error occurred.', name: e.name || 'Unknown Error' } };
    }
};
