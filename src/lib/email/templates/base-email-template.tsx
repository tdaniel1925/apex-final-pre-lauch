// =============================================
// Base Email Template
// Standard template for ALL Apex emails
// =============================================

import React from 'react';

interface BaseEmailTemplateProps {
  children: React.ReactNode;
  previewText?: string;
}

/**
 * Base email template with Apex branding
 * Includes:
 * - Apex logo header
 * - Content area
 * - Footer with company info
 * - Unsubscribe links (spam compliance)
 */
export function BaseEmailTemplate({ children, previewText }: BaseEmailTemplateProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        {previewText && (
          <div
            style={{
              display: 'none',
              maxHeight: 0,
              overflow: 'hidden',
              fontSize: 1,
              lineHeight: 1,
              color: '#ffffff',
            }}
          >
            {previewText}
          </div>
        )}
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          backgroundColor: '#f5f5f5',
        }}
      >
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f5f5f5', padding: '40px 20px' }}>
          <tr>
            <td align="center">
              <table
                width="600"
                cellPadding="0"
                cellSpacing="0"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
              >
                {/* Header with Apex logo */}
                <tr>
                  <td
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '30px 30px 20px 30px',
                      textAlign: 'center',
                      borderBottom: '3px solid #2c5aa0',
                    }}
                  >
                    <img
                      src="https://theapexway.net/apex-logo-full.png"
                      alt="Apex Affinity Group"
                      style={{
                        maxWidth: '300px',
                        height: 'auto',
                        margin: '0 auto',
                        display: 'block',
                      }}
                    />
                  </td>
                </tr>

                {/* Main content */}
                <tr>
                  <td style={{ padding: '40px 30px' }}>{children}</td>
                </tr>

                {/* Footer */}
                <tr>
                  <td
                    style={{
                      backgroundColor: '#f9fafb',
                      padding: '30px 30px 20px 30px',
                      textAlign: 'center',
                      borderTop: '1px solid #e5e7eb',
                    }}
                  >
                    <p
                      style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        lineHeight: 1.6,
                        margin: '0 0 8px 0',
                      }}
                    >
                      <strong>Apex Affinity Group</strong>
                    </p>
                    <p
                      style={{
                        color: '#9ca3af',
                        fontSize: '12px',
                        lineHeight: 1.6,
                        margin: '0 0 16px 0',
                      }}
                    >
                      AI-Powered Lead Autopilot | theapexway.net
                    </p>
                    <p
                      style={{
                        color: '#9ca3af',
                        fontSize: '11px',
                        lineHeight: 1.6,
                        margin: '0 0 8px 0',
                      }}
                    >
                      Apex Affinity Group, theapexway.net
                    </p>
                  </td>
                </tr>

                {/* Unsubscribe section (spam compliance) */}
                <tr>
                  <td
                    style={{
                      backgroundColor: '#f3f4f6',
                      padding: '20px 30px',
                      textAlign: 'center',
                    }}
                  >
                    <p
                      style={{
                        color: '#6b7280',
                        fontSize: '11px',
                        lineHeight: 1.6,
                        margin: '0 0 8px 0',
                      }}
                    >
                      You're receiving this email because you're a valued member of the Apex Affinity Group.
                    </p>
                    <p
                      style={{
                        color: '#9ca3af',
                        fontSize: '11px',
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      <a
                        href="{{unsubscribe_url}}"
                        style={{
                          color: '#6b7280',
                          textDecoration: 'underline',
                        }}
                      >
                        Unsubscribe
                      </a>{' '}
                      |{' '}
                      <a
                        href="https://theapexway.net/privacy"
                        style={{
                          color: '#6b7280',
                          textDecoration: 'underline',
                        }}
                      >
                        Privacy Policy
                      </a>{' '}
                      |{' '}
                      <a
                        href="https://theapexway.net/contact"
                        style={{
                          color: '#6b7280',
                          textDecoration: 'underline',
                        }}
                      >
                        Contact Us
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
