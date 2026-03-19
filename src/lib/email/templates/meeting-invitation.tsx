// =============================================
// Meeting Invitation Email Template
// React Email component for meeting invitations
// =============================================

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface MeetingInvitationEmailProps {
  recipientName: string;
  distributorName: string;
  meetingTitle: string;
  meetingDescription?: string;
  meetingDateTime: string;
  meetingLocation?: string;
  meetingLink?: string;
  yesLink: string;
  noLink: string;
  maybeLink: string;
  trackingPixelUrl: string;
}

export const MeetingInvitationEmail = ({
  recipientName,
  distributorName,
  meetingTitle,
  meetingDescription,
  meetingDateTime,
  meetingLocation,
  meetingLink,
  yesLink,
  noLink,
  maybeLink,
  trackingPixelUrl,
}: MeetingInvitationEmailProps) => {
  const previewText = `${distributorName} invites you to ${meetingTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Apex Branding */}
          <Section style={header}>
            <Img
              src="https://reachtheapex.net/apex-logo.png"
              alt="Apex Affinity Group"
              width="200"
              height="auto"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>You're Invited!</Heading>

            <Text style={text}>
              Hi <strong>{recipientName}</strong>,
            </Text>

            <Text style={text}>
              {distributorName} would like to invite you to an important meeting:
            </Text>

            {/* Meeting Details Card */}
            <Section style={meetingCard}>
              <Heading style={meetingTitleStyle}>{meetingTitle}</Heading>

              {meetingDescription && (
                <Text style={meetingDescriptionStyle}>{meetingDescription}</Text>
              )}

              <Hr style={divider} />

              <table style={{ width: '100%' }}>
                <tr>
                  <td style={labelCell}>
                    <Text style={label}>📅 When:</Text>
                  </td>
                  <td style={valueCell}>
                    <Text style={value}>{meetingDateTime}</Text>
                  </td>
                </tr>

                {meetingLocation && (
                  <tr>
                    <td style={labelCell}>
                      <Text style={label}>📍 Where:</Text>
                    </td>
                    <td style={valueCell}>
                      <Text style={value}>{meetingLocation}</Text>
                    </td>
                  </tr>
                )}

                {meetingLink && (
                  <tr>
                    <td style={labelCell}>
                      <Text style={label}>🔗 Join Link:</Text>
                    </td>
                    <td style={valueCell}>
                      <Text style={value}>
                        <a href={meetingLink} style={link}>
                          {meetingLink}
                        </a>
                      </Text>
                    </td>
                  </tr>
                )}
              </table>
            </Section>

            {/* RSVP Section */}
            <Section style={rsvpSection}>
              <Text style={rsvpText}>Will you be able to attend?</Text>

              <table style={{ width: '100%', margin: '20px 0' }}>
                <tr>
                  <td style={{ textAlign: 'center', padding: '0 5px' }}>
                    <Button href={yesLink} style={yesButton}>
                      ✓ Yes, I'll be there
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center', padding: '10px 5px 0' }}>
                    <Button href={maybeLink} style={maybeButton}>
                      ? Maybe
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center', padding: '10px 5px 0' }}>
                    <Button href={noLink} style={noButton}>
                      ✗ Can't make it
                    </Button>
                  </td>
                </tr>
              </table>
            </Section>

            <Text style={footerText}>
              Looking forward to seeing you there!
              <br />
              <strong>{distributorName}</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerSmall}>
              This invitation was sent by {distributorName} through Apex Affinity Group.
            </Text>
            <Text style={footerSmall}>
              Apex Affinity Group | Building Your Future Together
            </Text>
          </Section>

          {/* Tracking Pixel */}
          <Img
            src={trackingPixelUrl}
            width="1"
            height="1"
            alt=""
            style={{ display: 'block' }}
          />
        </Container>
      </Body>
    </Html>
  );
};

// Default export for testing/preview
export default MeetingInvitationEmail;

// Styles
const main = {
  backgroundColor: '#F0F2F8',
  fontFamily:
    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const header = {
  backgroundColor: '#0A1A3F',
  padding: '40px 24px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
  display: 'block',
};

const content = {
  padding: '40px 32px',
};

const h1 = {
  color: '#0A1A3F',
  fontSize: '32px',
  fontWeight: '700',
  lineHeight: '1.2',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const text = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const meetingCard = {
  backgroundColor: '#F8FAFC',
  border: '2px solid #E2E8F0',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const meetingTitleStyle = {
  color: '#0A1A3F',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 16px',
};

const meetingDescriptionStyle = {
  color: '#475569',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const divider = {
  borderColor: '#E2E8F0',
  margin: '16px 0',
};

const labelCell: React.CSSProperties = {
  paddingRight: '12px',
  verticalAlign: 'top',
  width: '30%',
};

const valueCell: React.CSSProperties = {
  verticalAlign: 'top',
  width: '70%',
};

const label = {
  color: '#64748B',
  fontSize: '14px',
  fontWeight: '600',
  margin: '8px 0',
};

const value = {
  color: '#334155',
  fontSize: '14px',
  margin: '8px 0',
  wordBreak: 'break-word' as const,
};

const link = {
  color: '#D4AF37',
  textDecoration: 'underline',
};

const rsvpSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const rsvpText = {
  color: '#0A1A3F',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const buttonBase = {
  borderRadius: '6px',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  width: '100%',
  maxWidth: '280px',
};

const yesButton = {
  ...buttonBase,
  backgroundColor: '#10B981',
  color: '#ffffff',
};

const maybeButton = {
  ...buttonBase,
  backgroundColor: '#F59E0B',
  color: '#ffffff',
};

const noButton = {
  ...buttonBase,
  backgroundColor: '#EF4444',
  color: '#ffffff',
};

const footerText = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '24px 0 0',
  textAlign: 'center' as const,
};

const footer = {
  backgroundColor: '#F8FAFC',
  borderTop: '1px solid #E2E8F0',
  padding: '24px 32px',
  textAlign: 'center' as const,
};

const footerSmall = {
  color: '#64748B',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '4px 0',
  textAlign: 'center' as const,
};
