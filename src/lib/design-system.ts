// =============================================
// APEX AFFINITY GROUP DESIGN SYSTEM
// Unified styles for consistent UI across all pages
// NO GRADIENTS - Solid colors only
// =============================================

/**
 * Brand Colors
 * Primary: Deep royal/cobalt blue from logo (#2B4C7E)
 * Accent: Red from logo star (#DC2626)
 */
export const colors = {
  // Primary Brand Color (from logo)
  primary: '#2B4C7E',
  primaryHover: '#1e3555',
  primaryLight: '#3d5a8c',
  primaryLighter: '#e8eef7',

  // Accent (red from logo star)
  accent: '#DC2626',
  accentHover: '#b91c1c',
  accentLight: '#fee2e2',

  // Neutrals
  gray: {
    950: '#0a0a0a',
    900: '#1a1a1a',
    800: '#262626',
    700: '#404040',
    600: '#525252',
    500: '#737373',
    400: '#a3a3a3',
    300: '#d4d4d4',
    200: '#e5e5e5',
    100: '#f5f5f5',
    50: '#fafafa',
  },

  // Semantic Colors
  success: '#16a34a',
  successLight: '#dcfce7',
  warning: '#ea580c',
  warningLight: '#ffedd5',
  error: '#dc2626',
  errorLight: '#fee2e2',
  info: '#0284c7',
  infoLight: '#e0f2fe',
} as const;

/**
 * Typography Classes
 */
export const typography = {
  // Page Titles
  pageTitle: 'text-2xl font-bold text-gray-900 leading-tight',
  pageSubtitle: 'text-sm text-gray-500 mt-1',

  // Section Titles
  sectionTitle: 'text-xl font-semibold text-gray-900 leading-tight',
  sectionSubtitle: 'text-sm text-gray-600',

  // Card Titles
  cardTitle: 'text-base font-semibold text-gray-900',

  // Body Text
  body: 'text-sm text-gray-700',
  bodySmall: 'text-xs text-gray-600',

  // Labels
  label: 'text-xs font-semibold uppercase tracking-wide text-gray-700',

  // Muted Text
  muted: 'text-xs text-gray-500',
} as const;

/**
 * Spacing System
 */
export const spacing = {
  // Page Container
  pageContainer: 'max-w-7xl mx-auto px-4 sm:px-6 py-6',
  pageContainerMobile: 'px-4 py-4',

  // Sections
  sectionGap: 'mb-8',
  subsectionGap: 'mb-6',
  elementGap: 'mb-4',

  // Grids
  gridGap: 'gap-6',
  gridGapMobile: 'gap-4',
} as const;

/**
 * Component Styles
 */
export const components = {
  // Cards
  card: 'bg-white border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow',
  cardCompact: 'bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow',
  cardInteractive: 'bg-white border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-gray-400 transition-all cursor-pointer',

  // Stats Cards
  statsCard: 'bg-white border border-gray-300 rounded-lg p-4',
  statsLabel: 'text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2',
  statsValue: 'text-2xl font-bold text-gray-900',

  // Buttons
  buttonPrimary: 'bg-[#2B4C7E] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#1e3555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  buttonSecondary: 'bg-white text-[#2B4C7E] border-2 border-[#2B4C7E] px-4 py-2 rounded-lg font-semibold hover:bg-[#e8eef7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  buttonDanger: 'bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  buttonGhost: 'bg-transparent text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors',

  // Forms
  input: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed',
  select: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed',
  textarea: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed',
  label: 'block text-sm font-semibold text-gray-700 mb-1',

  // Tables
  table: 'min-w-full divide-y divide-gray-200',
  tableHeader: 'bg-gray-50 border-b-2 border-gray-200',
  tableHeaderCell: 'px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider',
  tableRow: 'border-b border-gray-200 hover:bg-gray-50 transition-colors',
  tableCell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',

  // Badges
  badgeSuccess: 'px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700',
  badgeWarning: 'px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700',
  badgeError: 'px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700',
  badgeInfo: 'px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700',
  badgeNeutral: 'px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700',

  // Headers
  pageHeader: 'bg-[#2B4C7E] text-white',
  pageHeaderContent: 'max-w-7xl mx-auto px-4 sm:px-6 py-8',

  // Empty States
  emptyState: 'text-center py-12',
  emptyStateIcon: 'inline-block p-4 bg-gray-100 rounded-full mb-4',
  emptyStateTitle: 'text-lg font-semibold text-gray-900 mb-2',
  emptyStateText: 'text-sm text-gray-600',

  // Loading States
  skeleton: 'animate-pulse bg-gray-200 rounded',
} as const;

/**
 * Layout Helpers
 */
export const layout = {
  // Stat Grids
  statsGrid: 'grid grid-cols-2 md:grid-cols-4 gap-4',
  statsGridThree: 'grid grid-cols-1 md:grid-cols-3 gap-4',

  // Card Grids
  cardGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  cardGridFour: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',

  // Flex Layouts
  flexBetween: 'flex items-center justify-between',
  flexCenter: 'flex items-center justify-center',
  flexStart: 'flex items-center justify-start',

  // Header with Actions
  pageHeaderLayout: 'mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
} as const;

/**
 * Utility function to combine class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
