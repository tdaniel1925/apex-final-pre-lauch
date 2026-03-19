// =============================================
// Event Form Unit Tests
// Test event form validation and submission
// =============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventForm from '@/components/admin/EventForm';
import { useRouter } from 'next/navigation';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('EventForm Component', () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
    (global.fetch as any).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all required form fields', () => {
      render(<EventForm />);

      // Basic info fields - use name attributes instead
      expect(screen.getByPlaceholderText(/Annual Product Launch/i)).toBeInTheDocument();

      // Date/Time fields
      const dateInput = document.querySelector('input[name="event_date_time"]');
      expect(dateInput).toBeInTheDocument();

      const durationInput = document.querySelector('input[name="event_duration_minutes"]');
      expect(durationInput).toBeInTheDocument();

      // Location fields
      expect(screen.getByText(/Location Type/i)).toBeInTheDocument();

      // Submit button
      expect(screen.getByRole('button', { name: /Create Event/i })).toBeInTheDocument();
    });

    it('should render with edit mode when event prop is provided', () => {
      const mockEvent = {
        id: '123',
        event_name: 'Test Event',
        event_type: 'training',
        event_date_time: '2026-06-15T14:00:00Z',
        event_duration_minutes: 120,
        event_timezone: 'America/Chicago',
        location_type: 'virtual',
        status: 'draft',
        is_featured: false,
        is_public: true,
        display_order: 0,
        requires_registration: true,
        venue_country: 'United States',
      };

      render(<EventForm event={mockEvent} />);

      // Should show Update button instead of Create
      expect(screen.getByRole('button', { name: /Update Event/i })).toBeInTheDocument();

      // Should pre-fill event name
      const nameInput = document.querySelector('input[name="event_name"]') as HTMLInputElement;
      expect(nameInput?.value).toBe('Test Event');
    });

    it('should show cancel button', () => {
      render(<EventForm />);

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });
  });

  describe('Location Type Toggle', () => {
    it('should show in-person fields when in-person is selected', async () => {
      render(<EventForm />);

      // Select in-person
      const inPersonRadio = document.querySelector('input[value="in_person"]') as HTMLInputElement;
      await userEvent.click(inPersonRadio!);

      // Wait for fields to appear
      await waitFor(() => {
        expect(document.querySelector('input[name="venue_name"]')).toBeInTheDocument();
        expect(document.querySelector('input[name="venue_address"]')).toBeInTheDocument();
        expect(document.querySelector('input[name="venue_city"]')).toBeInTheDocument();
      });
    });

    it('should show virtual fields when virtual is selected', async () => {
      render(<EventForm />);

      // Select virtual
      const virtualRadio = document.querySelector('input[value="virtual"]') as HTMLInputElement;
      await userEvent.click(virtualRadio!);

      // Wait for fields to appear
      await waitFor(() => {
        expect(document.querySelector('input[name="virtual_meeting_link"]')).toBeInTheDocument();
        expect(document.querySelector('input[name="virtual_meeting_platform"]')).toBeInTheDocument();
      });
    });

    it('should show both in-person and virtual fields when hybrid is selected', async () => {
      render(<EventForm />);

      // Select hybrid
      const hybridRadio = document.querySelector('input[value="hybrid"]') as HTMLInputElement;
      await userEvent.click(hybridRadio!);

      // Wait for fields to appear
      await waitFor(() => {
        expect(document.querySelector('input[name="venue_name"]')).toBeInTheDocument();
        expect(document.querySelector('input[name="virtual_meeting_link"]')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for empty event name', async () => {
      render(<EventForm />);

      const submitButton = screen.getByRole('button', { name: /Create Event/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Event name is required/i)).toBeInTheDocument();
      });
    });

    it('should validate required fields before submission', async () => {
      render(<EventForm />);

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /Create Event/i });
      await userEvent.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/Event name is required/i)).toBeInTheDocument();
      });

      // Should not call API
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should successfully create event with valid data', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '123' } }),
      });

      render(<EventForm />);

      // Fill required fields
      const nameInput = document.querySelector('input[name="event_name"]') as HTMLInputElement;
      await userEvent.type(nameInput!, 'Test Event');

      const typeSelect = document.querySelector('select[name="event_type"]') as HTMLSelectElement;
      await userEvent.selectOptions(typeSelect!, 'training');

      const dateInput = document.querySelector('input[name="event_date_time"]') as HTMLInputElement;
      await userEvent.type(dateInput!, '2026-06-15T14:00');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create Event/i });
      await userEvent.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/Saving.../i)).toBeInTheDocument();
      });

      // Should call API
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/events',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });

      // Should redirect to events list
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/events');
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('should update existing event when in edit mode', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '123' } }),
      });

      const mockEvent = {
        id: '123',
        event_name: 'Test Event',
        event_type: 'training',
        event_date_time: '2026-06-15T14:00:00Z',
        event_duration_minutes: 120,
        event_timezone: 'America/Chicago',
        location_type: 'in_person',
        status: 'draft',
        is_featured: false,
        is_public: true,
        display_order: 0,
        requires_registration: true,
        venue_country: 'United States',
      };

      render(<EventForm event={mockEvent} />);

      // Modify event name
      const nameInput = document.querySelector('input[name="event_name"]') as HTMLInputElement;
      await userEvent.clear(nameInput!);
      await userEvent.type(nameInput!, 'Updated Event');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Update Event/i });
      await userEvent.click(submitButton);

      // Should call PATCH API
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/events/123',
          expect.objectContaining({
            method: 'PATCH',
          })
        );
      });
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to create event' }),
      });

      render(<EventForm />);

      // Fill required fields
      const nameInput = document.querySelector('input[name="event_name"]') as HTMLInputElement;
      await userEvent.type(nameInput!, 'Test Event');

      const dateInput = document.querySelector('input[name="event_date_time"]') as HTMLInputElement;
      await userEvent.type(dateInput!, '2026-06-15T14:00');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create Event/i });
      await userEvent.click(submitButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Failed to create event/i)).toBeInTheDocument();
      });

      // Should not redirect
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should convert tags from comma-separated string to array', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '123' } }),
      });

      render(<EventForm />);

      // Fill required fields
      const nameInput = document.querySelector('input[name="event_name"]') as HTMLInputElement;
      await userEvent.type(nameInput!, 'Test Event');

      const dateInput = document.querySelector('input[name="event_date_time"]') as HTMLInputElement;
      await userEvent.type(dateInput!, '2026-06-15T14:00');

      // Add tags
      const tagsInput = document.querySelector('input[name="tags"]') as HTMLInputElement;
      await userEvent.type(tagsInput!, 'tag1, tag2, tag3');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create Event/i });
      await userEvent.click(submitButton);

      // Check API call includes tags as array
      await waitFor(() => {
        const fetchCall = (global.fetch as any).mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(body.tags).toEqual(['tag1', 'tag2', 'tag3']);
      });
    });
  });

  describe('Cancel Button', () => {
    it('should navigate back to events list when cancel is clicked', async () => {
      render(<EventForm />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await userEvent.click(cancelButton);

      expect(mockPush).toHaveBeenCalledWith('/admin/events');
    });
  });

  describe('Datetime Conversions', () => {
    it('should convert datetime-local to ISO string', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '123' } }),
      });

      render(<EventForm />);

      // Fill required fields
      const nameInput = document.querySelector('input[name="event_name"]') as HTMLInputElement;
      await userEvent.type(nameInput!, 'Test Event');

      const dateInput = document.querySelector('input[name="event_date_time"]') as HTMLInputElement;
      await userEvent.type(dateInput!, '2026-06-15T14:00');

      // Submit
      const submitButton = screen.getByRole('button', { name: /Create Event/i });
      await userEvent.click(submitButton);

      // Check ISO format in API call
      await waitFor(() => {
        const fetchCall = (global.fetch as any).mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(body.event_date_time).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });
    });
  });

  describe('Checkbox Fields', () => {
    it('should handle checkbox fields correctly', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '123' } }),
      });

      render(<EventForm />);

      // Fill required fields
      const nameInput = document.querySelector('input[name="event_name"]') as HTMLInputElement;
      await userEvent.type(nameInput!, 'Test Event');

      const dateInput = document.querySelector('input[name="event_date_time"]') as HTMLInputElement;
      await userEvent.type(dateInput!, '2026-06-15T14:00');

      // Check featured checkbox
      const featuredCheckbox = document.querySelector('input[name="is_featured"]') as HTMLInputElement;
      await userEvent.click(featuredCheckbox!);

      // Uncheck public checkbox
      const publicCheckbox = document.querySelector('input[name="is_public"]') as HTMLInputElement;
      await userEvent.click(publicCheckbox!);

      // Submit
      const submitButton = screen.getByRole('button', { name: /Create Event/i });
      await userEvent.click(submitButton);

      // Check API call
      await waitFor(() => {
        const fetchCall = (global.fetch as any).mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(body.is_featured).toBe(true);
        expect(body.is_public).toBe(false);
      });
    });
  });
});
