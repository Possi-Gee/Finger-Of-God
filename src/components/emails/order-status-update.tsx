
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import type { Order, OrderStatus } from '@/context/order-context';

interface OrderStatusUpdateEmailProps {
  order: Order;
  status: OrderStatus;
  appName?: string;
  logoUrl?: string;
}

const getStatusInfo = (status: OrderStatus) => {
    switch(status) {
        case 'Shipped':
            return {
                title: 'Your order has shipped!',
                message: "Great news! Your order is on its way. You can track its progress using the link below."
            };
        case 'Delivered':
            return {
                title: 'Your order has been delivered!',
                message: "Your order has arrived. We hope you enjoy your items! Thank you for shopping with us."
            };
        case 'Cancelled':
            return {
                title: 'Your order has been cancelled.',
                message: "Your order has been cancelled as requested. If you have any questions, please contact support."
            };
        case 'Pending':
        default:
             return {
                title: 'Your order status has been updated.',
                message: "Your order is currently pending. We'll notify you as soon as it's processed and shipped."
            };
    }
}


export const OrderStatusUpdateEmail = ({ order, status, appName = 'ShopWave', logoUrl }: OrderStatusUpdateEmailProps) => {
    const { title, message } = getStatusInfo(status);

    return (
      <Html>
        <Head />
        <Preview>Your {appName} order status has been updated to: {status}</Preview>
        <Body style={main}>
        <Container style={container}>
            <Section style={header}>
                {logoUrl ? <Img src={logoUrl} width="120" height="auto" alt={appName} /> : <Heading style={heading}>{appName}</Heading>}
            </Section>
            <Heading style={heading}>{title}</Heading>
            <Text style={paragraph}>
            Hi {order.shippingAddress.fullName},
            </Text>
            <Text style={paragraph}>
            {message}
            </Text>
            <Section>
            <Link
                style={button}
                href={`/orders/${order.id}`}
            >
                View Your Order
            </Link>
            </Section>
            <Hr style={hr} />
            <Text style={paragraph}>
            <strong>Order ID:</strong> #{order.id}<br />
            <strong>New Status:</strong> {status}
            </Text>
            <Hr style={hr} />
            <Section style={footer}>
            <Text style={footerText}>
                If you have any questions, please contact us at support@example.com.
            </Text>
            </Section>
        </Container>
        </Body>
    </Html>
    )
};

export default OrderStatusUpdateEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  border: '1px solid #e6ebf1',
  borderRadius: '8px',
};

const header = {
    padding: '0 48px',
}

const heading = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  padding: '0 48px',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '0 48px',
};

const button = {
  backgroundColor: '#1976d2',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '12px',
  margin: '16px auto',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  padding: '0 48px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};
