// =============================================
// Email Logo URL Helper
// Returns the correct logo URL based on environment
// =============================================

/**
 * Get the logo URL for email templates
 * Uses production URL to ensure logo displays in emails
 */
export function getEmailLogoUrl(): string {
  // Always use production URL for emails
  // Email clients can't access localhost, and base64 encoding makes emails too large
  const productionUrl = 'https://theapexway.net';

  // For development, you can temporarily use a public image hosting service
  // like Imgur, Cloudinary, or upload to your domain
  const logoUrl = `${productionUrl}/apex-logo-email.png`;

  return logoUrl;
}
