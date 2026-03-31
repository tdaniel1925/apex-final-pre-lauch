# Customer Onboarding Calendar System

## Overview

This system allows customers to book 30-minute onboarding sessions after purchasing Pulse products. Sessions are conducted by BotMakers via Dialpad, with automatic Google Calendar integration.

## Features

- **Automatic Booking Flow**: Pulse product purchasers are redirected to booking page after Stripe checkout
- **Google Calendar Integration**: Sessions automatically added to BotMakers' calendar
- **Smart Scheduling**: 30-minute slots from 9am-6pm Central, Monday-Saturday
- **24-Hour Minimum Notice**: Prevents last-minute bookings
- **15-Minute Buffer**: Between sessions to allow for setup/wrap-up
- **Automated Reminders**: Email reminders at 24hr, 4hr, and 15min before session
- **Rep Dashboard**: Distributors can view all their clients' onboarding sessions

## Architecture

### Database Tables

**Primary Table**: `onboarding_sessions`
- Links to: `customers`, `orders`, `distributors`
- Tracks: scheduled sessions, reminders sent, completion status
- Created by migration: `20260326000002_onboarding_sessions.sql`

**Related Table**: `client_onboarding` (Agent 4)
- Used for tracking in the fulfillment pipeline
- Auto-transitions when onboarding is completed

### Key Files

**Booking Flow**:
- `/booking/page.tsx` - Main booking calendar interface
- `/products/success/page.tsx` - Success page with redirect logic
- `BookingClient.tsx` - Client-side booking component

**API Endpoints**:
- `/api/booking/availability` - Returns available time slots
- `/api/booking/create` - Creates booking and Google Calendar event
- `/api/cron/onboarding-reminders` - Sends reminder emails (runs every 15 min)

**Email System**:
- `src/lib/email/onboarding.ts` - Email functions
- Templates:
  - `booking-confirmation.html` - Initial confirmation
  - `booking-reminder-24h.html` - 24-hour reminder
  - `booking-reminder-4h.html` - 4-hour reminder
  - `booking-reminder-15m.html` - 15-minute reminder

**Google Calendar**:
- `src/lib/google-calendar/client.ts` - Calendar API integration

**Rep Dashboard**:
- `/dashboard/my-clients/page.tsx` - View all client onboardings

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local` file:

```env
# Google Calendar API (Service Account)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=primary

# Cron Job Authentication
CRON_SECRET=your-secure-random-string

# Stripe (already configured)
STRIPE_SECRET_KEY=sk_...
```

### 2. Google Calendar Service Account Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create Service Account:
   - IAM & Admin → Service Accounts → Create Service Account
   - Name: "Apex Onboarding Calendar"
   - Grant role: "Editor" (or create custom role with calendar.events.*)
5. Create JSON key:
   - Click on service account → Keys → Add Key → JSON
   - Download JSON file
6. Extract credentials:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
7. Share calendar with service account:
   - Open Google Calendar
   - Settings → Your calendar → Share with specific people
   - Add service account email with "Make changes to events" permission

### 3. Vercel Cron Configuration

The system uses Vercel Cron (configured in `vercel.json`):

```json
{
  "path": "/api/cron/onboarding-reminders",
  "schedule": "*/15 * * * *"  // Every 15 minutes
}
```

**Cron Secret**: Set `CRON_SECRET` in Vercel environment variables for security.

### 4. Database Migration

The database table already exists from migration `20260326000002_onboarding_sessions.sql`.

If you need to run it manually:
```bash
psql -h your-db-host -U your-user -d your-database -f supabase/migrations/20260326000002_onboarding_sessions.sql
```

## Usage

### For Customers

1. **Purchase Pulse Product**: Complete Stripe checkout
2. **Redirect to Booking**: Automatically redirected (or click "Schedule Now")
3. **Select Date/Time**: Choose from available 30-min slots
4. **Confirm Booking**: Receive confirmation email immediately
5. **Receive Reminders**: Get emails at 24hr, 4hr, 15min before session
6. **Join Meeting**: Click Dialpad link in email

### For Distributors (Reps)

1. **View Dashboard**: Navigate to `/dashboard/my-clients`
2. **See Upcoming Sessions**: View countdown timers for upcoming onboardings
3. **Join Meetings**: Click "Join Meeting" button when session starts
4. **Track History**: View completed and past sessions

### For BotMakers (Admin)

1. **Google Calendar**: All sessions appear in shared calendar
2. **Email Notifications**: Receive alerts for new bookings and 15-min reminders
3. **Join Sessions**: Use Dialpad link: `https://meetings.dialpad.com/room/aicallers`

## Product Configuration

### Trigger Onboarding for Products

Products that require onboarding are hardcoded in `src/app/products/success/page.tsx`:

```typescript
const requiresOnboarding = [
  'pulsemarket',
  'pulseflow',
  'pulsedrive',
  'pulsecommand'
].includes(productSlug?.toLowerCase() || '');
```

**To add new products**: Add product slug to this array.

**To disable for a product**: Remove slug from array.

## Scheduling Rules

