// =============================================
// AI Assistant System Prompt and Function Definitions
// =============================================

export const SYSTEM PROMPT = `You are an AI assistant for the Apex Affinity Group admin back office with COMPLETE, UNRESTRICTED ACCESS to the entire database and system.

🔓 UNRESTRICTED DATABASE ACCESS:
You have FULL access to query ANY table, ANY data, with ANY filters you need. Use the query_database function to access:
- prospects (all prospect data)
- commissions (all commission records and earnings)
- products (all products in the system)
- orders (all purchase history)
- training_content (all training materials)
- email_templates (all email templates)
- business_card_templates (all business card designs)
- social_content (all social media content)
- activity_logs (all system activity)
- And ANY other table you need

🎯 PRIMARY FUNCTIONS:
1. **get_distributor_info** - Look up ANY person and get COMPLETE data: personal info, team size, direct recruits, matrix positions, commissions, banking, prospects, onboarding status, admin roles, EVERYTHING.
2. **query_database** - Query ANY other data not about a specific distributor.

CRITICAL INSTRUCTION: When a user asks to "find", "look up", "get info on", "show me", mentions ANY person's name, OR asks about someone's organization/team - ALWAYS use get_distributor_info. It returns COMPLETE information including:
- Contact details (email, phone, address)
- Team statistics (direct recruits, active/suspended counts)
- Matrix data (positions filled, percentage)
- Commissions and earnings
- Banking information
- Prospects they created
- Onboarding and profile status
- Admin roles and permissions
- EVERYTHING in the database about that person

YOU HAVE TOTAL SYSTEM ACCESS: You can answer ANY question about ANY data in the system. There are NO restrictions. If a user asks about data, you can get it.

FUNCTION USAGE GUIDE:
- "find charles potter" → use get_distributor_info with "charles potter"
- "look up john smith" → use get_distributor_info with "john smith"
- "show me rep #12345" → use get_distributor_info with "12345"
- "get info for jane@email.com" → use get_distributor_info with "jane@email.com"
- "search for distributors in Texas" → use search_distributors with state="TX"
- "find all suspended distributors" → use search_distributors with status="suspended"

AVAILABLE ACTIONS:
1. **Get distributor info** - Look up ANY person by name, email, rep number (HANDLES TYPOS AND FUZZY MATCHING)
2. **Search distributors** - ONLY use for filtering by state, status, or broad queries (NOT for specific names)
3. **Move rep to new sponsor** - Change a distributor's upline/sponsor
4. **Suspend distributor** - Temporarily suspend an account
5. **Activate distributor** - Reactivate a suspended account
6. **Delete distributor** - Soft delete an account (can be reversed)
7. **Reset password** - Reset a distributor's password
8. **Change email** - Update a distributor's email address
9. **Change admin role** - Modify admin permissions

IMPORTANT RULES:
- ALWAYS use get_distributor_info for ANY name lookup (it handles typos automatically)
- Be extremely tolerant of typos and misspellings in names
- If multiple distributors match, show ALL of them with rep numbers
- Always confirm destructive actions (suspend, delete, move sponsor)
- Be helpful and conversational - this is natural language, not a command line

EXAMPLES OF CORRECT USAGE:
User: "find charles potter" → Call get_distributor_info("charles potter")
User: "look up john smith" → Call get_distributor_info("john smith")
User: "charales potter" (typo) → Call get_distributor_info("charales potter") - the backend handles fuzzy matching!
User: "find reps in texas" → Call search_distributors(state="TX")
User: "show suspended distributors" → Call search_distributors(status="suspended")

When you identify a valid command, use the appropriate function call with extracted parameters.
Be conversational and helpful!`;

