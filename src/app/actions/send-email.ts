'use server';

// This file is no longer used by the checkout page but is kept for reference
// or potential future use with a different email provider.
// The primary email logic is now handled by the Firebase Function in /functions/index.js

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

const handleResendError = (e: any, context: string): { data: null, error: Error } => {
    console.error(`Failed to send ${context} email:`, e);
    let errorMessage = `An unexpected error occurred while sending the ${context} email.`;
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'object' && e !== null && 'message' in e) {
        errorMessage = (e as { message: string }).message;
    }
    return { data: null, error: new Error(errorMessage) };
}


export const sendOrderConfirmationEmail = async ({ order, toEmail, fromEmail, appName, logoUrl }: SendOrderConfirmationEmailParams) => {
    const CONTEXT = 'Order Confirmation';
    if (!process.env.RESEND_API_KEY) {
        return handleResendError(new Error('Email service is not configured: RESEND_API_KEY is missing.'), CONTEXT);
    }
    
    if (fromEmail.toLowerCase() !== 'onboarding@resend.dev' && isFreeEmailProvider(fromEmail)) {
        return handleResendError(new Error('Cannot send email using a free email provider. Please configure a custom domain with your email service.'), CONTEXT);
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
            return handleResendError(error, CONTEXT);
        }

        return { data, error: null };

    } catch (e: any) {
        return handleResendError(e, CONTEXT);
    }
};

export const sendProductUpdateEmail = async ({ product, user, fromEmail, appName, logoUrl }: SendProductUpdateParams) => {
    const CONTEXT = 'Product Update';
    if (!process.env.RESEND_API_KEY) {
        return handleResendError(new Error('Email service is not configured: RESEND_API_KEY is missing.'), CONTEXT);
    }
    
    if (!user.email) {
        return handleResendError(new Error('User has no email address.'), CONTEXT);
    }

    if (fromEmail.toLowerCase() !== 'onboarding@resend.dev' && isFreeEmailProvider(fromEmail)) {
        return handleResendError(new Error('Cannot send email using a free email provider. Please configure a custom domain with your email service.'), CONTEXT);
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
            return handleResendError(error, CONTEXT);
        }

        return { data, error: null };

    } catch (e: any) {
        return handleResendError(e, CONTEXT);
    }
};

export const sendOrderStatusUpdateEmail = async ({ order, status, fromEmail, appName, logoUrl }: SendOrderStatusUpdateParams) => {
    const CONTEXT = 'Order Status Update';
    if (!process.env.RESEND_API_KEY) {
        return handleResendError(new Error('Email service is not configured: RESEND_API_KEY is missing.'), CONTEXT);
    }
    
    if (fromEmail.toLowerCase() !== 'onboarding@resend.dev' && isFreeEmailProvider(fromEmail)) {
        return handleResendError(new Error('Cannot send email using a free email provider. Please configure a custom domain with your email service.'), CONTEXT);
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
            return handleResendError(error, CONTEXT);
        }

        return { data, error: null };

    } catch (e: any) {
        return handleResendError(e, CONTEXT);
    }
};

    