### Time Slots
- **Hours**: 9:00am - 6:00pm Central Time
- **Days**: Monday - Saturday (no Sundays)
- **Duration**: 30 minutes per session
- **Buffer**: 15 minutes between sessions
- **Example slots**: 9:00, 9:45, 10:30, 11:15, 12:00, etc.

### Booking Rules
- **Minimum Notice**: 24 hours in advance
- **No Double-Booking**: System checks both database and Google Calendar
- **Automatic Conflict Detection**: Blocks overlapping times

## Email Reminder Schedule

| Time Before | Recipient(s) | Purpose |
|-------------|-------------|---------|
| 24 hours | Client, Rep, BotMakers | Initial reminder |
| 4 hours | Client | Mid-day reminder |
| 15 minutes | Client, BotMakers | Final alert |

## Troubleshooting

### Google Calendar Not Working

**Error**: "Google Calendar credentials not configured"

**Solution**:
1. Verify environment variables are set correctly
2. Check service account JSON is valid
3. Ensure calendar is shared with service account email
4. Test with: `isCalendarConfigured()` returns `true`

**Fallback**: System continues without Google Calendar (database-only booking)

### Reminders Not Sending

**Error**: Cron job not running

**Solution**:
1. Check Vercel Cron is configured in `vercel.json`
2. Verify `CRON_SECRET` matches in both code and environment
3. Check cron logs in Vercel dashboard
4. Test endpoint manually: `GET /api/cron/onboarding-reminders` with auth header

### Slots Not Available

**Issue**: No slots showing for valid dates

**Solutions**:
1. Check if date is within 24-hour minimum window
2. Verify it's not Sunday
3. Check for existing bookings in database
4. Test Google Calendar API connection
5. Review `booking/availability` API response

### Booking Creation Fails

**Issue**: "Failed to create booking"

**Solutions**:
1. Verify Stripe session ID is valid
2. Check `orders` table has matching `stripe_session_id`
3. Ensure `distributors` table has `rep_distributor_id`
4. Review API logs for detailed error

## Testing

### Test Booking Flow

1. **Create Test Stripe Checkout**:
   - Use Stripe test mode
   - Purchase PulseMarket product
   - Note session ID

2. **Manual Booking Test**:
   ```bash
   # Get available slots
   curl "http://localhost:3050/api/booking/availability?date=2026-04-15"

   # Create booking
   curl -X POST "http://localhost:3050/api/booking/create" \
     -H "Content-Type: application/json" \
     -d '{
       "session_id": "cs_test_...",
       "date": "2026-04-15",
       "time": "09:00:00"
     }'
   ```

3. **Test Reminders**:
   ```bash
   # Trigger cron manually
   curl "http://localhost:3050/api/cron/onboarding-reminders" \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

### Test Google Calendar

```typescript
import { createCalendarEvent, getBookedSlots } from '@/lib/google-calendar/client';

// Test event creation
const result = await createCalendarEvent({
  title: 'Test Onboarding',
  startTime: new Date('2026-04-15T09:00:00'),
  endTime: new Date('2026-04-15T09:30:00'),
  attendees: ['test@example.com'],
  description: 'Test event',
});

console.log('Event created:', result.eventId);
```

## Security

### Authentication
- Booking endpoint: Public (no auth) - validated via Stripe session
- Cron endpoint: Protected by `CRON_SECRET` header
- Rep dashboard: Protected by Supabase auth
- Admin operations: Role-based access control

### Data Protection
- No PII stored in Google Calendar (only names and emails)
- RLS policies restrict data access by distributor
- Stripe session validation prevents fake bookings

## Performance

### Optimization
- Database indexes on `scheduled_date`, `scheduled_time`, `status`
- Google Calendar caching (fallback to database)
- Cron runs every 15 minutes (lightweight)
- Email sending is async

### Scaling
- Current capacity: ~100 bookings/day (48 slots × 2 days visible)
- Database: Handles 10,000+ records easily
- Google Calendar: No rate limit concerns for this volume
- Email: Resend has generous limits

## Future Enhancements

### Possible Improvements
1. **Rescheduling**: Allow clients to reschedule without contacting support
2. **Cancellation**: Self-service cancellation (2hr+ notice)
3. **Timezone Support**: Auto-detect customer timezone
4. **Video Platform**: Switch from Dialpad to Zoom/Teams if needed
5. **Calendar Sync**: ICS file download for customer's calendar
6. **SMS Reminders**: Add Twilio SMS reminders
7. **Multi-language**: Translate emails and booking page
8. **Admin Dashboard**: View all bookings across all reps
9. **No-show Tracking**: Mark and follow up on no-shows
10. **Analytics**: Booking conversion rates, attendance rates

## Support

### Common Questions

**Q: Can customers book same-day sessions?**
A: No, 24-hour minimum notice is enforced.

**Q: What if a customer misses their session?**
A: Mark as "no_show" in admin panel. Rep should follow up manually.

**Q: Can BotMakers block out vacation time?**
A: Yes, add events to Google Calendar. System will detect and block slots.

**Q: What if Google Calendar goes down?**
A: System continues using database-only booking. Manual calendar entry needed.

**Q: How do I test without sending real emails?**
A: Use email testing service or configure Resend test mode.

## License

Internal use only - Apex Affinity Group
