'use server';

import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/components/emails/order-confirmation';
import type { Order } from '@/context/order-context';
import { useSiteSettings } from '@/hooks/use-site-settings';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    order: Order;
    toEmail: string;
}

export const sendOrderConfirmationEmail = async ({ order, toEmail }: SendEmailParams) => {
    const { state: settings } = useSiteSettings();

    if (!process.env.RESEND_API_KEY) {
        const errorMessage = 'Email service is not configured: RESEND_API_KEY is missing.';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'ShopWave <onboarding@resend.dev>',
            to: [toEmail],
            subject: `Your ${settings.appName} Order Confirmation #${order.id}`,
            react: OrderConfirmationEmail({ order, appName: settings.appName, logoUrl: settings.logoUrl }),
        });

        if (error) {
            console.error('Resend API Error:', error);
            throw new Error(error.message || 'An unknown error occurred while sending the email.');
        }

        return data;

    } catch (e: any) {
        console.error('Failed to send email:', e);
        throw new Error(e.message || 'An unexpected error occurred.');
    }
};
