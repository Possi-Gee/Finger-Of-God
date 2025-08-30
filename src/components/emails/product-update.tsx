
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
  Column,
  Row,
} from '@react-email/components';
import * as React from 'react';
import type { Product } from '@/lib/products';

interface ProductUpdateEmailProps {
  product: Product;
  userDisplayName?: string | null;
  appName?: string;
  logoUrl?: string;
}

export const ProductUpdateEmail = ({ 
  product, 
  userDisplayName, 
  appName = 'ShopWave', 
  logoUrl 
}: ProductUpdateEmailProps) => (
  <Html>
    <Head />
    <Preview>An item on your wishlist has been updated!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
            {logoUrl ? <Img src={logoUrl} width="120" height="auto" alt={appName} /> : <Heading style={heading}>{appName}</Heading>}
        </Section>
        <Heading style={heading}>An Item On Your Wishlist Was Updated!</Heading>
        <Text style={paragraph}>
          Hi {userDisplayName || 'there'}, just letting you know that a product you're interested in, <strong>{product.name}</strong>, has been recently updated.
        </Text>
        <Section style={{ padding: '0 48px' }}>
             <Row>
                <Column>
                    <Img src={(product.images && product.images.length > 0) ? product.images[0] : ''} alt={product.name} width="120" height="120" style={productImage} />
                </Column>
                <Column style={productDetails}>
                    <Text style={productName}>{product.name}</Text>
                    <Text style={productDescription}>{product.description}</Text>
                </Column>
            </Row>
        </Section>
        <Section>
          <Link
            style={button}
            href={`/product/${product.id}`}
          >
            Check it out
          </Link>
        </Section>
        <Hr style={hr} />
        <Section style={footer}>
          <Text style={footerText}>
            You are receiving this email because this item is on your wishlist. 
            If you no longer wish to receive these updates, you can remove the item from your wishlist.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ProductUpdateEmail;

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

const productImage = {
    borderRadius: '8px',
}

const productDetails = {
    paddingLeft: '20px',
}

const productName = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a1a1a',
     margin: '0 0 8px 0',
}

const productDescription = {
    fontSize: '14px',
    color: '#525f7f',
    margin: 0,
    lineHeight: '1.5',
}


const footer = {
  padding: '0 48px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};
