
'use server';

import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/components/emails/order-confirmation';
import { ProductUpdateEmail } from '@/components/emails/product-update';
import { OrderStatusUpdateEmail } from '@/components/emails/order-status-update';
import type { Order, OrderStatus } from '@/context/order-context';
import type { Product } from '@/lib/products';
import type { User } from 'firebase/auth';

interface SendEmailParams {
    order: Order;
    toEmail: string;
    appName: string;
    logoUrl?: string;
}

interface SendProductUpdateParams {
    product: Product;
    user: User;
    appName: string;
    logoUrl?: string;
}

interface SendOrderStatusUpdateParams {
    order: Order;
    status: OrderStatus;
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

export const sendProductUpdateEmail = async ({ product, user, appName, logoUrl }: SendProductUpdateParams) => {
    if (!process.env.RESEND_API_KEY) {
        const errorMessage = 'Email service is not configured: RESEND_API_KEY is missing.';
        console.error(errorMessage);
        return { data: null, error: { message: errorMessage, name: 'Configuration Error' } };
    }
    
    if (!user.email) {
        return { data: null, error: { message: 'User has no email address.', name: 'Application Error' } };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.send({
            from: `${appName} <onboarding@resend.dev>`,
            to: [user.email],
            subject: `An item on your wishlist has been updated!`,
            react: ProductUpdateEmail({ product, userDisplayName: user.displayName, appName, logoUrl }),
        });

        if (error) {
            console.error('Resend API Error:', error);
            return { data: null, error: { message: error.message, name: error.name } };
        }

        return { data, error: null };

    } catch (e: any) {
        console.error('Failed to send product update email:', e);
        return { data: null, error: { message: e.message || 'An unexpected error occurred.', name: e.name || 'Unknown Error' } };
    }
};

export const sendOrderStatusUpdateEmail = async ({ order, status, appName, logoUrl }: SendOrderStatusUpdateParams) => {
    if (!process.env.RESEND_API_KEY) {
        const errorMessage = 'Email service is not configured: RESEND_API_KEY is missing.';
        console.error(errorMessage);
        return { data: null, error: { message: errorMessage, name: 'Configuration Error' } };
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.send({
            from: `${appName} <onboarding@resend.dev>`,
            to: [order.shippingAddress.email],
            subject: `Your ${appName} order #${order.id} has been updated to: ${status}`,
            react: OrderStatusUpdateEmail({ order, status, appName, logoUrl }),
        });

        if (error) {
            console.error('Resend API Error for order status update:', error);
            return { data: null, error: { message: error.message, name: error.name } };
        }

        return { data, error: null };

    } catch (e: any) {
        console.error('Failed to send order status update email:', e);
        return { data: null, error: { message: e.message || 'An unexpected error occurred.', name: e.name || 'Unknown Error' } };
    }
};
