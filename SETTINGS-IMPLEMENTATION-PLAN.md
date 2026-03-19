# Settings System Implementation Plan

## Overview
Build a comprehensive admin settings system with database-backed configuration management.

## Settings Categories

### 1. **General Settings**
- Site name
- Company name
- Support email
- Support phone
- Timezone
- Date format
- Currency (USD)

### 2. **Branding**
- Logo URL
- Favicon URL
- Primary color
- Secondary color
- Site tagline

### 3. **Email Configuration**
- SMTP host
- SMTP port
- SMTP username
- SMTP password (encrypted)
- From email
- From name
- Reply-to email

### 4. **Compensation Settings** (Already in config.ts, make editable)
- Override qualification minimum (currently 50 credits)
- Rank grace period (currently 2 months)
- New rep rank lock (currently 6 months)
- Waterfall percentages (BotMakers fee, Apex take, pools)
- Business Center fixed amounts

### 5. **Matrix Rules**
- Auto-placement enabled
- Spillover strategy
- Max width per level
- Orphan handling

### 6. **Notifications**
- New member signup alerts
- Rank advancement alerts
- Commission run alerts
- Low activity alerts

### 7. **API Keys** (Encrypted)
- Stripe API key
- Supabase keys (read-only display)
- Email service API keys
- SMS provider keys

### 8. **Feature Flags**
- Signup enabled
- Commissions enabled
- Public registration
- Maintenance mode

---

## Database Schema

### Table: `system_settings`

```sql
CREATE TABLE system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL, -- 'general', 'branding', 'email', etc.
  key text NOT NULL UNIQUE, -- 'site_name', 'smtp_host', etc.
  value text, -- JSON or plain text
  value_type text NOT NULL DEFAULT 'string', -- 'string', 'number', 'boolean', 'json', 'encrypted'
  is_secret boolean DEFAULT false, -- If true, hide in UI
  description text, -- Help text for admins
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE UNIQUE INDEX idx_system_settings_key ON system_settings(key);
```

### Table: `setting_audit_log`

```sql
CREATE TABLE setting_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_id uuid REFERENCES system_settings(id),
  setting_key text NOT NULL,
  old_value text,
  new_value text,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

CREATE INDEX idx_setting_audit_log_setting_id ON setting_audit_log(setting_id);
CREATE INDEX idx_setting_audit_log_changed_at ON setting_audit_log(changed_at DESC);
```

---

## Seed Data

Default settings to populate on first run:

```typescript
const DEFAULT_SETTINGS = [
  // General
  { category: 'general', key: 'site_name', value: 'Apex Admin', valueType: 'string', description: 'Site name shown in header' },
  { category: 'general', key: 'company_name', value: 'Apex', valueType: 'string', description: 'Legal company name' },
  { category: 'general', key: 'support_email', value: 'support@apex.com', valueType: 'string' },
  { category: 'general', key: 'timezone', value: 'America/New_York', valueType: 'string' },

  // Branding
  { category: 'branding', key: 'primary_color', value: '#3b82f6', valueType: 'string', description: 'Primary brand color (hex)' },
  { category: 'branding', key: 'logo_url', value: '/logo.png', valueType: 'string' },

  // Compensation
  { category: 'compensation', key: 'override_min_credits', value: '50', valueType: 'number', description: 'Minimum credits to earn overrides' },
  { category: 'compensation', key: 'rank_grace_period_months', value: '2', valueType: 'number' },
  { category: 'compensation', key: 'new_rep_lock_months', value: '6', valueType: 'number' },

  // Feature Flags
  { category: 'features', key: 'signup_enabled', value: 'true', valueType: 'boolean' },
  { category: 'features', key: 'commissions_enabled', value: 'true', valueType: 'boolean' },
  { category: 'features', key: 'maintenance_mode', value: 'false', valueType: 'boolean' },
];
```

---

## API Endpoints

### `GET /api/admin/settings`
- Returns all settings grouped by category
- Filters out secrets (only shows "[ENCRYPTED]" placeholder)
- Admin only

### `GET /api/admin/settings/:key`
- Returns specific setting
- Admin only

### `PUT /api/admin/settings/:key`
- Updates specific setting
- Validates value based on value_type
- Creates audit log entry
- Admin only

### `POST /api/admin/settings/bulk-update`
- Updates multiple settings at once
- Validates all before committing
- Creates audit log entries
- Admin only

---

## Admin UI Components

### Settings Page Layout
- Tab navigation by category
- Form fields based on value_type
- Real-time validation
- Save button (saves all changes in category)
- Reset button (reverts to defaults)
- Audit log viewer (expandable)

### Field Types
- `string` → Text input
- `number` → Number input
- `boolean` → Toggle switch
- `json` → JSON editor (with validation)
- `encrypted` → Password input (shows "[ENCRYPTED]" when saved)

### Validation Rules
- Email fields: validate email format
- URL fields: validate URL format
- Color fields: validate hex color
- Number fields: min/max constraints

---

## Implementation Steps

1. ✅ **Create migration** for `system_settings` and `setting_audit_log` tables
2. ✅ **Seed default settings** into database
3. ✅ **Build API endpoints** for CRUD operations
4. ✅ **Build Settings UI** with tabbed interface
5. ✅ **Add audit log viewer** to track changes
6. ✅ **Test all functionality** end-to-end

---

## Security Considerations

- All settings endpoints require admin authentication
- Secret values encrypted at rest
- Audit log tracks all changes with IP + user agent
- RLS policies prevent direct table access
- Validation prevents injection attacks

---

## Future Enhancements

- Settings export/import (JSON backup)
- Settings versioning (rollback to previous config)
- Environment-specific overrides (dev/staging/prod)
- Settings validation hooks (e.g., test SMTP before saving)
- Settings groups (enable/disable feature sets)
