# Onboarding Calendar System - Visual Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CUSTOMER ONBOARDING CALENDAR                      │
│                         30-min sessions                              │
│                    9am-6pm CT, Mon-Sat                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ PHASE 1: PURCHASE & REDIRECT                                         │
└──────────────────────────────────────────────────────────────────────┘

Customer
   │
   ├─► Purchases PulseMarket/PulseFlow/PulseDrive/PulseCommand
   │   (Stripe Checkout)
   │
   ├─► Stripe Payment Complete
   │   └─► session_id: cs_test_abc123...
   │
   ├─► Redirected to: /products/success?session_id=X&product=pulsemarket
   │
   └─► Success Page Logic
       ├─► Detects: requiresOnboarding = true
       ├─► Shows: "Schedule Your Onboarding" prompt
       ├─► Auto-redirects (3 sec): /booking?session_id=X
       └─► Manual option: "Schedule Now" button


┌──────────────────────────────────────────────────────────────────────┐
│ PHASE 2: BOOKING SELECTION                                           │
└──────────────────────────────────────────────────────────────────────┘

Customer arrives at /booking
   │
   ├─► BookingClient.tsx loads
   │   └─► Generates next 30 business days (Mon-Sat only)
   │
   ├─► Customer selects date (e.g., April 15, 2026)
   │
   ├─► GET /api/booking/availability?date=2026-04-15
   │   │
   │   ├─► Generate all possible slots:
   │   │   [9:00, 9:45, 10:30, 11:15, 12:00, 12:45,
   │   │    1:30, 2:15, 3:00, 3:45, 4:30, 5:15]
   │   │
   │   ├─► Query onboarding_sessions table
   │   │   └─► Get booked times for this date
   │   │
   │   ├─► Query Google Calendar (if configured)
   │   │   └─► Get booked events for this date
   │   │
   │   ├─► Filter out:
   │   │   • Booked times (database)
   │   │   • Booked times (Google Calendar)
   │   │   • Times within 24 hours
   │   │
   │   └─► Return: [9:00, 10:30, 1:30, 3:00, 4:30]
   │
   ├─► Customer selects time (e.g., 10:30 AM)
   │
   └─► Customer clicks "Confirm Booking"


┌──────────────────────────────────────────────────────────────────────┐
│ PHASE 3: BOOKING CREATION                                            │
└──────────────────────────────────────────────────────────────────────┘

POST /api/booking/create
   │
   ├─► Validate request:
   │   ├─► session_id present?
   │   ├─► date/time valid format?
   │   ├─► Not Sunday?
   │   └─► 24+ hours in future?
   │
   ├─► Verify Stripe session:
   │   ├─► stripe.checkout.sessions.retrieve(session_id)
   │   ├─► Get: customer_email, customer_name, customer_phone
   │   └─► Find order by stripe_session_id
   │
   ├─► Check slot still available:
   │   └─► Query onboarding_sessions for conflicts
   │
   ├─► Create Google Calendar event (if configured):
   │   ├─► Title: "Onboarding: John Doe - PulseMarket"
   │   ├─► Start: 2026-04-15 10:30:00 CT
   │   ├─► End: 2026-04-15 11:00:00 CT (30 min)
   │   ├─► Attendees: [customer_email, botmakers@theapexway.net, rep_email]
   │   ├─► Location: https://meetings.dialpad.com/room/aicallers
   │   ├─► Reminders: 24hr, 4hr, 15min
   │   └─► Returns: event_id, html_link
   │
   ├─► Create onboarding_sessions record:
   │   ├─► customer_id, order_id, rep_distributor_id
   │   ├─► scheduled_date: 2026-04-15
   │   ├─► scheduled_time: 10:30:00
   │   ├─► duration_minutes: 30
   │   ├─► zoom_link: https://meetings.dialpad.com/room/aicallers
   │   ├─► status: 'scheduled'
   │   ├─► session_notes: "Google Calendar Event ID: abc123"
   │   └─► Returns: booking record
   │
   ├─► Send confirmation emails (3 recipients):
   │   ├─► To customer: "Your Onboarding Session is Confirmed!"
   │   ├─► To rep: "Client Onboarding Scheduled: John Doe"
   │   └─► To BotMakers: "New Onboarding: PulseMarket - April 15, 10:30am"
   │
   ├─► Update booking record:
   │   └─► confirmation_sent_at: now()
   │
   └─► Return success → Customer sees "Session Booked!" screen


