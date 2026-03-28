import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { dailySignupReport } from '@/inngest/daily-signup-report';

// Register all Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    dailySignupReport,
  ],
});