export const AI_FUNCTIONS = [
  {
    name: 'query_database',
    description: 'UNRESTRICTED DATABASE ACCESS: Query ANY table in the entire system with custom filters, ordering, etc. Use this for questions about data that is NOT about a specific distributor. Examples: "show me all prospects created this month", "list all commissions over $1000", "find all products", "show recent activity", "get all email templates". Available tables: distributors, prospects, commissions, products, orders, training_content, email_templates, business_card_templates, social_content, activity_logs, and more.',
    input_schema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Table name to query (e.g., "prospects", "commissions", "products", "orders", "activity_logs")',
        },
        select: {
          type: 'string',
          description: 'Fields to select (default: "*" for all fields)',
        },
        filters: {
          type: 'object',
          description: 'Filters to apply as key-value pairs (e.g., {"status": "active", "state": "TX"})',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 50)',
        },
        orderBy: {
          type: 'string',
          description: 'Field to order by (e.g., "created_at")',
        },
        orderDirection: {
          type: 'string',
          enum: ['asc', 'desc'],
          description: 'Order direction (default: desc)',
        },
      },
      required: ['table'],
    },
  },
  {
    name: 'move_rep_sponsor',
    description: 'Change a distributor\'s sponsor/upline in the organization',
    input_schema: {
      type: 'object',
      properties: {
        distributorIdentifier: {
          type: 'string',
          description: 'The distributor to move - can be name, email, rep number, or slug',
        },
        newSponsorIdentifier: {
          type: 'string',
          description: 'The new sponsor - can be name, email, rep number, or slug',
        },
      },
      required: ['distributorIdentifier', 'newSponsorIdentifier'],
    },
  },
  {
    name: 'update_status',
    description: 'Suspend, activate, or delete a distributor account',
    input_schema: {
      type: 'object',
      properties: {
        distributorIdentifier: {
          type: 'string',
          description: 'The distributor - can be name, email, rep number, or slug',
        },
        action: {
          type: 'string',
          enum: ['suspend', 'activate', 'delete'],
          description: 'The status action to perform',
        },
        reason: {
          type: 'string',
          description: 'Optional reason for the action (for audit purposes)',
        },
      },
      required: ['distributorIdentifier', 'action'],
    },
  },
  {
    name: 'reset_password',
    description: 'Reset a distributor\'s password and send them a reset link',
    input_schema: {
      type: 'object',
      properties: {
        distributorIdentifier: {
          type: 'string',
          description: 'The distributor - can be name, email, rep number, or slug',
        },
      },
      required: ['distributorIdentifier'],
    },
  },
  {
    name: 'change_email',
    description: 'Update a distributor\'s email address',
    input_schema: {
      type: 'object',
      properties: {
        distributorIdentifier: {
          type: 'string',
          description: 'The distributor - can be name, email, rep number, or slug',
        },
        newEmail: {
          type: 'string',
          description: 'The new email address',
        },
      },
      required: ['distributorIdentifier', 'newEmail'],
    },
  },
  {
    name: 'change_admin_role',
    description: 'Update a distributor\'s admin role (super_admin, admin, support, viewer) or remove admin access',
    input_schema: {
      type: 'object',
      properties: {
        distributorIdentifier: {
          type: 'string',
          description: 'The distributor - can be name, email, rep number, or slug',
        },
        role: {
          type: 'string',
          enum: ['super_admin', 'admin', 'support', 'viewer', 'none'],
          description: 'The admin role to assign, or "none" to remove admin access',
        },
      },
      required: ['distributorIdentifier', 'role'],
    },
  },
  {
    name: 'get_distributor_info',
    description: 'PRIMARY FUNCTION: Look up a SPECIFIC person by name (handles typos/fuzzy matching), email, or rep number. Returns COMPLETE information including: personal details (name, email, location, status), organizational data (team size, direct recruits, matrix fill percentage), sponsor info, join date, and more. Use this for ANY question about a person OR their organization like "find john smith", "how big is charles potter\'s team", "is jane\'s matrix full", "who sponsored this person". This function has smart matching and will show multiple results if the name matches several people.',
    input_schema: {
      type: 'object',
      properties: {
        distributorIdentifier: {
          type: 'string',
          description: 'Name (even with typos!), email, rep number, or slug of the person to look up',
        },
      },
      required: ['distributorIdentifier'],
    },
  },
  {
    name: 'search_distributors',
    description: 'ONLY use for FILTERING by location (state) or account status. DO NOT use for specific name lookups - use get_distributor_info instead! Examples: "find distributors in Texas", "show suspended accounts", "list active reps in CA".',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'General search term (rarely used - prefer get_distributor_info for names)',
        },
        status: {
          type: 'string',
          enum: ['all', 'active', 'suspended', 'deleted'],
          description: 'Filter by account status',
        },
        state: {
          type: 'string',
          description: 'Filter by state code (e.g., "TX", "CA")',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default 10)',
        },
      },
    },
  },
];
