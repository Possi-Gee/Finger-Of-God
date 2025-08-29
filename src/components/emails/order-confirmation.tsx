
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
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';
import type { Order } from '@/context/order-context';

interface OrderConfirmationEmailProps {
  order: Order;
  appName?: string;
  logoUrl?: string;
}

export const OrderConfirmationEmail = ({ order, appName = 'ShopWave', logoUrl }: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your {appName} Order Confirmation #{order.id}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
            {logoUrl ? <Img src={logoUrl} width="120" height="auto" alt={appName} /> : <Heading style={heading}>{appName}</Heading>}
        </Section>
        <Heading style={heading}>Thanks for your order!</Heading>
        <Text style={paragraph}>
          Hi {order.shippingAddress.fullName}, we're getting your order ready. We'll notify you
          once it has shipped.
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
        <Heading as="h2" style={subheading}>Order Details</Heading>
        <Text style={paragraph}>
          <strong>Order ID:</strong> #{order.id}
        </Text>
        <Text style={paragraph}>
          <strong>Order Date:</strong> {new Date(order.date).toLocaleDateString()}
        </Text>
        <Hr style={hr} />
        {order.items.map((item) => (
          <Row key={item.id} style={itemRow}>
            <Column>
              <Img src={item.image} width="64" height="64" alt={item.name} style={itemImage} />
            </Column>
            <Column style={itemDetails}>
              <Text style={itemName}>{item.name} ({item.variant.name})</Text>
              <Text style={itemMeta}>Qty: {item.quantity}</Text>
            </Column>
            <Column style={itemPrice}>GH₵{(item.variant.price * item.quantity).toFixed(2)}</Column>
          </Row>
        ))}
        <Hr style={hr} />
        <Section style={totalsSection}>
          <Row>
            <Column style={totalsLabel}>Subtotal</Column>
            <Column style={totalsValue}>GH₵{order.subtotal.toFixed(2)}</Column>
          </Row>
          <Row>
            <Column style={totalsLabel}>Shipping</Column>
            <Column style={totalsValue}>GH₵{order.shippingFee.toFixed(2)}</Column>
          </Row>
          <Row>
            <Column style={totalsLabel}>Tax</Column>
            <Column style={totalsValue}>GH₵{order.tax.toFixed(2)}</Column>
          </Row>
          <Hr style={hr} />
          <Row>
            <Column style={totalsLabel}><strong>Total</strong></Column>
            <Column style={totalsValue}><strong>GH₵{order.total.toFixed(2)}</strong></Column>
          </Row>
        </Section>
        <Hr style={hr} />
        <Section style={footer}>
          <Text style={footerText}>
            If you have any questions, please contact us at support@example.com.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default OrderConfirmationEmail;

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

const subheading = {
    color: '#1a1a1a',
    fontSize: '20px',
    fontWeight: 'bold',
    padding: '0 48px',
}

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

const itemRow = {
    padding: '0 48px',
}

const itemImage = {
    borderRadius: '4px',
}

const itemDetails = {
    paddingLeft: '16px',
}

const itemName = {
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#1a1a1a',
    margin: '0 0 4px 0',
}

const itemMeta = {
    fontSize: '14px',
    color: '#525f7f',
    margin: 0,
}

const itemPrice = {
    textAlign: 'right' as const,
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#1a1a1a',
}

const totalsSection = {
  padding: '0 48px',
};

const totalsLabel = {
  fontSize: '16px',
  color: '#525f7f',
};

const totalsValue = {
  fontSize: '16px',
  color: '#1a1a1a',
  textAlign: 'right' as const,
};

const footer = {
  padding: '0 48px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};
