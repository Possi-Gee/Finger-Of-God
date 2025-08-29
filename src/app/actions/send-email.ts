
'use server';

import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/components/emails/order-confirmation';
import type { Order } from '@/context/order-context';
import { SiteSettingsContext } from '@/context/site-settings-context';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    order: Order;
    toEmail: string;
}

export const sendOrderConfirmationEmail = async ({ order, toEmail }: SendEmailParams) => {
    if (!process.env.RESEND_API_KEY) {
        console.error('Resend API key is not set.');
        throw new Error('Email service is not configured.');
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'ShopWave <onboarding@resend.dev>',
            to: [toEmail],
            subject: `Your ShopWave Order Confirmation #${order.id}`,
            react: OrderConfirmationEmail({ order }),
        });

        if (error) {
            // The error object from Resend has a 'message' property.
            // We log the full error for debugging but throw a clean message.
            console.error('Resend API Error:', error);
            throw new Error(error.message || 'An unknown error occurred while sending the email.');
        }

        return data;

    } catch (e: any) {
        // This will catch network errors or other exceptions during the API call.
        console.error('Failed to send email:', e);
        throw new Error(e.message || 'An unexpected error occurred.');
    }
};
