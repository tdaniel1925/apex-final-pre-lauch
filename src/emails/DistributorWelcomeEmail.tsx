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

interface DistributorWelcomeEmailProps {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  sponsorName: string;
  replicatedSiteUrl: string;
}

export default function DistributorWelcomeEmail({
  firstName = 'New',
  lastName = 'Member',
  username = 'username',
  password = 'password123',
  sponsorName = 'Apex Vision',
  replicatedSiteUrl = 'https://reachtheapex.net/username',
}: DistributorWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Apex Affinity Group - Your Account Details Inside</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo and Blue Background */}
          <Section style={header}>
            <Img
              src="https://reachtheapex.net/apex-logo-white.png"
              alt="Apex Affinity Group"
              style={logo}
            />
            <Heading style={headerTitle}>Welcome to Your New Business!</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Welcome Message */}
            <Heading style={h2}>Your Apex Back Office is Ready!</Heading>

            <Text style={paragraph}>
              Dear {firstName} {lastName},
            </Text>

            <Text style={paragraph}>
              Welcome to Apex Affinity Group! We're excited to have you join our professional community under the sponsorship of <strong>{sponsorName}</strong>.
            </Text>

            <Text style={paragraph}>
              Your distributor account has been created and you're ready to start building your business. Below are your login credentials and important information.
            </Text>

            {/* Divider */}
            <div style={divider} />

            {/* Login Credentials Box */}
            <Section style={credentialsBox}>
              <Heading style={credentialsTitle}>🔐 Your Login Credentials</Heading>

              <Section style={credentialRow}>
                <Text style={credentialLabel}>Login URL:</Text>
                <Text style={credentialValue}>
                  <Link href="https://reachtheapex.net/login" style={credentialLink}>
                    https://reachtheapex.net/login
                  </Link>
                </Text>
              </Section>

              <Section style={credentialRow}>
                <Text style={credentialLabel}>Username:</Text>
                <Text style={credentialValue}>{username}</Text>
              </Section>

              <Section style={credentialRow}>
                <Text style={credentialLabel}>Password:</Text>
                <Text style={credentialValue}>{password}</Text>
              </Section>

              <Text style={securityNote}>
                ⚠️ <strong>Important:</strong> Please change your password after your first login for security.
              </Text>
            </Section>

            {/* Divider */}
            <div style={divider} />

            {/* Your Replicated Website */}
            <Section style={websiteBox}>
              <Heading style={h3}>🌐 Your Personal Replicated Website</Heading>
              <Text style={paragraph}>
                You now have your own branded website to share with prospects:
              </Text>
              <Text style={websiteUrl}>
                <Link href={replicatedSiteUrl} style={websiteLink}>
                  {replicatedSiteUrl}
                </Link>
              </Text>
              <Text style={websiteDescription}>
                This website is personalized with your name and tracks all signups from your link. Share it on social media, in emails, or anywhere you connect with potential team members!
              </Text>
            </Section>

            {/* Divider */}
            <div style={divider} />

            {/* Getting Started Steps */}
            <Heading style={h3}>🚀 Getting Started - Your First Steps</Heading>

            {/* Step 1 */}
            <Section style={stepSection}>
              <div style={stepNumber}>1</div>
              <div style={stepContent}>
                <Heading style={stepTitle}>Log In to Your Back Office</Heading>
                <Text style={stepText}>
                  Use the credentials above to access your dashboard. You'll find your replicated website link, commission tracking, and all your business tools.
                </Text>
              </div>
            </Section>

            {/* Step 2 */}
            <Section style={stepSection}>
              <div style={stepNumber}>2</div>
              <div style={stepContent}>
                <Heading style={stepTitle}>Complete Your Profile</Heading>
                <Text style={stepText}>
                  Add your phone number, company name (optional), and any other details to make your account complete. You can also customize your username if you'd like.
                </Text>
              </div>
            </Section>

            {/* Step 3 */}
            <Section style={stepSection}>
              <div style={stepNumber}>3</div>
              <div style={stepContent}>
                <Heading style={stepTitle}>Join the Next Training Call</Heading>
                <Text style={stepText}>
                  Watch for your invite to our weekly training calls where we cover the compensation plan, sales strategies, and answer all your questions live.
                </Text>
              </div>
            </Section>

            {/* Step 4 */}
            <Section style={stepSection}>
              <div style={stepNumber}>4</div>
              <div style={stepContent}>
                <Heading style={stepTitle}>Connect With Your Sponsor</Heading>
                <Text style={stepText}>
                  Reach out to <strong>{sponsorName}</strong> - they're here to mentor you, answer questions, and help you succeed in building your business.
                </Text>
              </div>
            </Section>

            {/* Divider */}
            <div style={divider} />

            {/* Call to Action Box */}
            <Section style={ctaBox}>
              <Heading style={ctaTitle}>💡 You're Licensed and Ready to Go!</Heading>
              <Text style={ctaText}>
                Your status is set to <strong>"Licensed"</strong> which means you have full access to all our products, tools, and compensation plan. Start sharing your replicated website today!
              </Text>
            </Section>

            {/* Support Section */}
            <Text style={paragraph}>
              Questions? We're here to help!
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
            <Text style={paragraph}>
              Welcome to the team - let's reach the apex together!
            </Text>
            <Text style={{ ...paragraph, fontWeight: 'bold' }}>
              The Apex Affinity Group Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you were added as a distributor at Apex Affinity Group.
            </Text>
            <Text style={footerText}>© 2026 Apex Affinity Group. All rights reserved.</Text>
            <Text style={footerLinks}>
              <Link href="https://reachtheapex.net" style={footerLink}>
                Visit Website
              </Link>
              {' | '}
              <Link href="https://reachtheapex.net/login" style={footerLink}>
                Login
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

// Credentials Box
const credentialsBox = {
  backgroundColor: '#f0f5ff',
  border: '2px solid #2B4C7E',
  borderRadius: '8px',
  padding: '24px',
  margin: '20px 0',
};

const credentialsTitle = {
  color: '#2B4C7E',
  fontSize: '20px',
  margin: '0 0 20px 0',
  textAlign: 'center' as const,
};

const credentialRow = {
  marginBottom: '15px',
};

const credentialLabel = {
  color: '#555555',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 5px 0',
};

const credentialValue = {
  color: '#2B4C7E',
  fontSize: '16px',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  margin: '0 0 15px 0',
};

const credentialLink = {
  color: '#2B4C7E',
  textDecoration: 'underline',
};

const securityNote = {
  color: '#d97706',
  fontSize: '14px',
  margin: '15px 0 0 0',
  padding: '12px',
  backgroundColor: '#fef3c7',
  borderRadius: '4px',
};

// Website Box
const websiteBox = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #2B4C7E',
  padding: '20px',
  margin: '20px 0',
};

const websiteUrl = {
  color: '#2B4C7E',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '10px 0',
  wordBreak: 'break-all' as const,
};

const websiteLink = {
  color: '#2B4C7E',
  textDecoration: 'underline',
};

const websiteDescription = {
  color: '#555555',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '10px 0 0 0',
};

// Steps
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

// CTA Box
const ctaBox = {
  backgroundColor: '#dcfce7',
  borderLeft: '4px solid #16a34a',
  padding: '20px',
  margin: '20px 0',
};

const ctaTitle = {
  color: '#15803d',
  fontSize: '18px',
  margin: '0 0 10px 0',
};

const ctaText = {
  color: '#15803d',
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

// Footer
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
