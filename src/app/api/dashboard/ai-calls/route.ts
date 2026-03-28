/**
 * AI Call Logs API
 * Fetch call logs for authenticated distributor
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AI Calls API')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get distributor
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, ai_phone_number')
      .eq('auth_user_id', user.id)
      .single()

    if (distError || !distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const callType = searchParams.get('callType') // 'prospect' | 'distributor' | 'all'

    // Build query
    let query = supabase
      .from('call_logs')
      .select('*', { count: 'exact' })
      .eq('distributor_id', distributor.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by call type if specified
    if (callType && callType !== 'all') {
      query = query.eq('call_type', callType)
    }

    const { data: callLogs, error: logsError, count } = await query

    if (logsError) {
      logger.error('Error fetching call logs', logsError as Error, {
        distributorId: distributor.id,
        limit,
        offset,
        callType,
      })
      return NextResponse.json({ error: 'Failed to fetch call logs' }, { status: 500 })
    }

    // Calculate stats from TOTAL dataset (not just paginated results)
    const { count: prospectCount } = await supabase
      .from('call_logs')
      .select('*', { count: 'exact', head: true })
      .eq('distributor_id', distributor.id)
      .eq('call_type', 'prospect')

    const { count: distributorCount } = await supabase
      .from('call_logs')
      .select('*', { count: 'exact', head: true })
      .eq('distributor_id', distributor.id)
      .eq('call_type', 'distributor')

    const { count: smsCount } = await supabase
      .from('call_logs')
      .select('*', { count: 'exact', head: true })
      .eq('distributor_id', distributor.id)
      .eq('sms_sent', true)

    // For average duration, aggregate all records
    const { data: avgData } = await supabase
      .from('call_logs')
      .select('duration_seconds')
      .eq('distributor_id', distributor.id)

    const avgDuration = avgData && avgData.length > 0
      ? Math.round(avgData.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / avgData.length)
      : 0

    const stats = {
      totalCalls: count || 0,
      prospectCalls: prospectCount || 0,
      distributorCalls: distributorCount || 0,
      smsSent: smsCount || 0,
      avgDuration,
    }

    return NextResponse.json({
      success: true,
      callLogs: callLogs || [],
      stats,
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    })
  } catch (error: any) {
    logger.error('Unexpected error in AI calls API', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
