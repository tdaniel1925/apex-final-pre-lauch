// Inngest functions for proactive AI engagement
import { inngest } from '../client';
import { createServiceClient } from '@/lib/supabase/service';
import { analyzeUserActivity, createProactiveMessage } from '@/lib/chatbot/activity-monitor';

/**
 * Scheduled job: Check all users for proactive engagement triggers
 * Runs every 6 hours
 */
export const checkProactiveEngagement = inngest.createFunction(
  { id: 'check-proactive-engagement' },
  { cron: '0 */6 * * *' }, // Every 6 hours
  async ({ step }) => {
    const supabase = createServiceClient();

    // Get all active distributors
    const { data: distributors, error } = await step.run('get-active-distributors', async () => {
      return supabase
        .from('distributors')
        .select('id, first_name, auth_user_id')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1000); // Process in batches
    });

    if (error || !distributors) {
      console.error('Error fetching distributors:', error);
      return { success: false, error: error?.message };
    }

    let messagesCreated = 0;
    let usersChecked = 0;

    // Check each distributor for triggers
    for (const distributor of distributors) {
      try {
        await step.run(`check-${distributor.id}`, async () => {
          usersChecked++;

          // Analyze activity
          const message = await analyzeUserActivity(distributor.id);

          // Create message if trigger found
          if (message) {
            const created = await createProactiveMessage(distributor.id, message);
            if (created) {
              messagesCreated++;
            }
          }
        });
      } catch (error) {
        console.error(`Error checking distributor ${distributor.id}:`, error);
      }
    }

    return {
      success: true,
      usersChecked,
      messagesCreated,
      timestamp: new Date().toISOString(),
    };
  }
);

/**
 * Event-driven: Check for proactive message after specific actions
 */
export const checkEngagementOnAction = inngest.createFunction(
  { id: 'check-engagement-on-action' },
  { event: 'user/action-completed' },
  async ({ event, step }) => {
    const { distributorId, actionType } = event.data;

    // For certain actions, immediately check for triggers
    if (['signup_completed', 'first_login', 'meeting_created'].includes(actionType)) {
      const message = await step.run('analyze-activity', () =>
        analyzeUserActivity(distributorId)
      );

      if (message) {
        await step.run('create-message', () =>
          createProactiveMessage(distributorId, message)
        );
      }
    }

    return { success: true };
  }
);

/**
 * Daily: Clean up old proactive messages (30+ days old)
 */
export const cleanupOldMessages = inngest.createFunction(
  { id: 'cleanup-old-proactive-messages' },
  { cron: '0 2 * * *' }, // Daily at 2 AM
  async ({ step }) => {
    const supabase = createServiceClient();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error, count } = await step.run('delete-old-messages', async () => {
      return supabase
        .from('ai_proactive_messages')
        .delete()
        .lt('triggered_at', thirtyDaysAgo.toISOString());
    });

    if (error) {
      console.error('Error cleaning up old messages:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      deletedCount: count || 0,
      timestamp: new Date().toISOString(),
    };
  }
);
