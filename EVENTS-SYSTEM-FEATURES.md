# Company Events System - Advanced Features

## ✅ Completed Features

### 1. Auto Soft-Delete (2 Hours After Event Ends)
- **Migration**: `20260319000015_add_event_templates_and_recurrence.sql`
  - Added `archived_at` column to `company_events` table
- **Cron Job**: `/api/cron/cleanup-events` (runs every hour)
  - Automatically sets `archived_at` timestamp for events that ended 2+ hours ago
  - Soft delete allows admins to still view archived events
- **Query Updates**: All event queries now filter `WHERE archived_at IS NULL`
  - Updated: `/api/admin/events` (admin list)
  - Updated: `/api/autopilot/events` (distributor API)

### 2. Event Templates
- **Database**: `event_templates` table created
  - Reusable event configurations
  - Tracks usage count
  - Can be activated/deactivated
- **API Endpoints**:
  - `GET /api/admin/event-templates` - List all templates
  - `POST /api/admin/event-templates` - Create new template
  - `GET /api/admin/event-templates/[id]` - Get template by ID
  - `PUT /api/admin/event-templates/[id]` - Update template
  - `DELETE /api/admin/event-templates/[id]` - Delete template (if not in use)
- **Features**:
  - Save frequently-used event configurations
  - Load from template when creating new event
  - Prevents deletion of templates in use

### 3. Recurring Events
- **Database**: `recurring_events` table created
  - Supports daily, weekly, monthly recurrence
  - JSON recurrence rules with flexible configuration
  - Auto-generation tracking
- **API Endpoints**:
  - `GET /api/admin/recurring-events` - List recurring series
  - `POST /api/admin/recurring-events` - Create recurring series
- **Cron Job**: `/api/cron/generate-recurring-events` (runs daily at 2 AM)
  - Generates future event instances (90 days ahead)
  - Respects end dates and max occurrences
  - Updates generation tracking
- **Recurrence Options**:
  - **Daily**: Every N days
  - **Weekly**: Specific days of week, every N weeks
  - **Monthly**: Specific day of month, every N months
  - Optional end date or max occurrences

## 📋 Database Schema

### company_events (new columns)
- `template_id` - Links to template used (nullable)
- `recurring_event_id` - Links to recurring series (nullable)
- `archived_at` - Soft delete timestamp (nullable)
- `is_template` - Flag for saved templates (boolean)
- `recurrence_instance_date` - Which date in series (date)

### event_templates
- `id`, `created_at`, `updated_at`
- `name`, `description`, `event_type`
- `default_title`, `default_description`, `default_location`
- `default_duration_minutes`, `default_max_attendees`, `default_status`
- `created_by`, `usage_count`, `is_active`

### recurring_events
- `id`, `created_at`, `updated_at`
- `series_name`, `description`
- `recurrence_rule` (JSONB)
- `start_date`, `end_date`
- `last_generated_date`, `next_generation_date`
- `created_by`, `is_active`, `total_instances_created`

## ⚙️ Configuration

### Environment Variables
```env
CRON_SECRET=apex_cron_secret_2026_secure_key_for_event_cleanup
```

### Vercel Cron Jobs
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-events",
      "schedule": "0 * * * *"  // Every hour
    },
    {
      "path": "/api/cron/generate-recurring-events",
      "schedule": "0 2 * * *"  // Daily at 2 AM
    }
  ]
}
```

## 🚀 Next Steps (UI)

### Remaining Tasks:
1. **Update EventForm** - Add template loading dropdown
2. **Create Template Management Page** - CRUD interface for templates
3. **Create Recurring Events Form** - UI for setting up recurring series
4. **Add "Save as Template" Button** - Save existing events as templates
5. **Add Archived Events View** - Allow admins to view/restore archived events

## 📝 Migration Instructions

**IMPORTANT**: Apply the migration before using these features:

```sql
-- Run the migration file in Supabase SQL Editor:
-- supabase/migrations/20260319000015_add_event_templates_and_recurrence.sql
```

## 🎯 Usage Examples

### Creating a Template
```typescript
POST /api/admin/event-templates
{
  "name": "Weekly Product Training",
  "event_type": "training",
  "default_title": "Product Training Session",
  "default_duration_minutes": 90,
  "default_location": "Main Office Conference Room",
  "is_active": true
}
```

### Creating Recurring Events
```typescript
POST /api/admin/recurring-events
{
  "series_name": "Weekly Team Meeting",
  "recurrence_rule": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": [1, 3, 5],  // Mon, Wed, Fri
    "endDate": "2026-12-31"
  },
  "start_date": "2026-03-20",
  "event_template": {
    "event_name": "Team Standup",
    "event_type": "training",
    "event_duration_minutes": 30,
    "location_type": "virtual",
    "virtual_meeting_link": "https://zoom.us/j/123456789",
    "status": "active"
  }
}
```

## ✨ Benefits

1. **Auto-Cleanup**: Events automatically archive 2 hours after completion, keeping lists clean
2. **Templates**: Save time by reusing common event configurations
3. **Recurring Events**: Set up event series once, let the system generate future instances
4. **Smart Generation**: Cron job ensures events are always generated 90 days ahead
5. **Soft Delete**: Archived events can still be viewed/audited by admins

---

**Status**: Backend complete, UI pending migration application
