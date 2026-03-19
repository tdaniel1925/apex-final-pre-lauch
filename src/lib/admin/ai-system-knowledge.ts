// =============================================
// AI System Knowledge Base
// Complete documentation of the system for AI context
// =============================================

export const SYSTEM_KNOWLEDGE = `
# APEX AFFINITY GROUP SYSTEM DOCUMENTATION

## DATABASE SCHEMA

### DISTRIBUTORS TABLE (Primary)
The core table containing all distributor information:

**Columns:**
- id (UUID) - Primary key
- auth_user_id (UUID) - Links to Supabase auth
- first_name, last_name - Person's name
- email - Primary email address
- phone - Contact number
- company_name - Optional business name
- slug - Unique URL slug for landing pages
- affiliate_code - 8-character tracking code
- rep_number - Sequential number assigned at signup

**MLM Structure Fields:**
- sponsor_id (UUID) - Who recruited them (direct upline)
- matrix_parent_id (UUID) - Their parent in the binary matrix tree
- matrix_position (1-5) - Which position under parent
- matrix_depth (number) - How deep in the matrix (1-7)

**Status Fields:**
- status - 'active', 'suspended', 'deleted'
- suspended_at, suspended_by, suspension_reason
- deleted_at, deleted_by

**Admin Fields:**
- is_admin (boolean) - Whether they have admin access
- admin_role - 'super_admin', 'admin', 'support', 'viewer', or null

**Profile Fields:**
- address_line1, address_line2, city, state, zip
- profile_photo_url
- bio
- social_links (JSON) - Facebook, LinkedIn, Twitter, Instagram

**Banking/Payment:**
- bank_name, bank_routing_number, bank_account_number
- bank_account_type - 'checking' or 'savings'
- ach_verified (boolean)
- ach_verified_at

**Tax Information:**
- tax_id (encrypted SSN or EIN)
- tax_id_type - 'ssn' or 'ein'
- date_of_birth

**Licensing:**
- licensing_status - 'licensed' or 'non_licensed'
- is_licensed_agent (boolean)
- licensing_verified (boolean)
- licensing_verified_at, licensing_verified_by

**Onboarding:**
- onboarding_completed (boolean)
- onboarding_step (1-5) - Current step if incomplete
- onboarding_completed_at
- onboarding_permanently_skipped (boolean)

**Flags:**
- is_master (boolean) - Root of genealogy tree
- profile_complete (boolean)

**Timestamps:**
- created_at, updated_at

### PROSPECTS TABLE
Potential distributors captured via forms:
- id, first_name, last_name, email, phone
- state, zip
- interest_level - 'high', 'medium', 'low'
- status - 'new', 'contacted', 'converted', 'lost'
- created_by (UUID) - Which distributor captured them
- converted_to_distributor_id (UUID) - If they signed up
- notes (text)
- created_at, updated_at

### COMMISSIONS TABLE
Earnings and payouts:
- id
- distributor_id (UUID) - Who earned it
- amount (decimal) - Dollar amount
- commission_type - 'direct', 'override', 'bonus', 'residual'
- level (number) - How many levels deep
- source_distributor_id (UUID) - Who generated the sale
- payout_id (UUID) - Links to payout batch
- status - 'pending', 'approved', 'paid'
- created_at

### PRODUCTS TABLE
Items available for purchase:
- id, name, description
- price (decimal)
- recurring (boolean) - Is this a subscription?
- billing_interval - 'monthly', 'yearly', 'one_time'
- stripe_product_id, stripe_price_id
- active (boolean)
- created_at, updated_at

### EMAIL_TEMPLATES TABLE
System email templates:
- id, name, subject, body
- template_type - 'welcome', 'password_reset', 'notification', etc.
- variables (JSON array) - Available merge fields
- active (boolean)
- created_at, updated_at

### BUSINESS_CARD_TEMPLATES TABLE
Customizable business card designs:
- id, name, preview_image_url
- template_data (JSON) - Design specifications
- active (boolean)

### SOCIAL_CONTENT TABLE
Pre-made social media posts:
- id, title, content
- content_type - 'image', 'video', 'text'
- media_url
- platform - 'facebook', 'instagram', 'linkedin', 'twitter'
- created_at

### TRAINING_CONTENT TABLE
Training materials:
- id, title, description, content_type
- video_url, audio_url, document_url
- duration_minutes
- order_index (for sequencing)
- created_at

### ACTIVITY_LOGS TABLE
System audit trail:
- id
- admin_id (UUID) - Who performed the action
- action_type - 'login', 'update', 'delete', 'email_change', etc.
- target_type - 'distributor', 'product', 'email_template', etc.
- target_id (UUID)
- details (JSON) - What changed
- ip_address
- created_at

## MLM STRUCTURE EXPLANATION

### Sponsor vs Matrix Parent
- **sponsor_id**: Who recruited you (genealogy/downline tree)
  - Determines commission flow
  - Can have unlimited direct recruits
  - Example: If John recruits Mary, John is Mary's sponsor

- **matrix_parent_id**: Your parent in the binary matrix
  - Each parent can have exactly 5 children (positions 1-5)
  - Used for bonus calculations
  - May be different from sponsor if sponsor's positions are full
  - Example: John recruits Mary, but John's 5 positions are full, so Mary is placed under John's downline member Sarah

### Matrix Positions
- Position 1-5: Left to right under a parent
- matrix_depth: How deep in tree (1 = root level, 7 = max depth)
- System uses BFS (breadth-first search) to find next available position

### Key Relationships
- Direct Recruits: WHERE sponsor_id = {distributor_id}
- Matrix Children: WHERE matrix_parent_id = {distributor_id}
- Downline (all levels): Recursive query on sponsor_id
- Upline: Traverse sponsor_id upward

## COMMON QUERIES

### Find all direct recruits
\`\`\`sql
SELECT * FROM distributors
WHERE sponsor_id = '{distributor_id}'
AND status != 'deleted'
\`\`\`

### Find matrix children
\`\`\`sql
SELECT * FROM distributors
WHERE matrix_parent_id = '{distributor_id}'
AND status != 'deleted'
\`\`\`

### Get team statistics
\`\`\`sql
-- Direct recruits
SELECT COUNT(*) FROM distributors
WHERE sponsor_id = '{distributor_id}'
AND status = 'active'

-- Matrix fill percentage
SELECT COUNT(*) FROM distributors
WHERE matrix_parent_id = '{distributor_id}'
-- Result / 5 * 100 = percentage
\`\`\`

### Find distributors by location
\`\`\`sql
SELECT * FROM distributors
WHERE state = 'TX'
AND status = 'active'
\`\`\`

Using query_database:
\`\`\`json
{
  "table": "distributors",
  "filters": {"state": "TX", "status": "active"}
}
\`\`\`

### Get recent signups
\`\`\`sql
SELECT * FROM distributors
WHERE created_at >= '2024-01-01'
ORDER BY created_at DESC
\`\`\`

Using query_database:
\`\`\`json
{
  "table": "distributors",
  "filters": {"created_at__gte": "2024-01-01"},
  "orderBy": "created_at",
  "orderDirection": "desc"
}
\`\`\`

### Find high-value commissions
\`\`\`json
{
  "table": "commissions",
  "filters": {"amount__gt": 1000},
  "orderBy": "amount",
  "orderDirection": "desc"
}
\`\`\`

## AVAILABLE AI FUNCTIONS

### 1. get_distributor_info
**Use for:** Looking up a specific person
**Input:** Name, email, rep number, or slug
**Returns:** Complete profile including team stats, matrix, commissions, banking, etc.
**Examples:**
- "find john smith"
- "get info for rep #12345"
- "look up john@email.com"

### 2. query_database
**Use for:** Custom queries on any table
**Input:** table name, filters, ordering
**Returns:** Matching rows
**Examples:**
- "show all prospects from this month"
- "list products where price > 100"
- "find suspended distributors in Texas"

### 3. search_distributors
**Use for:** Filtering distributors by state/status
**Input:** state, status, limit
**Returns:** List of distributors
**Examples:**
- "find distributors in California"
- "show all suspended accounts"

### 4. move_rep_sponsor
**Use for:** Changing someone's upline
**Input:** distributor identifier, new sponsor identifier
**Confirmation:** Required (destructive action)
**Examples:**
- "move rep john smith under jane doe"

### 5. update_status
**Use for:** Suspend/activate/delete accounts
**Input:** distributor identifier, action, optional reason
**Confirmation:** Required
**Examples:**
- "suspend john@email.com for non-payment"
- "activate rep #12345"
- "delete distributor jane smith"

### 6. reset_password
**Use for:** Send password reset email
**Input:** distributor identifier
**Examples:**
- "reset password for john@email.com"

### 7. change_email
**Use for:** Update email address
**Input:** distributor identifier, new email
**Confirmation:** Required
**Examples:**
- "change email for john smith to newemail@example.com"

### 8. change_admin_role
**Use for:** Grant/revoke admin access
**Input:** distributor identifier, role
**Confirmation:** Required
**Roles:** 'super_admin', 'admin', 'support', 'viewer', 'none'
**Examples:**
- "make john smith a super admin"
- "remove admin access from jane doe"

## BUSINESS LOGIC

### Distributor Lifecycle
1. **Signup** → Creates auth user + distributor record
2. **Onboarding** → 5-step wizard (profile, tax info, banking, etc.)
3. **Active** → Can recruit, earn commissions
4. **Suspended** → Temporarily inactive, can be reactivated
5. **Deleted** → Soft delete, can be recovered

### Commission Flow
- Commissions calculated when sales occur
- Flow up sponsor chain (not matrix)
- Levels: Direct (level 1), Override (levels 2-7)
- Payout occurs monthly/weekly (configurable)

### Matrix Placement
- New signup → System finds next available position
- Uses BFS algorithm starting from their sponsor
- If sponsor full → Placed under sponsor's downline
- Max depth: 7 levels

## SEARCH TIPS

### Name Matching
- Fuzzy matching enabled
- Handles typos: "charales potter" → "charles potter"
- Searches first name, last name, or full name
- Case-insensitive

### Multiple Matches
- If 2+ people match, shows numbered list
- Ask user to clarify with rep number or email

### Filters
- State codes: Use 2-letter (TX, CA, NY)
- Statuses: 'active', 'suspended', 'deleted'
- Dates: Use ISO format (YYYY-MM-DD)

## SECURITY NOTES

- Never expose tax IDs or full bank account numbers
- ACH data shown as verified/not verified only
- Admin actions are logged to activity_logs
- Destructive actions require confirmation
`;
