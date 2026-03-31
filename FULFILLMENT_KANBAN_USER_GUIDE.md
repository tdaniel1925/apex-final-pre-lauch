# Fulfillment Kanban Board - User Guide

## For Admins

### Accessing the Kanban Board

1. Navigate to `/admin/fulfillment/kanban`
2. You'll see 8 columns representing the fulfillment stages

### Understanding the Stages

1. **Payment Made** - Client has purchased, payment received
2. **Onboarding Scheduled** - Client has booked onboarding session
3. **Onboarding Complete** - Onboarding session finished, deliverables verified
4. **Building Pages** - Creating landing pages and assets
5. **Creating Proofs** - Social media proofs being designed
6. **Content Approved** - Client approved all content
7. **Campaigns Live** - Marketing campaigns launched
8. **Completed** - Service fully delivered

### Moving Clients Between Stages

**Option 1: Drag and Drop**
1. Click and hold a client card
2. Drag to the desired stage column
3. Release to drop
4. System automatically:
   - Updates the database
   - Sends email to the rep
   - Creates activity feed entry
   - Adds in-app notification

**Option 2: Card Modal**
1. Click any client card to open details
2. Click "Move to Next Stage" button
3. Optionally add notes (visible to rep)
4. Click to confirm

### Searching and Filtering

**Search Bar:**
- Type client name or email
- Results filter in real-time
- Search works across all stages

**Product Filter:**
- Dropdown shows all products
- Select to show only clients with that product
- "All Products" shows everything

**Distributor Filter:**
- Dropdown shows all reps
- Select to show only that rep's clients
- "All Reps" shows everyone

### Understanding Card Colors

Cards have a colored left border indicating age:

- **Green** - Less than 3 days in current stage
- **Yellow** - 3-7 days in current stage
- **Red** - More than 7 days in current stage

Red cards may need attention or follow-up.

### Viewing Client Details

Click any card to see:
- Client name, email, phone
- Product purchased
- Current stage
- Date moved to current stage
- Complete stage history timeline
- Distributor (rep) information
- Onboarding details (if applicable)

### Adding Notes

1. Open card detail modal
2. Type notes in the text field
3. Click "Move to Next Stage" or update
4. Notes are included in the email to rep

**Use notes for:**
- Special instructions
- Issues encountered
- Client preferences
- Approval confirmations
- Next steps

---

## For Reps (Distributors)

### Accessing Your Client Dashboard

1. Navigate to `/dashboard/my-clients`
2. You'll see all your clients and their fulfillment status

### Understanding the Dashboard

**Stats Cards (Top):**
- **Active Clients** - In progress (not completed)
- **Completed** - Finished service delivery
- **Upcoming Sessions** - Scheduled onboarding calls
- **Total Clients** - All clients ever

**Client Fulfillment Table:**
Shows all your clients with:
- Client name and email
- Product purchased
- Current stage (color-coded badge)
- Last updated date
- View details action

### Stage Badge Colors

Each stage has a unique color:

- **Blue** - Payment Made
- **Purple** - Onboarding Scheduled
- **Indigo** - Onboarding Complete
- **Yellow** - Building Pages
- **Orange** - Creating Proofs
- **Cyan** - Content Approved
- **Teal** - Campaigns Live
- **Green** - Completed

### What You'll Receive

**Email Notifications:**
You'll receive an email every time a client moves to a new stage:

```
Subject: Client Progress Update: John Smith - AI Employee

Your client John Smith has moved to: Building Pages

Product: AI Employee Standard
Current Stage: Building Pages
Updated: March 31, 2026 2:30 PM

Admin Notes: Pages layout approved by team

[View Client Details Button]
```

**Activity Feed:**
Check your dashboard for activity entries about client progress.

**In-App Notifications:**
Bell icon in dashboard shows notifications about stage changes.

### Onboarding Sessions

**Upcoming Sessions Section:**
Shows scheduled onboarding calls with:
- Date and time
- Countdown timer
- Client contact info
- Join meeting button

**Reminders:**
You'll receive email reminders:
- 24 hours before session
- 4 hours before session
- 15 minutes before session

**Past Sessions Section:**
Shows completed onboarding calls for reference.

### Best Practices

1. **Check daily** - Review client progress each morning
2. **Follow up** - If client stuck in one stage too long
3. **Be available** - Join onboarding sessions on time
4. **Communicate** - Contact clients about progress
5. **Celebrate** - Congratulate clients when completed

### What You Can Do

