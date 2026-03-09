'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notificationPreferencesSchema, type NotificationPreferencesFormData } from '@/lib/profile/validation';
import { Loader2, Save, CheckCircle2, Mail, MessageSquare, Bell, MonitorSmartphone } from 'lucide-react';

interface NotificationsTabProps {
  userId: string;
}

// Notification categories with their events
const notificationCategories = [
  {
    title: 'Commissions & Payouts',
    description: 'Notifications about your earnings and payments',
    events: [
      { key: 'commission_credited', label: 'Commission Credited' },
      { key: 'payout_processed', label: 'Payout Processed' },
      { key: 'bonus_unlocked', label: 'Bonus Unlocked' },
    ],
  },
  {
    title: 'Team Activity',
    description: 'Updates about your team members',
    events: [
      { key: 'new_recruit', label: 'New Recruit Joins' },
      { key: 'team_rankup', label: 'Team Member Ranks Up' },
      { key: 'team_inactive', label: 'Team Member Inactive' },
    ],
  },
  {
    title: 'Customers & Orders',
    description: 'Activity from your customers',
    events: [
      { key: 'customer_order', label: 'Customer Places Order' },
      { key: 'autoship_renewal', label: 'Autoship Renewal' },
      { key: 'customer_cancellation', label: 'Customer Cancels' },
    ],
  },
  {
    title: 'System & Security',
    description: 'Account security and company updates',
    events: [
      { key: 'new_login', label: 'New Login Detected' },
      { key: 'corporate_announcements', label: 'Corporate Announcements' },
    ],
  },
];

const channels = [
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'sms', label: 'SMS', icon: MessageSquare },
  { key: 'push', label: 'Push', icon: Bell },
  { key: 'inapp', label: 'In-App', icon: MonitorSmartphone },
];

export default function NotificationsTab({ userId }: NotificationsTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<NotificationPreferencesFormData>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {}, // Will be loaded from API
  });

  // Load existing preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/profile/notifications');
        if (response.ok) {
          const data = await response.json();
          reset(data);
        }
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      } finally {
        setLoadingPreferences(false);
      }
    };

    loadPreferences();
  }, [reset]);

  const onSubmit = async (data: NotificationPreferencesFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/profile/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update preferences');
      }

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPreferences) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apex-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900">
          Notification Preferences
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Choose how you want to be notified about important events
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
        {/* Success Message */}
        {submitSuccess && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-800">Preferences updated successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-sm text-red-800">{submitError}</span>
          </div>
        )}

        {/* Categories */}
        {notificationCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{category.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Event
                </div>
                {channels.map((channel) => (
                  <div key={channel.key} className="text-center w-16">
                    <div className="flex flex-col items-center gap-1">
                      <channel.icon className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600">{channel.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Rows */}
              {category.events.map((event, eventIndex) => (
                <div
                  key={event.key}
                  className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 px-4 py-4 ${
                    eventIndex !== category.events.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900 self-center">
                    {event.label}
                  </div>
                  {channels.map((channel) => {
                    const fieldName = `${event.key}_${channel.key}` as keyof NotificationPreferencesFormData;
                    return (
                      <div key={channel.key} className="flex items-center justify-center w-16">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...register(fieldName)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-apex-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-apex-primary"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Email and In-App notifications are recommended for important
            updates. SMS notifications may incur charges from your carrier. Push notifications
            require the mobile app to be installed.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-apex-primary text-white rounded-lg font-medium hover:bg-apex-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Preferences
              </>
            )}
          </button>
          {!isDirty && (
            <span className="ml-3 text-xs text-gray-500">
              No changes to save
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
