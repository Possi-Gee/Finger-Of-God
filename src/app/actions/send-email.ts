
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
        throw new Error('Resend API key is not set. Please set the RESEND_API_KEY environment variable.');
    }

    const { data, error } = await resend.emails.send({
        from: 'ShopWave <onboarding@resend.dev>',
        to: [toEmail],
        subject: `Your ShopWave Order Confirmation #${order.id}`,
        react: OrderConfirmationEmail({ order }),
    });

    if (error) {
        console.error('Resend error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
};