┌──────────────────────────────────────────────────────────────────────┐
│ PHASE 4: REMINDER SYSTEM (Cron Job)                                  │
└──────────────────────────────────────────────────────────────────────┘

Vercel Cron (runs every 15 minutes)
   │
   └─► GET /api/cron/onboarding-reminders
       │ (Authorization: Bearer CRON_SECRET)
       │
       ├─────────────────────────────────────────────────────────────┐
       │ 24-HOUR REMINDER                                            │
       ├─────────────────────────────────────────────────────────────┤
       │                                                             │
       ├─► Calculate: now + 24 hours ± 15 min window               │
       │   └─► Window: [23h 45m → 24h 15m from now]                │
       │                                                             │
       ├─► Query onboarding_sessions:                               │
       │   ├─► status = 'scheduled'                                 │
       │   ├─► reminder_24h_sent_at IS NULL                         │
       │   └─► scheduled_date/time within window                    │
       │                                                             │
       ├─► For each session:                                        │
       │   ├─► send24HourReminder()                                 │
       │   │   ├─► To: customer_email                              │
       │   │   ├─► CC: rep_email                                   │
       │   │   └─► Subject: "Reminder: Your Session is Tomorrow"  │
       │   │                                                         │
       │   └─► Update: reminder_24h_sent_at = now()                │
       │                                                             │
       └─────────────────────────────────────────────────────────────┘

       ├─────────────────────────────────────────────────────────────┐
       │ 4-HOUR REMINDER                                             │
       ├─────────────────────────────────────────────────────────────┤
       │                                                             │
       ├─► Calculate: now + 4 hours ± 15 min window                │
       │   └─► Window: [3h 45m → 4h 15m from now]                  │
       │                                                             │
       ├─► Query onboarding_sessions:                               │
       │   ├─► status = 'scheduled'                                 │
       │   ├─► reminder_24h_sent_at IS NOT NULL                     │
       │   ├─► session_notes NOT LIKE '%[4H_REMINDER_SENT]%'       │
       │   └─► scheduled_date/time within window                    │
       │                                                             │
       ├─► For each session:                                        │
       │   ├─► send4HourReminder()                                  │
       │   │   ├─► To: customer_email                              │
       │   │   └─► Subject: "Reminder: Your Session in 4 Hours"   │
       │   │                                                         │
       │   └─► Update: session_notes += '[4H_REMINDER_SENT]'       │
       │                                                             │
       └─────────────────────────────────────────────────────────────┘

       ├─────────────────────────────────────────────────────────────┐
       │ 15-MINUTE REMINDER                                          │
       ├─────────────────────────────────────────────────────────────┤
       │                                                             │
       ├─► Calculate: now + 15 min ± 7 min window                  │
       │   └─► Window: [8m → 22m from now]                         │
       │                                                             │
       ├─► Query onboarding_sessions:                               │
       │   ├─► status = 'scheduled'                                 │
       │   ├─► reminder_1h_sent_at IS NULL                          │
       │   └─► scheduled_date/time within window                    │
       │                                                             │
       ├─► For each session:                                        │
       │   ├─► send15MinuteReminder()                               │
       │   │   ├─► To: customer_email                              │
       │   │   ├─► CC: botmakers@theapexway.net                    │
       │   │   └─► Subject: "Starting Soon: Session in 15 Min"    │
       │   │                                                         │
       │   └─► Update: reminder_1h_sent_at = now()                 │
       │                                                             │
       └─────────────────────────────────────────────────────────────┘

       └─► Return: { success: true, remindersSent: 5, errors: [] }


┌──────────────────────────────────────────────────────────────────────┐
│ PHASE 5: REP DASHBOARD VIEW                                          │
└──────────────────────────────────────────────────────────────────────┘

