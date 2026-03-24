import { inngest } from './client';

/**
 * Daily Signup Report - Scheduled Job
 *
 * Runs every day at 6:00 AM CST (12:00 PM UTC during Standard Time, 11:00 AM UTC during Daylight Time)
 * Sends email report to leadership team with yesterday's signup data
 */
export const dailySignupReport = inngest.createFunction(
  {
    id: 'daily-signup-report',
    name: 'Daily Signup Report - 6 AM CST',
  },
  // Run every day at 6 AM CST
  // CST is UTC-6, so 6 AM CST = 12 PM UTC (Standard Time)
  // CDT is UTC-5, so 6 AM CDT = 11 AM UTC (Daylight Time)
  // Using 12:00 PM UTC to match CST (adjust if needed for CDT)
  { cron: '0 12 * * *' }, // Every day at 12:00 PM UTC (6 AM CST)
  async ({ event, step }) => {
    try {
      // Call the API endpoint to generate and send the report
      const response = await step.run('generate-and-send-report', async () => {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3050';
        const apiUrl = `${baseUrl}/api/admin/daily-report`;

        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Failed to send daily report: ${errorData.error}`);
        }

        return await res.json();
      });

      return {
        success: true,
        message: 'Daily signup report sent successfully',
        report_data: response.report_data,
        email_id: response.email_id,
      };
    } catch (error) {
      console.error('Error in daily signup report job:', error);
      throw error;
    }
  }
);