- ✅ View all your clients
- ✅ See current stage for each client
- ✅ View onboarding session details
- ✅ Join scheduled meetings
- ✅ Contact clients (email/phone links)
- ✅ View stage history

### What You Cannot Do

- ❌ Change stages (admin only)
- ❌ View other reps' clients
- ❌ Edit client information
- ❌ Delete fulfillment records
- ❌ Add notes to stages

---

## Frequently Asked Questions

### For Admins

**Q: What happens if I drag a card backwards?**
A: You can move cards in any direction. The system updates the stage and sends notification regardless of direction.

**Q: Can I skip stages?**
A: Yes, drag directly to any stage. The system tracks all moves in the stage history.

**Q: What if a client email is wrong?**
A: Update the transaction metadata and fulfillment record in the database. Contact dev team if needed.

**Q: Can I delete a fulfillment record?**
A: No UI for deletion. Contact database admin to manually remove if needed.

**Q: How do I see stage history?**
A: Click the card to open modal. History is in the stage_history JSONB field.

### For Reps

**Q: Why don't I see a client I sold?**
A: Fulfillment records are created when payment is received. Check if payment completed in Stripe.

**Q: Can I change the stage?**
A: No, only admins can move clients between stages. Contact admin if you need a stage updated.

**Q: I didn't get an email notification.**
A: Check spam folder. Emails come from `theapex@theapexway.net`. Add to contacts.

**Q: How do I know when my client is done?**
A: You'll receive an email when stage moves to "Completed" (green badge in table).

**Q: Can I see other reps' clients?**
A: No, you only see your own clients for privacy.

---

## Troubleshooting

### Email Not Received

1. Check spam/junk folder
2. Add `theapex@theapexway.net` to contacts
3. Verify email address in distributor profile
4. Contact admin if still not receiving

### Stage Not Updating

1. Refresh the page
2. Check internet connection
3. Try different browser
4. Contact admin if issue persists

### Card Not Dragging

1. Make sure you're an admin
2. Try click-and-hold for 1 second before dragging
3. Use "Move to Next Stage" button in modal instead
4. Try different browser

### Client Not Appearing

1. Verify payment completed in Stripe
2. Check transaction was logged correctly
3. Verify distributor_id is correct
4. Contact dev team to check database

---

## Support

**For Admins:**
- Technical issues: Contact dev team
- Process questions: Contact operations manager
- Email delivery: Check Resend dashboard

**For Reps:**
- Can't access dashboard: Contact admin
- Missing clients: Contact admin
- Email not received: Contact admin
- Onboarding questions: Contact BotMakers team

---

## Tips for Success

### For Admins

1. **Morning routine** - Review board first thing, identify red cards
2. **Batch updates** - Move multiple clients at once during designated times
3. **Use notes** - Always add context when moving stages
4. **Monitor bottlenecks** - If many cards stuck in one stage, investigate
5. **Communicate** - Let reps know when making big changes

### For Reps

1. **Set alerts** - Enable browser notifications for stage changes
2. **Plan ahead** - Check upcoming sessions the night before
3. **Stay responsive** - Reply to stage update emails promptly
4. **Track metrics** - Monitor how long clients take to complete
5. **Celebrate wins** - Acknowledge when clients reach completion

---

## Quick Reference

### Admin Shortcuts

| Action | How To |
|--------|--------|
| Move stage | Drag card or use modal button |
| Add notes | Open card, type in notes field |
| Search | Type in search bar |
| Filter | Use dropdown menus |
| Refresh | Click "Refresh" button |

### Rep Shortcuts

| Action | How To |
|--------|--------|
| View clients | Go to /dashboard/my-clients |
| Check stage | Look at badge color in table |
| Join session | Click "Join Meeting" button |
| Contact client | Click email/phone link |
| View details | Click "View Details" in Actions column |

---

## Glossary

**Fulfillment** - Process of delivering purchased services to clients

**Stage** - Step in the fulfillment process (8 total)

**Kanban** - Visual board with columns and cards

**Auto-transition** - Automatic stage change (payment, booking)

**Manual transition** - Admin moves stage by drag/drop

**Stage history** - Timeline of all stage changes

**Activity feed** - Dashboard showing recent actions

**Notification** - Alert about stage change

**Card** - Visual representation of a client

**Badge** - Colored label showing current stage

---

## Version History

- **v1.0** (March 31, 2026) - Initial implementation
  - 8-stage pipeline
  - Auto-transitions for payment and booking
  - Email notifications
  - Admin Kanban board
  - Rep dashboard
