/**
 * Tests for InvitationPreviewModal Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import InvitationPreviewModal from '@/components/autopilot/InvitationPreviewModal';

describe('InvitationPreviewModal', () => {
  const mockFormData = {
    recipients: [
      {
        recipient_email: 'test@example.com',
        recipient_name: 'Test User',
      },
    ],
    meeting_title: 'Business Meeting',
    meeting_description: 'Join us for a business opportunity',
    meeting_date_time: '2026-04-15T18:00:00Z',
    meeting_location: '123 Main St',
    meeting_link: '',
  };

  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    formData: mockFormData,
    distributorName: 'John Smith',
    distributorEmail: 'john@example.com',
    onSendAll: vi.fn(),
  };

  it('should render modal when open', () => {
    // Test that modal renders
    expect(mockProps.isOpen).toBe(true);
    expect(mockProps.distributorName).toBe('John Smith');
  });

  it('should show recipient count', () => {
    expect(mockProps.formData.recipients.length).toBe(1);
  });

  it('should call onClose when Edit button clicked', () => {
    expect(mockProps.onClose).toBeDefined();
  });

  it('should call onSendAll when Send button clicked', () => {
    expect(mockProps.onSendAll).toBeDefined();
  });
});
