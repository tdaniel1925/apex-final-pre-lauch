// =============================================
// Apex Lead Autopilot - Flyer Templates
// Pre-designed templates for event flyers
// =============================================

export interface FlyerTemplate {
  id: string;
  name: string;
  category: 'professional' | 'community' | 'product' | 'training' | 'webinar';
  description: string;
  previewImageUrl: string;

  // Design specifications
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };

  fonts: {
    heading: string;
    subheading: string;
    body: string;
  };

  // Layout configuration
  layout: {
    titlePosition: 'top' | 'center' | 'bottom';
    logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    contentAlignment: 'left' | 'center' | 'right';
  };

  // Supported customizations
  supportsCustomLogo: boolean;
  supportsCustomColors: boolean;
  supportsMultipleImages: boolean;
}

/**
 * All available flyer templates
 */
export const FLYER_TEMPLATES: FlyerTemplate[] = [
  {
    id: 'professional-event',
    name: 'Professional Event',
    category: 'professional',
    description: 'Clean, corporate design perfect for business meetings and professional events',
    previewImageUrl: '/images/flyer-templates/professional-event-preview.png',
    colors: {
      primary: '#1e40af', // Deep blue
      secondary: '#3b82f6', // Bright blue
      accent: '#60a5fa', // Light blue
      background: '#ffffff',
      text: '#1f2937',
    },
    fonts: {
      heading: 'Inter, sans-serif',
      subheading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
    },
    layout: {
      titlePosition: 'top',
      logoPosition: 'top-left',
      contentAlignment: 'left',
    },
    supportsCustomLogo: true,
    supportsCustomColors: true,
    supportsMultipleImages: false,
  },

  {
    id: 'community-meeting',
    name: 'Community Meeting',
    category: 'community',
    description: 'Warm and inviting design for community gatherings and local events',
    previewImageUrl: '/images/flyer-templates/community-meeting-preview.png',
    colors: {
      primary: '#dc2626', // Warm red
      secondary: '#f97316', // Orange
      accent: '#fbbf24', // Yellow
      background: '#fef3c7', // Cream
      text: '#78350f',
    },
    fonts: {
      heading: 'Poppins, sans-serif',
      subheading: 'Poppins, sans-serif',
      body: 'Open Sans, sans-serif',
    },
    layout: {
      titlePosition: 'center',
      logoPosition: 'top-right',
      contentAlignment: 'center',
    },
    supportsCustomLogo: true,
    supportsCustomColors: true,
    supportsMultipleImages: false,
  },

  {
    id: 'product-launch',
    name: 'Product Launch',
    category: 'product',
    description: 'Bold, modern design for product announcements and launch events',
    previewImageUrl: '/images/flyer-templates/product-launch-preview.png',
    colors: {
      primary: '#7c3aed', // Purple
      secondary: '#a78bfa', // Light purple
      accent: '#ec4899', // Pink
      background: '#1f2937', // Dark gray
      text: '#ffffff',
    },
    fonts: {
      heading: 'Montserrat, sans-serif',
      subheading: 'Montserrat, sans-serif',
      body: 'Roboto, sans-serif',
    },
    layout: {
      titlePosition: 'center',
      logoPosition: 'bottom-right',
      contentAlignment: 'center',
    },
    supportsCustomLogo: true,
    supportsCustomColors: true,
    supportsMultipleImages: true,
  },

  {
    id: 'training-session',
    name: 'Training Session',
    category: 'training',
    description: 'Educational theme perfect for workshops, seminars, and training events',
    previewImageUrl: '/images/flyer-templates/training-session-preview.png',
    colors: {
      primary: '#059669', // Green
      secondary: '#10b981', // Bright green
      accent: '#34d399', // Light green
      background: '#f0fdf4', // Very light green
      text: '#064e3b',
    },
    fonts: {
      heading: 'Lato, sans-serif',
      subheading: 'Lato, sans-serif',
      body: 'Lato, sans-serif',
    },
    layout: {
      titlePosition: 'top',
      logoPosition: 'bottom-left',
      contentAlignment: 'left',
    },
    supportsCustomLogo: true,
    supportsCustomColors: false,
    supportsMultipleImages: false,
  },

  {
    id: 'webinar',
    name: 'Webinar',
    category: 'webinar',
    description: 'Tech-focused design for online events, webinars, and virtual meetings',
    previewImageUrl: '/images/flyer-templates/webinar-preview.png',
    colors: {
      primary: '#0891b2', // Cyan
      secondary: '#06b6d4', // Bright cyan
      accent: '#22d3ee', // Light cyan
      background: '#ecfeff', // Very light cyan
      text: '#164e63',
    },
    fonts: {
      heading: 'Space Grotesk, sans-serif',
      subheading: 'Space Grotesk, sans-serif',
      body: 'Inter, sans-serif',
    },
    layout: {
      titlePosition: 'center',
      logoPosition: 'top-left',
      contentAlignment: 'center',
    },
    supportsCustomLogo: true,
    supportsCustomColors: true,
    supportsMultipleImages: false,
  },
];

/**
 * Get template by ID
 */
export function getFlyerTemplateById(id: string): FlyerTemplate | null {
  return FLYER_TEMPLATES.find(t => t.id === id) || null;
}

/**
 * Get templates by category
 */
export function getFlyerTemplatesByCategory(category: FlyerTemplate['category']): FlyerTemplate[] {
  return FLYER_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get all template categories
 */
export function getFlyerCategories(): Array<{ id: FlyerTemplate['category']; label: string }> {
  return [
    { id: 'professional', label: 'Professional' },
    { id: 'community', label: 'Community' },
    { id: 'product', label: 'Product Launch' },
    { id: 'training', label: 'Training' },
    { id: 'webinar', label: 'Webinar' },
  ];
}

/**
 * Validate template customization options
 */
export function validateTemplateCustomization(
  templateId: string,
  customization: {
    customLogo?: string;
    customColors?: { primary?: string; secondary?: string; accent?: string };
    multipleImages?: string[];
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const template = getFlyerTemplateById(templateId);

  if (!template) {
    errors.push('Template not found');
    return { valid: false, errors };
  }

  // Check custom logo support
  if (customization.customLogo && !template.supportsCustomLogo) {
    errors.push('This template does not support custom logos');
  }

  // Check custom colors support
  if (customization.customColors && !template.supportsCustomColors) {
    errors.push('This template does not support custom colors');
  }

  // Check multiple images support
  if (customization.multipleImages && customization.multipleImages.length > 1 && !template.supportsMultipleImages) {
    errors.push('This template does not support multiple images');
  }

  // Validate color hex codes if provided
  if (customization.customColors) {
    const colorFields = ['primary', 'secondary', 'accent'] as const;
    for (const field of colorFields) {
      const color = customization.customColors[field];
      if (color && !isValidHexColor(color)) {
        errors.push(`Invalid hex color for ${field}: ${color}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate hex color format
 */
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Get template preview data for UI
 */
export function getTemplatePreviewData() {
  return FLYER_TEMPLATES.map(template => ({
    id: template.id,
    name: template.name,
    category: template.category,
    description: template.description,
    previewImageUrl: template.previewImageUrl,
  }));
}