Rep logs in → Navigates to /dashboard/my-clients
   │
   ├─► Query onboarding_sessions:
   │   ├─► WHERE rep_distributor_id = current_user.distributor_id
   │   └─► ORDER BY scheduled_date, scheduled_time ASC
   │
   ├─► Separate into:
   │   ├─► Upcoming: future sessions, status != 'completed'
   │   └─► Past: past sessions OR status = 'completed'
   │
   ├─► Display Statistics:
   │   ├─► Upcoming Sessions: 3
   │   ├─► Total Clients: 12
   │   └─► Completed: 9
   │
   ├─► Show Upcoming Sessions:
   │   ├─────────────────────────────────────────────────────┐
   │   │ April 15 │ John Doe                    │ In 2h 15m │
   │   │  10:30   │ john@example.com            │           │
   │   │   Wed    │ PulseMarket                 │ [Join]    │
   │   ├─────────────────────────────────────────────────────┤
   │   │ April 16 │ Jane Smith                  │ Tomorrow  │
   │   │  14:00   │ jane@example.com            │           │
   │   │   Thu    │ PulseFlow, PulseDrive       │ [Join]    │
   │   └─────────────────────────────────────────────────────┘
   │
   └─► Rep clicks "Join Meeting" → Opens Dialpad link


┌──────────────────────────────────────────────────────────────────────┐
│ PHASE 6: SESSION TIME                                                │
└──────────────────────────────────────────────────────────────────────┘

At session time (10:30 AM CT):
   │
   ├─► Customer:
   │   ├─► Received 3 email reminders
   │   ├─► Clicks meeting link from email
   │   └─► Joins: https://meetings.dialpad.com/room/aicallers
   │
   ├─► Rep:
   │   ├─► Sees countdown in dashboard
   │   ├─► Clicks "Join Meeting" button
   │   └─► Joins Dialpad meeting
   │
   └─► BotMakers:
       ├─► Received 15-min reminder
       ├─► Sees event in Google Calendar
       └─► Joins Dialpad meeting to conduct onboarding


┌──────────────────────────────────────────────────────────────────────┐
│ DATA FLOW SUMMARY                                                    │
└──────────────────────────────────────────────────────────────────────┘

┌────────────┐    ┌───────────────┐    ┌──────────────┐
│   Stripe   │───►│ Success Page  │───►│ Booking Page │
│  Checkout  │    │  (Redirect)   │    │  (Calendar)  │
└────────────┘    └───────────────┘    └──────┬───────┘
                                              │
                                              ▼
                  ┌─────────────────────────────────────┐
                  │   Booking API                       │
                  │   • Validate session                │
                  │   • Check availability             │
                  │   • Create DB record               │
                  │   • Create Google Calendar event   │
                  │   • Send emails                    │
                  └─────────┬──────────┬────────────────┘
                            │          │
                ┌───────────▼──┐    ┌──▼────────────┐
                │ Supabase DB  │    │ Google        │
                │ onboarding_  │    │ Calendar API  │
                │ sessions     │    └───────────────┘
                └───────┬──────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    ┌───▼────┐    ┌────▼─────┐    ┌───▼─────┐
    │ Cron   │    │   Rep    │    │ Email   │
    │ Job    │    │ Dashboard│    │ Service │
    │(15min) │    │(/my-     │    │(Resend) │
    │        │    │clients)  │    │         │
    └────────┘    └──────────┘    └─────────┘


┌──────────────────────────────────────────────────────────────────────┐
│ SYSTEM COMPONENTS                                                    │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ Frontend (UI)   │
├─────────────────┤
│ • BookingClient │ → Date/time picker
│ • Success Page  │ → Redirect logic
│ • Rep Dashboard │ → Session list view
└─────────────────┘

┌─────────────────┐
│ Backend (API)   │
├─────────────────┤
│ • /availability │ → Get open slots
│ • /create       │ → Create booking
│ • /reminders    │ → Send emails
└─────────────────┘

┌─────────────────┐
│ Integrations    │
├─────────────────┤
│ • Stripe        │ → Payment validation
│ • Google Cal    │ → Event management
│ • Resend        │ → Email delivery
│ • Dialpad       │ → Video meetings
└─────────────────┘

┌─────────────────┐
│ Data Storage    │
├─────────────────┤
│ • Supabase      │ → onboarding_sessions
│ • Google Cal    │ → Shared calendar
└─────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│ TIME SLOT CALCULATION                                                │
└──────────────────────────────────────────────────────────────────────┘

Schedule: 30-minute sessions with 15-minute buffer

 9:00 AM ─┐
          ├─ 30 min session
 9:30 AM ─┤
          ├─ 15 min buffer
 9:45 AM ─┐
          ├─ 30 min session
