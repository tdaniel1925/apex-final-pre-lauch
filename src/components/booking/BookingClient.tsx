'use client';

// =============================================
// Booking Client Component
// Calendar interface for scheduling onboarding sessions
// 9am-6pm CT, Mon-Sat, 30-minute sessions
// =============================================

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function BookingClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate next 30 business days
  const businessDays: string[] = [];
  const today = new Date();
  let currentDate = new Date(today);
  currentDate.setDate(currentDate.getDate() + 1); // Start from tomorrow

  while (businessDays.length < 30) {
    const dayOfWeek = currentDate.getDay();
    // Skip Sundays only (0 = Sunday, Saturdays are now allowed)
    if (dayOfWeek !== 0) {
      businessDays.push(currentDate.toISOString().split('T')[0]);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Load available slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableSlots = async (date: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/booking/availability?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots);
      }
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !sessionId) {
      setError('Please select a date and time');
      return;
    }

    setBooking(true);
    setError(null);

    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          date: selectedDate,
          time: selectedTime,
        }),
      });

      if (response.ok) {
        setBooked(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to book session');
        setBooking(false);
      }
    } catch (error) {
      setError('Failed to book session');
      setBooking(false);
    }
  };

  if (booked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl border-2 border-green-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Session Booked!
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Your onboarding session has been scheduled for:
          </p>
          <div className="bg-slate-50 rounded-lg p-6 mb-6">
            <p className="text-xl font-bold text-slate-900 mb-2">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-lg text-slate-700">
              {formatTime(selectedTime || '')} Central Time
            </p>
            <p className="text-sm text-slate-500 mt-2">Duration: 30 minutes</p>
          </div>
          <p className="text-slate-600 mb-4">
            You'll receive a confirmation email with your session details and Dialpad meeting link.
          </p>
          <p className="text-sm text-slate-500">
            Need to reschedule? Contact your representative or reply to the confirmation email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#2B4C7E] rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Schedule Your Onboarding Session
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Book a 30-minute session with BotMakers to get started with your new AI-powered tools.
          </p>
        </div>

        {/* Booking Interface */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-8">
          {/* Step 1: Select Date */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Step 1: Choose a Date
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {businessDays.slice(0, 15).map((date) => {
                const dateObj = new Date(date + 'T00:00:00');
                return (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedTime(null);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedDate === date
                        ? 'border-[#2B4C7E] bg-[#2B4C7E] text-white'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-semibold">
                      {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-xs mt-1">
                      {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Time */}
          {selectedDate && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Step 2: Choose a Time (Central Time)
              </h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-[#2B4C7E] border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedTime === time
                          ? 'border-[#2B4C7E] bg-[#2B4C7E] text-white'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {formatTime(time)}
                    </button>
                  ))}
                  {availableSlots.length === 0 && (
                    <div className="col-span-full text-center py-8 text-slate-500">
                      No slots available for this date. Please choose another day.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Book Button */}
          {selectedDate && selectedTime && (
            <div className="border-t-2 border-slate-200 pt-6">
              <div className="bg-slate-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-slate-900 mb-2">Your Selection:</h3>
                <p className="text-lg text-slate-700">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {' at '}
                  {formatTime(selectedTime)} CT
                </p>
                <p className="text-sm text-slate-500 mt-2">Duration: 30 minutes</p>
              </div>
              <button
                onClick={handleBooking}
                disabled={booking}
                className="w-full py-4 px-6 bg-[#2B4C7E] text-white font-bold rounded-lg hover:bg-[#1a2c4e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {booking ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(time: string): string {
  // Convert 24-hour time to 12-hour format
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
