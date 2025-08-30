
'use server';

import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/components/emails/order-confirmation';
import { ProductUpdateEmail } from '@/components/emails/product-update';
import { OrderStatusUpdateEmail } from '@/components/emails/order-status-update';
import type { Order, OrderStatus } from '@/context/order-context';
import type { Product } from '@/lib/products';
import type { User } from 'firebase/auth';

interface SendOrderConfirmationEmailParams {
    order: Order;
    toEmail: string;
    fromEmail: string;
    appName: string;
    logoUrl?: string;
}

interface SendProductUpdateParams {
    product: Product;
    user: User;
    fromEmail: string;
    appName: string;
    logoUrl?: string;
}

interface SendOrderStatusUpdateParams {
    order: Order;
    status: OrderStatus;
    fromEmail: string;
    appName: string;
    logoUrl?: string;
}

const isFreeEmailProvider = (email: string): boolean => {
  const freeProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com'];
  const domain = email.split('@')[1];
  return freeProviders.includes(domain);
}

export const sendOrderConfirmationEmail = async ({ order, toEmail, fromEmail, appName, logoUrl }: SendOrderConfirmationEmailParams) => {
    if (!process.env.RESEND_API_KEY) {
        const errorMessage = 'Email service is not configured: RESEND_API_KEY is missing.';
        console.error(`sendOrderConfirmationEmail Error: ${errorMessage}`);
        return { data: null, error: new Error(errorMessage) };
    }

    if (isFreeEmailProvider(fromEmail)) {
        const errorMessage = 'Cannot send email using a free email provider. Please configure a custom domain with your email service.';
        console.error(`sendOrderConfirmationEmail Error: ${errorMessage}`);
        return { data: null, error: new Error(errorMessage) };
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.send({
            from: `${appName} <${fromEmail}>`,
            to: [toEmail],
            subject: `Your ${appName} Order Confirmation #${order.id}`,
            react: OrderConfirmationEmail({ order, appName, logoUrl }),
        });

        if (error) {
            console.error('Resend API Error (Order Confirmation):', error);
            // Ensure the error object has a message property
            return { data: null, error: new Error(error.message || 'Resend API returned an error.') };
        }

        return { data, error: null };

    } catch (e: any) {
        console.error('Failed to send order confirmation email:', e);
        // Ensure the error object has a message property
        return { data: null, error: new Error(e.message || 'An unexpected error occurred.') };
    }
};

export const sendProductUpdateEmail = async ({ product, user, fromEmail, appName, logoUrl }: SendProductUpdateParams) => {
    if (!process.env.RESEND_API_KEY) {
        const errorMessage = 'Email service is not configured: RESEND_API_KEY is missing.';
        console.error(`sendProductUpdateEmail Error: ${errorMessage}`);
        return { data: null, error: new Error(errorMessage) };
    }
    
    if (!user.email) {
        const errorMessage = 'User has no email address.';
        console.error(`sendProductUpdateEmail Error: ${errorMessage}`);
        return { data: null, error: new Error(errorMessage) };
    }

    if (isFreeEmailProvider(fromEmail)) {
        const errorMessage = 'Cannot send email using a free email provider. Please configure a custom domain with your email service.';
        console.error(`sendProductUpdateEmail Error: ${errorMessage}`);
        return { data: null, error: new Error(errorMessage) };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.send({
            from: `${appName} <${fromEmail}>`,
            to: [user.email],
            subject: `An item on your wishlist has been updated!`,
            react: ProductUpdateEmail({ product, userDisplayName: user.displayName, appName, logoUrl }),
        });

        if (error) {
            console.error('Resend API Error (Product Update):', error);
            return { data: null, error: new Error(error.message || 'Resend API returned an error.') };
        }

        return { data, error: null };

    } catch (e: any) {
        console.error('Failed to send product update email:', e);
        return { data: null, error: new Error(e.message || 'An unexpected error occurred.') };
    }
};

export const sendOrderStatusUpdateEmail = async ({ order, status, fromEmail, appName, logoUrl }: SendOrderStatusUpdateParams) => {
    if (!process.env.RESEND_API_KEY) {
        const errorMessage = 'Email service is not configured: RESEND_API_KEY is missing.';
        console.error(`sendOrderStatusUpdateEmail Error: ${errorMessage}`);
        return { data: null, error: new Error(errorMessage) };
    }

    if (isFreeEmailProvider(fromEmail)) {
        const errorMessage = 'Cannot send email using a free email provider. Please configure a custom domain with your email service.';
        console.error(`sendOrderStatusUpdateEmail Error: ${errorMessage}`);
        return { data: null, error: new Error(errorMessage) };
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.send({
            from: `${appName} <${fromEmail}>`,
            to: [order.shippingAddress.email],
            subject: `Your ${appName} order #${order.id} has been updated to: ${status}`,
            react: OrderStatusUpdateEmail({ order, status, appName, logoUrl }),
        });

        if (error) {
            console.error('Resend API Error (Order Status Update):', error);
            return { data: null, error: new Error(error.message || 'Resend API returned an error.') };
        }

        return { data, error: null };

    } catch (e: any) {
        console.error('Failed to send order status update email:', e);
        return { data: null, error: new Error(e.message || 'An unexpected error occurred.') };
    }
};
