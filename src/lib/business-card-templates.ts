// =============================================
// Business Card Template Configurations
// =============================================

export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  layout: {
    namePosition: 'center' | 'top-left' | 'top-center' | 'bottom-left';
    nameAlign: 'left' | 'center' | 'right';
    titlePosition: 'below-name' | 'top-right' | 'bottom-right';
    contactLayout: 'grid' | 'vertical' | 'horizontal';
    logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-background';
  };
  colors: {
    background: string;
    nameColor: string;
    titleColor: string;
    contactColor: string;
    accentColor: string;
  };
  fonts: {
    nameSize: number;
    nameWeight: number;
    titleSize: number;
    contactSize: number;
  };
}

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: 'classic-center',
    name: 'Classic Center',
    description: 'Clean centered design, perfect for any name length',
    preview: '/templates/classic-center.png',
    layout: {
      namePosition: 'center',
      nameAlign: 'center',
      titlePosition: 'below-name',
      contactLayout: 'grid',
      logoPosition: 'top-left',
    },
    colors: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      nameColor: '#2B4C7E',
      titleColor: '#DC143C',
      contactColor: '#2B4C7E',
      accentColor: '#DC143C',
    },
    fonts: {
      nameSize: 20,
      nameWeight: 800,
      titleSize: 11,
      contactSize: 9,
    },
  },
  {
    id: 'modern-left',
    name: 'Modern Left',
    description: 'Left-aligned bold design, great for longer names',
    preview: '/templates/modern-left.png',
    layout: {
      namePosition: 'top-left',
      nameAlign: 'left',
      titlePosition: 'below-name',
      contactLayout: 'vertical',
      logoPosition: 'top-right',
    },
    colors: {
      background: 'linear-gradient(135deg, #2B4C7E 0%, #567EBB 100%)',
      nameColor: '#ffffff',
      titleColor: '#FDE047',
      contactColor: '#ffffff',
      accentColor: '#FDE047',
    },
    fonts: {
      nameSize: 18,
      nameWeight: 700,
      titleSize: 10,
      contactSize: 8,
    },
  },
  {
    id: 'bold-contrast',
    name: 'Bold Contrast',
    description: 'High contrast design that stands out',
    preview: '/templates/bold-contrast.png',
    layout: {
      namePosition: 'center',
      nameAlign: 'center',
      titlePosition: 'below-name',
      contactLayout: 'horizontal',
      logoPosition: 'bottom-right',
    },
    colors: {
      background: '#2B4C7E',
      nameColor: '#ffffff',
      titleColor: '#DC143C',
      contactColor: '#ffffff',
      accentColor: '#DC143C',
    },
    fonts: {
      nameSize: 22,
      nameWeight: 900,
      titleSize: 12,
      contactSize: 9,
    },
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Simple and elegant, contact-first approach',
    preview: '/templates/minimalist.png',
    layout: {
      namePosition: 'top-center',
      nameAlign: 'center',
      titlePosition: 'below-name',
      contactLayout: 'vertical',
      logoPosition: 'bottom-right',
    },
    colors: {
      background: '#ffffff',
      nameColor: '#2B4C7E',
      titleColor: '#DC143C',
      contactColor: '#2B4C7E',
      accentColor: '#DC143C',
    },
    fonts: {
      nameSize: 16,
      nameWeight: 600,
      titleSize: 10,
      contactSize: 10,
    },
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Professional with photo space',
    preview: '/templates/executive.png',
    layout: {
      namePosition: 'top-left',
      nameAlign: 'left',
      titlePosition: 'below-name',
      contactLayout: 'vertical',
      logoPosition: 'top-right',
    },
    colors: {
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
      nameColor: '#2B4C7E',
      titleColor: '#B8860B',
      contactColor: '#2B4C7E',
      accentColor: '#B8860B',
    },
    fonts: {
      nameSize: 18,
      nameWeight: 700,
      titleSize: 11,
      contactSize: 9,
    },
  },
];

export const TITLE_OPTIONS = [
  'Insurance Agent',
  'Senior Insurance Agent',
  'Independent Agent',
  'Team Leader',
  'Insurance Specialist',
  'Financial Advisor',
  'Insurance Professional',
  'Senior Advisor',
  'Account Executive',
  'Branch Manager',
];
