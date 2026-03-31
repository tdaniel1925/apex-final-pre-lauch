// =============================================
// General Formatting Utilities
// Currency, numbers, dates, etc.
// =============================================

/**
 * Format a number as currency (USD)
 * @param amount - Amount in dollars (not cents)
 * @param options - Formatting options
 * @returns Formatted currency string
 * @example
 * formatCurrency(1234.56) // '$1,234.56'
 * formatCurrency(1234.56, { decimals: 0 }) // '$1,235'
 */
export function formatCurrency(
  amount: number,
  options?: {
    decimals?: number;
    locale?: string;
  }
): string {
  const decimals = options?.decimals ?? 2;
  const locale = options?.locale ?? 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format a number with commas
 * @param num - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 * @example
 * formatNumber(1234.5678) // '1,234.57'
 * formatNumber(1234.5678, 0) // '1,235'
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format a percentage
 * @param value - Decimal value (0.25 = 25%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 * @example
 * formatPercentage(0.2567) // '25.67%'
 * formatPercentage(0.2567, 0) // '26%'
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format cents to dollars
 * @param cents - Amount in cents
 * @returns Dollar amount as number
 * @example
 * centsToDollars(12345) // 123.45
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Format dollars to cents
 * @param dollars - Amount in dollars
 * @returns Cents amount as integer
 * @example
 * dollarsToCents(123.45) // 12345
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Format a date for display
 * @param date - Date to format
 * @param format - Format style ('short', 'medium', 'long')
 * @returns Formatted date string
 * @example
 * formatDate(new Date(), 'short') // '3/31/26'
 * formatDate(new Date(), 'medium') // 'Mar 31, 2026'
 * formatDate(new Date(), 'long') // 'March 31, 2026'
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
    });
  } else if (format === 'medium') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } else {
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
}

/**
 * Format a date and time for display
 * @param date - Date to format
 * @returns Formatted date/time string
 * @example
 * formatDateTime(new Date()) // 'Mar 31, 2026 at 2:45 PM'
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns Relative time string
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)) // '1 hour ago'
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(d, 'medium');
  }
}

/**
 * Truncate a string with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 * @example
 * truncate('Hello World', 8) // 'Hello...'
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Format a file size
 * @param bytes - Size in bytes
 * @returns Formatted file size string
 * @example
 * formatFileSize(1024) // '1.00 KB'
 * formatFileSize(1048576) // '1.00 MB'
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
