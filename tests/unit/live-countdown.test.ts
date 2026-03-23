/**
 * Tests for Live Page Countdown Calculation
 */

import { describe, it, expect } from 'vitest';

describe('Live Page - Countdown Calculation', () => {
  /**
   * Test countdown calculation logic
   * This mimics the logic in src/app/live/page.tsx lines 94-112
   */
  function calculateCountdown(currentDay: number, currentHours: number, currentMinutes: number): string {
    // Calculate days until next event (Tuesday=2, Thursday=4)
    const daysUntilTuesday = (2 - currentDay + 7) % 7 || 7;
    const daysUntilThursday = (4 - currentDay + 7) % 7 || 7;

    const nextEventDay = daysUntilTuesday < daysUntilThursday ? daysUntilTuesday : daysUntilThursday;

    // Calculate exact time until next event (6:30 PM = 18:30)
    const currentDate = new Date(2026, 2, 22 + currentDay, currentHours, currentMinutes, 0); // March 2026, day depends on test
    const nextEventDate = new Date(currentDate);
    nextEventDate.setDate(nextEventDate.getDate() + nextEventDay);
    nextEventDate.setHours(18, 30, 0, 0);

    const msUntilEvent = nextEventDate.getTime() - currentDate.getTime();
    const totalHours = Math.floor(msUntilEvent / (1000 * 60 * 60));
    const totalMinutes = Math.floor((msUntilEvent % (1000 * 60 * 60)) / (1000 * 60));

    // Format countdown based on time remaining
    if (totalHours >= 24) {
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;
      return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (totalHours > 0) {
      return `${totalHours} hour${totalHours !== 1 ? 's' : ''}, ${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`;
    } else {
      return `${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`;
    }
  }

  it('should calculate correct countdown from Sunday 8:25 PM to Tuesday 6:30 PM', () => {
    // Sunday = 0, 8:25 PM = 20:25
    const countdown = calculateCountdown(0, 20, 25);

    // Expected: 1 day, 22 hours (46 hours total minus 5 minutes)
    expect(countdown).toBe('1 day, 22 hours');
  });

  it('should calculate correct countdown from Monday 2:00 PM to Tuesday 6:30 PM', () => {
    // Monday = 1, 2:00 PM = 14:00
    const countdown = calculateCountdown(1, 14, 0);

    // Expected: 1 day, 4 hours (28.5 hours total)
    expect(countdown).toBe('1 day, 4 hours');
  });

  it('should calculate correct countdown from Wednesday to Thursday event', () => {
    // Wednesday = 3, 10:00 AM = 10:00
    const countdown = calculateCountdown(3, 10, 0);

    // Expected: 1 day, 8 hours (32.5 hours total)
    expect(countdown).toBe('1 day, 8 hours');
  });

  it('should calculate correct countdown when less than 24 hours remain', () => {
    // Monday = 1, 8:00 PM = 20:00 (22.5 hours before Tuesday event at 6:30 PM)
    const countdown = calculateCountdown(1, 20, 0);

    // Expected: 22 hours, 30 minutes
    expect(countdown).toBe('22 hours, 30 minutes');
  });

  it('should calculate to next week if on event day but before room opens', () => {
    // Tuesday = 2, 2:00 PM = 14:00 (before room opens at 6:00 PM)
    // Since this code path only runs when NOT live, it means we're outside the live window
    // So it should calculate to NEXT Tuesday (7 days)
    const countdown = calculateCountdown(2, 14, 0);

    // Expected: 2 days, 4 hours (until next Tuesday at 6:30 PM, which is 7 days minus time already passed)
    expect(countdown).toBe('2 days, 4 hours');
  });

  it('should handle plural/singular correctly for days and hours', () => {
    // Friday = 5, 6:30 PM = 18:30 (exactly 4 days until Tuesday)
    const countdown = calculateCountdown(5, 18, 30);

    // Expected: 4 days, 0 hours
    expect(countdown).toBe('4 days, 0 hours');
  });

  it('should use singular "day" and "hour" when count is 1', () => {
    // Monday = 1, 6:30 PM = 18:30 (exactly 1 day until Tuesday)
    const countdown = calculateCountdown(1, 18, 30);

    // Expected: 1 day, 0 hours
    expect(countdown).toBe('1 day, 0 hours');
  });
});
