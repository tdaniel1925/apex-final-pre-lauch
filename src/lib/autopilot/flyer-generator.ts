// =============================================
// Apex Lead Autopilot - Flyer Generator
// Helper functions for generating event flyers
// =============================================

import { getFlyerTemplateById, type FlyerTemplate } from './flyer-templates';

export interface FlyerData {
  flyer_title: string;
  event_date?: string;
  event_time?: string;
  event_location?: string;
  event_address?: string;
  event_description?: string;
  custom_text?: string;
  custom_colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  custom_logo_url?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_website?: string;
}

export interface GeneratedFlyer {
  imageUrl: string;
  pdfUrl?: string;
}

/**
 * Validate flyer data before generation
 */
export function validateFlyerData(data: Partial<FlyerData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.flyer_title || data.flyer_title.trim().length < 3) {
    errors.push('Flyer title must be at least 3 characters');
  }

  // Optional but validate if present
  if (data.event_date) {
    const date = new Date(data.event_date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid event date');
    }
  }

  // Validate custom colors if provided
  if (data.custom_colors) {
    const validateHex = (color: string | undefined, name: string) => {
      if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
        errors.push(`Invalid hex color for ${name}`);
      }
    };

    validateHex(data.custom_colors.primary, 'primary color');
    validateHex(data.custom_colors.secondary, 'secondary color');
    validateHex(data.custom_colors.accent, 'accent color');
  }

  // Validate contact info if provided
  if (data.contact_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.contact_email)) {
      errors.push('Invalid contact email');
    }
  }

  if (data.contact_phone) {
    // Basic phone validation (allows various formats)
    const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
    if (!phoneRegex.test(data.contact_phone)) {
      errors.push('Invalid contact phone number');
    }
  }

  if (data.contact_website) {
    try {
      new URL(data.contact_website);
    } catch {
      errors.push('Invalid contact website URL');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Apply user data to template (merge template with custom data)
 */
export function applyTemplateStyles(template: FlyerTemplate, data: FlyerData): FlyerTemplate {
  const customized = { ...template };

  // Apply custom colors if supported and provided
  if (template.supportsCustomColors && data.custom_colors) {
    customized.colors = {
      ...template.colors,
      ...data.custom_colors,
    };
  }

  return customized;
}

/**
 * Generate flyer image
 *
 * For MVP: This creates a placeholder/mock flyer.
 * In production, you would:
 * 1. Use Canvas API to generate the actual image
 * 2. Or integrate with image generation service (Cloudinary, Replicate, etc.)
 * 3. Or use a headless browser (Puppeteer) to render HTML template as image
 */
export async function generateFlyerImage(
  templateId: string,
  data: FlyerData
): Promise<GeneratedFlyer> {
  const template = getFlyerTemplateById(templateId);

  if (!template) {
    throw new Error('Template not found');
  }

  // Validate data
  const validation = validateFlyerData(data);
  if (!validation.valid) {
    throw new Error(`Invalid flyer data: ${validation.errors.join(', ')}`);
  }

  // Apply customizations to template
  const customizedTemplate = applyTemplateStyles(template, data);

  // TODO: Actual image generation
  // For now, return a placeholder URL
  // In production, you would:
  // 1. Create canvas with template dimensions (e.g., 1080x1920 for social media)
  // 2. Apply background color
  // 3. Add text layers (title, date, location, etc.) with proper fonts and colors
  // 4. Add logo if provided
  // 5. Add decorative elements based on template
  // 6. Export as PNG/JPG
  // 7. Upload to storage (Supabase Storage, S3, etc.)
  // 8. Return public URL

  console.log('[Flyer Generator] Generating flyer:', {
    templateId,
    templateName: template.name,
    title: data.flyer_title,
    hasCustomColors: !!data.custom_colors,
    hasCustomLogo: !!data.custom_logo_url,
  });

  // Simulate generation time
  await new Promise(resolve => setTimeout(resolve, 1000));

  // For MVP: Return a placeholder image URL
  // You can replace this with actual generation later
  const mockImageUrl = generateMockFlyerDataUrl(customizedTemplate, data);

  return {
    imageUrl: mockImageUrl,
    // pdfUrl: 'https://example.com/flyers/mock.pdf', // Optional PDF version
  };
}

/**
 * Generate a mock flyer data URL (SVG-based placeholder)
 * This creates a simple SVG with the flyer content for demonstration
 */
function generateMockFlyerDataUrl(template: FlyerTemplate, data: FlyerData): string {
  const width = 1080;
  const height = 1920;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="${template.colors.background}"/>

      <!-- Header bar -->
      <rect width="${width}" height="200" fill="${template.colors.primary}"/>

      <!-- Title -->
      <text x="540" y="130" font-family="${template.fonts.heading}" font-size="64" font-weight="bold" fill="${template.colors.background}" text-anchor="middle">
        ${escapeXml(data.flyer_title)}
      </text>

      <!-- Date/Time (if provided) -->
      ${data.event_date ? `
      <text x="540" y="350" font-family="${template.fonts.subheading}" font-size="48" fill="${template.colors.primary}" text-anchor="middle">
        ${escapeXml(formatEventDate(data.event_date))}
      </text>
      ` : ''}

      ${data.event_time ? `
      <text x="540" y="420" font-family="${template.fonts.subheading}" font-size="40" fill="${template.colors.secondary}" text-anchor="middle">
        ${escapeXml(data.event_time)}
      </text>
      ` : ''}

      <!-- Location (if provided) -->
      ${data.event_location ? `
      <text x="540" y="560" font-family="${template.fonts.body}" font-size="36" fill="${template.colors.text}" text-anchor="middle">
        📍 ${escapeXml(data.event_location)}
      </text>
      ` : ''}

      ${data.event_address ? `
      <text x="540" y="620" font-family="${template.fonts.body}" font-size="30" fill="${template.colors.text}" text-anchor="middle">
        ${escapeXml(data.event_address)}
      </text>
      ` : ''}

      <!-- Description (if provided) -->
      ${data.event_description ? `
      <text x="540" y="800" font-family="${template.fonts.body}" font-size="32" fill="${template.colors.text}" text-anchor="middle">
        ${wrapText(escapeXml(data.event_description), 35).map((line, i) =>
          `<tspan x="540" dy="${i === 0 ? 0 : 40}">${line}</tspan>`
        ).join('')}
      </text>
      ` : ''}

      <!-- Custom text (if provided) -->
      ${data.custom_text ? `
      <text x="540" y="1100" font-family="${template.fonts.body}" font-size="28" fill="${template.colors.secondary}" text-anchor="middle">
        ${wrapText(escapeXml(data.custom_text), 40).map((line, i) =>
          `<tspan x="540" dy="${i === 0 ? 0 : 36}">${line}</tspan>`
        ).join('')}
      </text>
      ` : ''}

      <!-- Contact info -->
      <rect y="${height - 300}" width="${width}" height="300" fill="${template.colors.primary}" opacity="0.9"/>

      ${data.contact_name ? `
      <text x="540" y="${height - 230}" font-family="${template.fonts.body}" font-size="36" font-weight="bold" fill="${template.colors.background}" text-anchor="middle">
        ${escapeXml(data.contact_name)}
      </text>
      ` : ''}

      ${data.contact_phone ? `
      <text x="540" y="${height - 180}" font-family="${template.fonts.body}" font-size="30" fill="${template.colors.background}" text-anchor="middle">
        📞 ${escapeXml(data.contact_phone)}
      </text>
      ` : ''}

      ${data.contact_email ? `
      <text x="540" y="${height - 130}" font-family="${template.fonts.body}" font-size="28" fill="${template.colors.background}" text-anchor="middle">
        ✉️ ${escapeXml(data.contact_email)}
      </text>
      ` : ''}

      ${data.contact_website ? `
      <text x="540" y="${height - 80}" font-family="${template.fonts.body}" font-size="28" fill="${template.colors.background}" text-anchor="middle">
        🌐 ${escapeXml(data.contact_website)}
      </text>
      ` : ''}

      <!-- Template watermark -->
      <text x="540" y="${height - 30}" font-family="${template.fonts.body}" font-size="20" fill="${template.colors.background}" text-anchor="middle" opacity="0.7">
        ${template.name} Template • Apex Lead Autopilot
      </text>
    </svg>
  `;

  // Convert SVG to data URL
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Wrap text to fit within a certain character length
 */
function wrapText(text: string, maxLength: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).length > maxLength) {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Format event date for display
 */
function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Convert flyer to PDF (placeholder)
 * TODO: Implement PDF generation
 */
export async function convertFlyerToPDF(imageUrl: string): Promise<string> {
  console.log('[Flyer Generator] Converting flyer to PDF:', imageUrl);

  // In production, you would:
  // 1. Use a PDF library (jsPDF, PDFKit, etc.)
  // 2. Or use a service like CloudConvert
  // 3. Or use Puppeteer to print the flyer HTML as PDF

  // For now, return the same image URL
  return imageUrl;
}

/**
 * Upload flyer to storage
 * TODO: Implement actual upload to Supabase Storage or S3
 */
export async function uploadFlyerToStorage(
  dataUrl: string,
  flyerId: string,
  distributorId: string
): Promise<string> {
  console.log('[Flyer Generator] Uploading flyer to storage:', flyerId);

  // In production, you would:
  // 1. Convert data URL to Blob
  // 2. Upload to Supabase Storage: supabase.storage.from('flyers').upload()
  // 3. Get public URL
  // 4. Return URL

  // For now, return the data URL directly
  return dataUrl;
}
