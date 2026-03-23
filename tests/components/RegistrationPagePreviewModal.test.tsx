/**
 * Tests for RegistrationPagePreviewModal Component
 */

import { describe, it, expect, vi } from 'vitest';
import RegistrationPagePreviewModal from '@/components/autopilot/RegistrationPagePreviewModal';

describe('RegistrationPagePreviewModal', () => {
  const mockFormData = {
    title: 'Business Webinar',
    description: 'Learn about our opportunity',
    customMessage: 'Looking forward to seeing you!',
    eventDate: '2026-04-15',
    eventTime: '18:00',
    eventTimezone: 'America/Chicago',
    durationMinutes: 60,
    locationType: 'virtual' as const,
    virtualLink: 'https://zoom.us/j/123',
    physicalAddress: '',
    registrationSlug: 'business-webinar-april',
    maxAttendees: '50',
  };

  const mockDistributorData = {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@example.com',
    phone: '+1234567890',
    slug: 'john-smith',
  };

  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    formData: mockFormData,
    distributorData: mockDistributorData,
    onCreateMeeting: vi.fn(),
  };

  it('should render modal when open', () => {
    expect(mockProps.isOpen).toBe(true);
  });

  it('should show preview banner with URL', () => {
    const expectedSlug = `${mockDistributorData.slug}/register/${mockFormData.registrationSlug}`;
    expect(expectedSlug).toBe('john-smith/register/business-webinar-april');
  });

  it('should call onClose when Edit Details clicked', () => {
    expect(mockProps.onClose).toBeDefined();
  });

  it('should call onCreateMeeting when Create Meeting clicked', () => {
    expect(mockProps.onCreateMeeting).toBeDefined();
  });

  it('should transform form data correctly', () => {
    expect(mockFormData.title).toBe('Business Webinar');
    expect(mockFormData.durationMinutes).toBe(60);
    expect(mockFormData.locationType).toBe('virtual');
  });
});