10:15 AM ─┤
          ├─ 15 min buffer
10:30 AM ─┐
          ├─ 30 min session
11:00 AM ─┤
          ├─ 15 min buffer
11:15 AM ─┐
          ├─ 30 min session
11:45 AM ─┤
          ├─ 15 min buffer
12:00 PM ─┐
          ├─ 30 min session
12:30 PM ─┤
          └─ 15 min buffer
... (continues through 5:15 PM)


┌──────────────────────────────────────────────────────────────────────┐
│ REMINDER TIMING DIAGRAM                                              │
└──────────────────────────────────────────────────────────────────────┘

Session scheduled for: April 15, 2026 at 10:30 AM CT

Timeline:
└─────────────────────────────────────────────────────────────────────►

April 14          April 15
10:30 AM         6:30 AM           10:15 AM         10:30 AM
   │                │                   │               │
   │                │                   │               │
   ▼                ▼                   ▼               ▼
┌────────┐     ┌─────────┐       ┌──────────┐    ┌─────────┐
│24h     │     │4h       │       │15min     │    │SESSION  │
│Reminder│     │Reminder │       │Reminder  │    │STARTS   │
└────────┘     └─────────┘       └──────────┘    └─────────┘
   │                │                   │
   │                │                   │
   ├─► Email to    ├─► Email to        ├─► Email to
   │   Customer    │   Customer        │   Customer
   │   & Rep       │                   │   & BotMakers
   │                                    │
   └─► Google      └─► Window:         └─► Window:
       Calendar        3h45m-4h15m          8m-22m
       reminder                             (tight!)


┌──────────────────────────────────────────────────────────────────────┐
│ ERROR HANDLING & FALLBACKS                                           │
└──────────────────────────────────────────────────────────────────────┘

Google Calendar API Failure:
   │
   ├─► Try: createCalendarEvent()
   │   └─► Catch error
   │
   ├─► Log: "Error creating Google Calendar event"
   │
   ├─► Continue: Create booking without event
   │   └─► session_notes = null (no event ID)
   │
   └─► Admin: Must manually add to calendar

Email Sending Failure:
   │
   ├─► Try: sendEmail()
   │   └─► result.error exists
   │
   ├─► Log: "Failed to send confirmation email"
   │
   ├─► Continue: Don't fail the booking
   │   └─► confirmation_sent_at = null
   │
   └─► Admin: Manually send email

Database Conflict (Double Booking):
   │
   ├─► Check: existingBooking query
   │   └─► Returns record
   │
   ├─► Return: 409 Conflict
   │   └─► Error: "This time slot is no longer available"
   │
   └─► UI: Shows error, customer selects new time


┌──────────────────────────────────────────────────────────────────────┐
│ SECURITY MODEL                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│ Public Endpoints        │ (No auth required)
├─────────────────────────┤
│ GET  /api/booking/      │ ✓ Anyone can view availability
│      availability       │
│                         │
│ POST /api/booking/      │ ✓ Validated via Stripe session
│      create             │   (prevents fake bookings)
└─────────────────────────┘

┌─────────────────────────┐
│ Protected Endpoints     │ (Auth required)
├─────────────────────────┤
│ GET  /dashboard/        │ ✓ Supabase Auth
│      my-clients         │ ✓ RLS: rep sees own clients only
└─────────────────────────┘

┌─────────────────────────┐
│ Cron Endpoints          │ (Secret header)
├─────────────────────────┤
│ GET  /api/cron/         │ ✓ Authorization: Bearer CRON_SECRET
│      onboarding-        │ ✓ Vercel cron signature
│      reminders          │
└─────────────────────────┘

Row Level Security (RLS):
   │
   ├─► Distributors: Can view own onboarding_sessions
   │   WHERE rep_distributor_id = current_distributor.id
   │
   ├─► Distributors: Can update own onboarding_sessions
   │   (e.g., mark as completed)
   │
   └─► Admins: Can view/update all onboarding_sessions
       (Full access)


┌──────────────────────────────────────────────────────────────────────┐
│ END OF FLOW DIAGRAM                                                  │
└──────────────────────────────────────────────────────────────────────┘
```

## Summary

This visual flow diagram illustrates the complete customer onboarding calendar system from purchase to session completion, including all integrations, data flows, timing, and error handling.
