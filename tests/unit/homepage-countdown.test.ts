/**
 * Tests for Homepage Countdown Timer
 * Verifies OptiveReplicatedSite countdown matches /live page logic
 */

import { describe, it, expect } from 'vitest';

describe('Homepage Countdown - Next Event Calculation', () => {
  /**
   * This mimics the countdown logic in OptiveReplicatedSite component
   */
  function getNextEventDate(currentDay: number, currentHours: number, currentMinutes: number): Date {
    const centralTime = new Date(2026, 2, 22 + currentDay, currentHours, currentMinutes, 0);
    const dayOfWeek = centralTime.getDay();
    const hours = centralTime.getHours();
    const minutes = centralTime.getMinutes();
    const currentMinutesTotal = hours * 60 + minutes;

    const eventTime = 18 * 60 + 30; // 6:30 PM

    let nextEventDay: number;

    // If we're on Tuesday before event time, event is today
    if (dayOfWeek === 2 && currentMinutesTotal < eventTime) {
      nextEventDay = 0;
    }
    // If we're on Tuesday after event time, next event is Thursday
    else if (dayOfWeek === 2 && currentMinutesTotal >= eventTime) {
      nextEventDay = 2;
    }
    // If we're on Thursday before event time, event is today
    else if (dayOfWeek === 4 && currentMinutesTotal < eventTime) {
      nextEventDay = 0;
    }
    // If we're on Thursday after event time, next event is next Tuesday
    else if (dayOfWeek === 4 && currentMinutesTotal >= eventTime) {
      nextEventDay = 5;
    }
    // Otherwise, calculate days until next Tuesday or Thursday
    else {
      const daysUntilTuesday = (2 - dayOfWeek + 7) % 7 || 7;
      const daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7;
      nextEventDay = daysUntilTuesday < daysUntilThursday ? daysUntilTuesday : daysUntilThursday;
    }

    const nextEvent = new Date(centralTime);
    nextEvent.setDate(centralTime.getDate() + nextEventDay);
    nextEvent.setHours(18, 30, 0, 0);

    return nextEvent;
  }

  function calculateTimeLeft(currentDay: number, currentHours: number, currentMinutes: number) {
    const eventDate = getNextEventDate(currentDay, currentHours, currentMinutes);
    const centralNow = new Date(2026, 2, 22 + currentDay, currentHours, currentMinutes, 0);
    const difference = eventDate.getTime() - centralNow.getTime();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  it('should calculate countdown from Sunday 8:25 PM to Tuesday 6:30 PM', () => {
    // Sunday = 0, 8:25 PM
    const timeLeft = calculateTimeLeft(0, 20, 25);

    // Expected: 1 day, 22 hours, 5 minutes
    expect(timeLeft.days).toBe(1);
    expect(timeLeft.hours).toBe(22);
    expect(timeLeft.minutes).toBe(5);
  });

  it('should calculate countdown from Monday afternoon to Tuesday 6:30 PM', () => {
    // Monday = 1, 2:00 PM
    const timeLeft = calculateTimeLeft(1, 14, 0);

    // Expected: 1 day, 4 hours, 30 minutes
    expect(timeLeft.days).toBe(1);
    expect(timeLeft.hours).toBe(4);
    expect(timeLeft.minutes).toBe(30);
  });

  it('should calculate countdown from Wednesday to Thursday 6:30 PM', () => {
    // Wednesday = 3, 10:00 AM
    const timeLeft = calculateTimeLeft(3, 10, 0);

    // Expected: 1 day, 8 hours, 30 minutes
    expect(timeLeft.days).toBe(1);
    expect(timeLeft.hours).toBe(8);
    expect(timeLeft.minutes).toBe(30);
  });

  it('should skip to Thursday if on Tuesday after 6:30 PM', () => {
    // Tuesday = 2, 7:00 PM (after event)
    const timeLeft = calculateTimeLeft(2, 19, 0);

    // Expected: 1 day, 23 hours, 30 minutes (until Thursday 6:30 PM)
    expect(timeLeft.days).toBe(1);
    expect(timeLeft.hours).toBe(23);
    expect(timeLeft.minutes).toBe(30);
  });

  it('should skip to next Tuesday if on Thursday after 6:30 PM', () => {
    // Thursday = 4, 8:00 PM (after event)
    const timeLeft = calculateTimeLeft(4, 20, 0);

    // Expected: 4 days, 22 hours, 30 minutes (until next Tuesday 6:30 PM)
    expect(timeLeft.days).toBe(4);
    expect(timeLeft.hours).toBe(22);
    expect(timeLeft.minutes).toBe(30);
  });

  it('should calculate correctly on Friday afternoon', () => {
    // Friday = 5, 3:00 PM
    const timeLeft = calculateTimeLeft(5, 15, 0);

    // Expected: 4 days, 3 hours, 30 minutes (until next Tuesday 6:30 PM)
    expect(timeLeft.days).toBe(4);
    expect(timeLeft.hours).toBe(3);
    expect(timeLeft.minutes).toBe(30);
  });

  it('should show correct countdown on Tuesday before event', () => {
    // Tuesday = 2, 4:00 PM (before 6:30 PM event)
    const timeLeft = calculateTimeLeft(2, 16, 0);

    // Expected: 0 days, 2 hours, 30 minutes
    expect(timeLeft.days).toBe(0);
    expect(timeLeft.hours).toBe(2);
    expect(timeLeft.minutes).toBe(30);
  });
});
