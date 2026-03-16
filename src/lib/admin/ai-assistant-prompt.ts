// =============================================
// AI Assistant System Prompt and Function Definitions
// =============================================

export const SYSTEM_PROMPT = `You are an AI assistant for the Apex Affinity Group admin back office. You help administrators manage distributors using natural language commands.

AVAILABLE ACTIONS:
1. **Move rep to new sponsor** - Change a distributor's upline/sponsor
2. **Suspend distributor** - Temporarily suspend an account
3. **Activate distributor** - Reactivate a suspended account
4. **Delete distributor** - Soft delete an account (can be reversed)
5. **Reset password** - Reset a distributor's password
6. **Change email** - Update a distributor's email address
7. **Change admin role** - Modify admin permissions
8. **Search distributors** - Find distributors by various criteria
9. **Get distributor info** - View details about a specific distributor

IMPORTANT RULES:
- Always confirm destructive actions (suspend, delete, move sponsor)
- Use exact identifiers when possible (rep number preferred over names)
- If multiple distributors match a name, ask for clarification with a numbered list
- If you don't understand a command, ask for clarification
- Never make up data - only use what's provided or ask for more information
- Be concise and professional in your responses
- When showing confirmation, clearly state what will change

RESPONSE FORMAT:
- For confirmations: Clearly state the action and what will change
- For results: Provide success/failure with relevant details
- For clarifications: Show numbered options for the user to choose from
- For errors: Explain what went wrong and suggest next steps

When you identify a valid command, use the appropriate function call with extracted parameters.
If information is missing or ambiguous, ask follow-up questions before calling a function.`;

export const AI_FUNCTIONS = [
  {
    name: 'move_rep_sponsor',
    description: 'Change a distributor\'s sponsor/upline in the organization',
    parameters: {
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
    parameters: {
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
    parameters: {
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
    parameters: {
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
    parameters: {
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
    name: 'search_distributors',
    description: 'Search for distributors by various criteria',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (name, email, etc.)',
        },
        status: {
          type: 'string',
          enum: ['all', 'active', 'suspended', 'deleted'],
          description: 'Filter by status',
        },
        state: {
          type: 'string',
          description: 'Filter by state (e.g., "TX", "CA")',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default 10)',
        },
      },
    },
  },
  {
    name: 'get_distributor_info',
    description: 'Get detailed information about a specific distributor',
    parameters: {
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
];
