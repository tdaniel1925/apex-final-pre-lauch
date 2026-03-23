'use client';

/**
 * Registration Page Preview Modal
 * Shows preview of public meeting registration page before creating meeting
 */

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Edit, Check } from 'lucide-react';
import MeetingRegistrationForm from '../MeetingRegistrationForm';

interface RegistrationPagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    title: string;
    description: string;
    customMessage: string;
    eventDate: string;
    eventTime: string;
    eventTimezone: string;
    durationMinutes: number;
    locationType: 'virtual' | 'physical' | 'hybrid';
    virtualLink: string;
    physicalAddress: string;
    registrationSlug: string;
    maxAttendees: string;
  };
  distributorData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    slug: string;
  };
  onCreateMeeting: () => void;
}

export default function RegistrationPagePreviewModal({
  isOpen,
  onClose,
  formData,
  distributorData,
  onCreateMeeting,
}: RegistrationPagePreviewModalProps) {
  // Transform form data to match MeetingData interface
  const meetingData = {
    id: 'preview-id',
    title: formData.title,
    description: formData.description || null,
    customMessage: formData.customMessage || null,
    eventDate: formData.eventDate,
    eventTime: formData.eventTime,
    eventTimezone: formData.eventTimezone,
    durationMinutes: formData.durationMinutes,
    locationType: formData.locationType,
    virtualLink: formData.virtualLink || null,
    physicalAddress: formData.physicalAddress || null,
    maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
    totalRegistered: 0, // Preview always shows 0 registrations
  };

  const distributorDataForForm = {
    firstName: distributorData.firstName,
    lastName: distributorData.lastName,
    email: distributorData.email,
    phone: distributorData.phone,
  };

  // Calculate full URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.theapexway.net';
  const fullUrl = `${baseUrl}/${distributorData.slug}/register/${formData.registrationSlug}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-full w-full h-full p-0 gap-0">
        {/* Preview Banner - Sticky at top */}
        <div className="bg-yellow-50 border-b border-yellow-300 px-6 py-4 sticky top-0 z-10 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-yellow-900">
                  PREVIEW MODE - This is how prospects will see your registration page
                </p>
                <p className="text-xs text-yellow-700 mt-1 truncate">
                  URL: {fullUrl}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" onClick={onClose} size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Details
                </Button>
                <Button onClick={onCreateMeeting} size="sm">
                  <Check className="w-4 h-4 mr-2" />
                  Create Meeting
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Page Content */}
        <div className="overflow-y-auto flex-1">
          <MeetingRegistrationForm
            meeting={meetingData}
            distributor={distributorDataForForm}
            previewMode={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
