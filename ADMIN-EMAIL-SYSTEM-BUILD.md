# Admin Email System with AI - Build Documentation

## Overview

Built a comprehensive AI-powered email management system at `/admin/emails` that allows admins to create and send professional emails to distributors using conversational AI.

## Features

### Tab 1: Send Email
- **AI Email Assistant**: Chat with AI to describe what email you want
- **Live Preview**: See instant preview of email in Apex template
- **Recipient Filtering**: Select all reps or filter by:
  - Licensed/Non-Licensed
  - Has Phone/No Phone
  - Search by name/email
- **Batch Sending**: Send to multiple recipients at once with tracking

### Tab 2: Customize Template
- **AI Template Designer**: Chat with AI to modify email template design
- **Live Preview**: See changes in real-time
- **Save/Reset**: Save custom template or reset to default
- **All future emails**: Customizations apply to all future admin emails

## Files Created

### Frontend Components

**`src/app/admin/emails/page.tsx`**
- Main admin page
- Admin authentication check using `requireAdmin()`
- Renders `EmailManagementSystem` component

**`src/components/admin/EmailManagementSystem.tsx`**
- Container component with two-tab system
- Tab switching between Send Email and Customize Template
- Passes admin ID to child components

**`src/components/admin/email-system/SendEmailTab.tsx`**
- AI chat interface for email creation
- Message state management (user/assistant)
- Email subject and content state
- Recipient selection integration
- Send email button with recipient count

**`src/components/admin/email-system/EmailPreview.tsx`**
- Live preview component
- Shows subject line and HTML content
- Renders email safely with dangerouslySetInnerHTML
- Styled to match email appearance

**`src/components/admin/email-system/RecipientSelector.tsx`**
- Fetches distributors from `/api/admin/distributors`
- Filter buttons: All, Licensed, Non-Licensed, Has Phone, No Phone
- Search functionality by name/email
- Select All/Deselect All
- Checkbox list with distributor info badges

**`src/components/admin/email-system/CustomizeTemplateTab.tsx`**
- AI chat interface for template customization
- Loads current template on mount
- Live preview of template changes
- Save Template button (persists to database)
- Reset to Default button

### Backend API Routes

**`src/app/api/admin/emails/generate/route.ts`**
- POST endpoint for AI email generation
- Uses Anthropic Claude 3.5 Sonnet
- Accepts user message and conversation history
- Returns AI response, email subject, and HTML content
- Loads Apex base template for wrapping

**`src/app/api/admin/emails/send/route.ts`**
- POST endpoint for sending emails to recipients
- Fetches recipient emails from database by user IDs
- Uses `sendTrackedEmail()` for each recipient
- Tracks success/failure for each send
- Logs broadcast to `email_broadcasts` table

**`src/app/api/admin/emails/customize-template/route.ts`**
- POST endpoint for AI template customization
- Uses Anthropic Claude 3.5 Sonnet
- Accepts user message, conversation history, and current template
- Returns AI explanation and updated HTML template
- Extracts HTML from Claude's markdown code blocks

**`src/app/api/admin/emails/template/route.ts`**
- GET: Fetch current email template (custom or default)
- PUT: Save customized template to database
- Loads default template from `thank-you-training-email.html`
- Stores custom templates in `email_templates` table

**`src/app/api/admin/emails/template/reset/route.ts`**
- POST endpoint to reset template to default
- Deletes custom template from database
- Returns default Apex template

## Database Requirements

The system expects these tables to exist (may need migrations):

### `email_templates`
```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT UNIQUE NOT NULL,
  template_html TEXT NOT NULL,
  updated_by UUID REFERENCES admins(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `email_broadcasts`
```sql
CREATE TABLE email_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admins(id),
  subject TEXT NOT NULL,
  recipient_count INT NOT NULL,
  successful_count INT NOT NULL,
  failed_count INT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Dependencies Installed

- `@anthropic-ai/sdk` - For AI email generation and template customization

## AI Integration

### Claude 3.5 Sonnet Configuration

**Email Generation Prompt:**
- Generates professional, encouraging emails for network marketing distributors
- Returns HTML formatted content with inline styles
- Extracts subject line from AI response
- Uses Apex brand color (#2c5aa0)

**Template Customization Prompt:**
- Modifies HTML email templates
- Maintains email-compatible HTML (tables, inline CSS)
- Preserves Apex branding and logo
- Returns full updated template in markdown code blocks

## Email Sending Flow

1. Admin describes email content in chat
2. AI generates email subject and HTML content
3. Preview shown on right side
4. Admin selects recipients using filters
5. Admin clicks "Send Email to X Recipients"
6. Backend fetches recipient emails from database
7. For each recipient:
   - Send email using `sendTrackedEmail()`
   - Track success/failure
8. Log broadcast event to database
9. Show success message with count

## Template Customization Flow

1. Admin loads Customize Template tab
2. Current template loaded from database or default file
3. Admin describes desired changes in chat
4. AI modifies template HTML
5. Preview updates in real-time
6. Admin clicks "Save Template"
7. Template saved to database
8. All future emails use custom template

## Technical Notes

### Authentication
- Uses `getAdminUser()` for API routes (returns null if not authorized)
- Uses `requireAdmin()` for pages (redirects if not authorized)

### Email Tracking
- All emails sent through `sendTrackedEmail()` for cost tracking
- `skipTemplateWrap: true` because email already has full template
- Triggered by: `admin` with `feature: 'admin_broadcast'`

### Existing API Reuse
- RecipientSelector uses existing `/api/admin/distributors` endpoint
- No new distributor API needed

### AI Context Management
- Conversation history passed to maintain context
- Claude receives full chat to understand intent
- System prompts define role and constraints

## Testing Checklist

- [ ] Navigate to `/admin/emails` (requires admin auth)
- [ ] Tab 1: Send Email
  - [ ] Chat with AI to create email
  - [ ] Verify preview updates
  - [ ] Filter recipients (all, licensed, has phone, etc.)
  - [ ] Search recipients by name/email
  - [ ] Select/deselect recipients
  - [ ] Send email to test recipient
  - [ ] Verify email received with correct template
- [ ] Tab 2: Customize Template
  - [ ] Chat with AI to modify template
  - [ ] Verify preview updates
  - [ ] Save template
  - [ ] Send test email (should use custom template)
  - [ ] Reset to default
  - [ ] Verify default template restored

## Future Enhancements

Potential improvements:
- Email scheduling (send later)
- Email templates library (multiple saved templates)
- Email history/analytics dashboard
- A/B testing different email versions
- Email open/click tracking integration
- Unsubscribe management
- Email attachment support
- Rich text editor with AI assist
- Pre-built email templates (training announcements, etc.)

## Error Handling

- Admin auth failures return 401 Unauthorized
- Missing parameters return 400 Bad Request
- Database errors logged and return 500 Internal Server Error
- Email sending failures tracked per-recipient
- AI API errors show user-friendly message in chat

## Performance Considerations

- Recipient list loaded once on component mount
- AI responses typically 2-4 seconds
- Batch email sending is sequential (not parallel) to avoid rate limits
- Email tracking async (doesn't block response)
- Template loading cached in component state

---

**Build completed:** 2026-03-19
**Time estimate:** ~2-3 hours total development time
**AI Model Used:** Anthropic Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)
