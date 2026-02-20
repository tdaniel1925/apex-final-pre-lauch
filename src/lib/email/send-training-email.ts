// =============================================
// Training Email Delivery Service
// Send training content via Resend
// =============================================

import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { TrainingContentEmail } from './templates/training-content';
import type { TrainingContent } from '@/types/training';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendTrainingEmailParams {
  userId: string;
  contentId: string;
  email: string;
}

export async function sendTrainingEmail({
  userId,
  contentId,
  email,
}: SendTrainingEmailParams) {
  try {
    const supabase = await createClient();

    // Get training content
    const { data: content, error: contentError } = await supabase
      .from('training_content')
      .select('*')
      .eq('id', contentId)
      .eq('is_published', true)
      .single();

    if (contentError || !content) {
      throw new Error('Training content not found');
    }

    // Get user's streak data
    const { data: streak } = await supabase
      .from('training_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get user's name
    const { data: distributor } = await supabase
      .from('distributors')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();

    const userName = distributor
      ? `${distributor.first_name} ${distributor.last_name}`
      : 'there';

    // Generate content URL (user can mark as complete)
    const contentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/training/${contentId}`;

    // Generate email HTML
    const html = TrainingContentEmail({
      content: content as TrainingContent,
      streak: streak || undefined,
      userName,
      contentUrl,
    });

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'APEX Training <training@apexaffinitygroup.com>',
      to: email,
      subject: `🎓 ${content.title} - Your APEX Training`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Training email sent successfully:', {
      emailId: data?.id,
      userId,
      contentId,
      email,
    });

    return {
      success: true,
      emailId: data?.id,
    };
  } catch (error: any) {
    console.error('Error sending training email:', error);
    throw error;
  }
}

interface SendBatchTrainingEmailsParams {
  contentId: string;
}

export async function sendBatchTrainingEmails({
  contentId,
}: SendBatchTrainingEmailsParams) {
  try {
    const supabase = await createClient();

    // Get all active email subscriptions
    const { data: subscriptions, error } = await supabase
      .from('training_subscriptions')
      .select(`
        user_id,
        distributors!training_subscriptions_user_id_fkey (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('is_active', true)
      .eq('delivery_email', true);

    if (error) {
      throw new Error(`Failed to fetch subscriptions: ${error.message}`);
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active email subscriptions found');
      return {
        success: true,
        sent: 0,
        failed: 0,
      };
    }

    const results = await Promise.allSettled(
      subscriptions.map((sub: any) =>
        sendTrainingEmail({
          userId: sub.user_id,
          contentId,
          email: sub.distributors.email,
        })
      )
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log('Batch email send completed:', {
      total: subscriptions.length,
      sent,
      failed,
    });

    return {
      success: true,
      sent,
      failed,
    };
  } catch (error: any) {
    console.error('Error sending batch training emails:', error);
    throw error;
  }
}
