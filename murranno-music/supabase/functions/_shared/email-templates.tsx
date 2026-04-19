import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface VerificationEmailProps {
  verificationUrl: string;
  email: string;
}

export const VerificationEmail = ({
  verificationUrl,
  email,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your Murranno Music account</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Murranno Music! 🎵</Heading>
        <Text style={text}>
          Thank you for signing up with {email}. To complete your registration and start your music journey, please verify your email address.
        </Text>
        <Link
          href={verificationUrl}
          target="_blank"
          style={{
            ...link,
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#9b87f5',
            color: '#ffffff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            marginTop: '20px',
            marginBottom: '20px',
          }}
        >
          Verify Email Address
        </Link>
        <Text style={{ ...text, marginTop: '20px' }}>
          Or copy and paste this link in your browser:
        </Text>
        <Text style={code}>{verificationUrl}</Text>
        <Text style={{ ...text, color: '#ababab', marginTop: '20px' }}>
          If you didn't create an account with Murranno Music, you can safely ignore this email.
        </Text>
        <Text style={footer}>
          Murranno Music - Your partner in music distribution and promotion
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1f2e',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  padding: '0',
};

const link = {
  color: '#9b87f5',
  fontSize: '14px',
  textDecoration: 'underline',
};

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const code = {
  display: 'block',
  padding: '16px',
  backgroundColor: '#f4f4f4',
  borderRadius: '5px',
  border: '1px solid #eeeeee',
  color: '#333333',
  fontSize: '14px',
  wordBreak: 'break-all',
  marginTop: '8px',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '20px',
  marginTop: '40px',
  borderTop: '1px solid #eeeeee',
  paddingTop: '20px',
};
