/**
 * Shared types for AI Chat tools
 */

export interface ToolContext {
  distributor: any;
  supabase: any;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}
