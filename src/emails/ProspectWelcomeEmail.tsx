import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ProspectWelcomeEmailProps {
  firstName: string;
  lastName: string;
}

export default function ProspectWelcomeEmail({
  firstName = 'New',
  lastName = 'Member',
}: ProspectWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the Apex Affinity Group Family!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo and Blue Background */}
          <Section style={header}>
            <Img
              src="https://reachtheapex.net/apex-logo-white.png"
              alt="Apex Affinity Group"
              style={logo}
            />
            <Heading style={headerTitle}>Welcome to the Apex Family!</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Thank You Message */}
            <Heading style={h2}>Thank You for Registering!</Heading>

            <Text style={paragraph}>
              Dear {firstName} {lastName},
            </Text>

            <Text style={paragraph}>
              We're thrilled to have you join the Apex Affinity Group family. You've taken the first step toward building a successful career in the insurance industry with unlimited earning potential.
            </Text>

            {/* Divider */}
            <div style={divider} />

            {/* What's Next Section */}
            <Heading style={h3}>What Happens Next?</Heading>

            {/* Step 1 */}
            <Section style={stepSection}>
              <div style={stepNumber}>1</div>
              <div style={stepContent}>
                <Heading style={stepTitle}>Back Office Access (Within 48 Hours)</Heading>
                <Text style={stepText}>
                  You will receive an email with your <strong>username and password</strong> to access your Apex Affinity Group Back Office. This is your personal dashboard where you'll manage your business, track commissions, and access all your tools.
                </Text>
              </div>
            </Section>

            {/* Step 2 */}
            <Section style={stepSection}>
              <div style={stepNumber}>2</div>
              <div style={stepContent}>
                <Heading style={stepTitle}>Next Week's Training</Heading>
                <Text style={stepText}>
                  Join us for a <strong>detailed breakdown and presentation of our compensation plan</strong>. You'll learn exactly how you earn money, how the 5x7 matrix works, and how to maximize your income potential. Training details will be sent to your email.
                </Text>
              </div>
            </Section>

            {/* Divider */}
            <div style={divider} />

            {/* Call to Action Box */}
            <Section style={ctaBox}>
              <Heading style={ctaTitle}>💡 In the Meantime...</Heading>
              <Text style={ctaText}>
                Start thinking about your goals and who you'd like to share this opportunity with. Success in this business comes from helping others succeed!
              </Text>
            </Section>

            {/* Questions Section */}
            <Text style={paragraph}>
              Have questions? We're here to help! Reply to this email or contact us at:
            </Text>

            <Text style={contactInfo}>
              <strong>📧 Email:</strong>{' '}
              <Link href="mailto:support@reachtheapex.net" style={link}>
                support@reachtheapex.net
              </Link>
              <br />
              <strong>📞 Phone:</strong>{' '}
              <Link href="tel:281-600-4000" style={link}>
                281-600-4000
              </Link>
            </Text>

            {/* Closing */}
            <Text style={paragraph}>Welcome aboard!</Text>
            <Text style={{ ...paragraph, fontWeight: 'bold' }}>
              The Apex Affinity Group Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you registered at Apex Affinity Group.
            </Text>
            <Text style={footerText}>© 2026 Apex Affinity Group. All rights reserved.</Text>
            <Text style={footerLinks}>
              <Link href="https://reachtheapex.net" style={footerLink}>
                Visit Website
              </Link>
              {' | '}
              <Link href="https://reachtheapex.net/apex-vision" style={footerLink}>
                Our Vision
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: 'Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  margin: '40px auto',
  maxWidth: '600px',
};

const header = {
  background: 'linear-gradient(135deg, #2B4C7E 0%, #1e3557 100%)',
  padding: '40px 30px',
  textAlign: 'center' as const,
};

const logo = {
  height: '80px',
  width: 'auto',
  margin: '0 auto 20px',
};

const headerTitle = {
  color: '#ffffff',
  margin: '0',
  fontSize: '28px',
  fontWeight: 'bold',
};

const content = {
  padding: '40px 30px',
};

const h2 = {
  color: '#2B4C7E',
  fontSize: '24px',
  margin: '0 0 20px 0',
};

const h3 = {
  color: '#2B4C7E',
  fontSize: '20px',
  margin: '0 0 15px 0',
};

const paragraph = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
};

const divider = {
  height: '1px',
  backgroundColor: '#e5e5e5',
  margin: '30px 0',
};

const stepSection = {
  display: 'flex',
  marginBottom: '20px',
};

const stepNumber = {
  width: '40px',
  height: '40px',
  backgroundColor: '#2B4C7E',
  borderRadius: '50%',
  color: '#ffffff',
  fontWeight: 'bold',
  fontSize: '18px',
  textAlign: 'center' as const,
  lineHeight: '40px',
  marginRight: '15px',
  flexShrink: 0,
};

const stepContent = {
  flex: 1,
};

const stepTitle = {
  color: '#2B4C7E',
  fontSize: '18px',
  margin: '0 0 8px 0',
};

const stepText = {
  color: '#555555',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
};

const ctaBox = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #2B4C7E',
  padding: '20px',
  margin: '20px 0',
};

const ctaTitle = {
  color: '#2B4C7E',
  fontSize: '18px',
  margin: '0 0 10px 0',
};

const ctaText = {
  color: '#555555',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
};

const contactInfo = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.8',
  margin: '0 0 30px 0',
};

const link = {
  color: '#2B4C7E',
  textDecoration: 'none',
};

const footer = {
  backgroundColor: '#f8f9fa',
  padding: '30px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e5e5',
};

const footerText = {
  color: '#777777',
  fontSize: '14px',
  margin: '0 0 10px 0',
};

const footerLinks = {
  margin: '15px 0 0 0',
};

const footerLink = {
  color: '#2B4C7E',
  textDecoration: 'none',
  fontSize: '14px',
  margin: '0 10px',
};
