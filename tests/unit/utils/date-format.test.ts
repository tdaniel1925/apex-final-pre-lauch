import { describe, it, expect } from 'vitest';
import { formatDate, formatRelativeTime } from '@/lib/utils/date-format';

describe('Date Formatting Utils', () => {
  describe('formatDate', () => {
    it('should format date with time by default', () => {
      const dateString = '2026-04-02T14:30:00Z';
      const result = formatDate(dateString);

      expect(result).toMatch(/Apr/);
      expect(result).toMatch(/2/);
      expect(result).toMatch(/2026/);
      expect(result).toMatch(/PM|AM/);
    });

    it('should format date without time when includeTime is false', () => {
      const dateString = '2026-04-02T14:30:00Z';
      const result = formatDate(dateString, false);

      expect(result).toMatch(/Apr/);
      expect(result).toMatch(/2/);
      expect(result).toMatch(/2026/);
      expect(result).not.toMatch(/:/);
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "just now" for very recent dates', () => {
      const now = new Date();
      const result = formatRelativeTime(now.toISOString());

      expect(result).toBe('just now');
    });

    it('should return minutes for recent dates', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = formatRelativeTime(fiveMinutesAgo.toISOString());

      expect(result).toBe('5 minutes ago');
    });

    it('should return hours for dates within 24 hours', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = formatRelativeTime(twoHoursAgo.toISOString());

      expect(result).toBe('2 hours ago');
    });

    it('should return days for dates within a week', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(threeDaysAgo.toISOString());

      expect(result).toBe('3 days ago');
    });

    it('should return formatted date for dates older than a week', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(tenDaysAgo.toISOString());

      expect(result).toMatch(/\w{3}/); // Month abbreviation
      expect(result).not.toMatch(/ago/);
    });

    it('should handle singular time units correctly', () => {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const result = formatRelativeTime(oneMinuteAgo.toISOString());

      expect(result).toBe('1 minute ago');
    });
  });
});
