// =============================================
// Generate ACH File API
// Generates NACHA format file for payout batch
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { requireAdmin } from '@/lib/auth/admin';

// POST /api/admin/payouts/[id]/generate-ach
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    await requireAdmin();

    const supabase = createServiceClient();

    // Get batch with payout items
    const { data: batch, error: batchError } = await supabase
      .from('payout_batches')
      .select(`
        *,
        payout_items (
          *,
          distributor:distributors (
            id,
            first_name,
            last_name,
            email
          ),
          bank_account:distributor_bank_accounts!payout_items_distributor_id_fkey (
            account_holder_name,
            routing_number,
            account_number_last4,
            account_type
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (batch.status !== 'approved') {
      return NextResponse.json(
        { error: 'Batch must be approved before generating ACH file' },
        { status: 400 }
      );
    }

    // Generate NACHA format file
    const achContent = generateNACHAFile(batch);

    // Update batch
    await supabase
      .from('payout_batches')
      .update({
        ach_file_generated: true,
        ach_file_generated_at: new Date().toISOString(),
        status: 'processing',
      })
      .eq('id', params.id);

    // Return file as download
    return new NextResponse(achContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="PAYOUT_${batch.batch_number}.ach"`,
      },
    });
  } catch (error: any) {
    console.error('Generate ACH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Generate NACHA format file
function generateNACHAFile(batch: any): string {
  const lines: string[] = [];

  // File Header Record (Type 1)
  const fileHeader = [
    '1', // Record Type
    '01', // Priority Code
    ' '.repeat(10), // Immediate Destination (bank routing)
    ' '.repeat(10), // Immediate Origin (company ID)
    new Date().toISOString().slice(0, 10).replace(/-/g, '').slice(2), // File Creation Date (YYMMDD)
    new Date().toTimeString().slice(0, 5).replace(':', ''), // File Creation Time (HHMM)
    'A', // File ID Modifier
    '094', // Record Size
    '10', // Blocking Factor
    '1', // Format Code
    'APEX AFFINITY'.padEnd(23), // Immediate Destination Name
    'APEX COMPANY'.padEnd(23), // Immediate Origin Name
    ' '.repeat(8), // Reference Code
  ].join('');
  lines.push(fileHeader);

  // Batch Header Record (Type 5)
  const batchHeader = [
    '5', // Record Type
    '200', // Service Class Code (mixed debits and credits)
    'APEX AFFINITY'.padEnd(16), // Company Name
    ' '.repeat(20), // Company Discretionary Data
    '1234567890', // Company Identification
    'PPD', // Standard Entry Class Code
    'COMMISSIONS'.padEnd(10), // Company Entry Description
    batch.month_year.replace('-', ''), // Company Descriptive Date
    new Date().toISOString().slice(0, 10).replace(/-/g, '').slice(2), // Effective Entry Date
    ' '.repeat(3), // Settlement Date
    '1', // Originator Status Code
    '12345678', // Originating DFI Identification
    '0000001', // Batch Number
  ].join('');
  lines.push(batchHeader);

  // Entry Detail Records (Type 6) - one per payout
  let entryCount = 0;
  let totalAmount = 0;

  batch.payout_items?.forEach((item: any, index: number) => {
    if (!item.bank_account) return; // Skip if no bank account

    const amount = item.total_amount_cents.toString().padStart(10, '0');
    totalAmount += item.total_amount_cents;

    const entry = [
      '6', // Record Type
      '22', // Transaction Code (checking credit)
      item.bank_account.routing_number.padStart(9, '0'),
      item.bank_account.account_number_last4.padStart(17, '0'), // Note: In production, use full encrypted number
      amount,
      (item.distributor.id.slice(0, 15)).padEnd(15), // Individual ID Number
      `${item.distributor.first_name} ${item.distributor.last_name}`.slice(0, 22).padEnd(22),
      '  ', // Discretionary Data
      '0', // Addenda Record Indicator
      `${(index + 1).toString().padStart(7, '0')}`, // Trace Number (partial)
    ].join('');
    lines.push(entry);
    entryCount++;
  });

  // Batch Control Record (Type 8)
  const batchControl = [
    '8', // Record Type
    '200', // Service Class Code
    entryCount.toString().padStart(6, '0'), // Entry/Addenda Count
    '0'.repeat(10), // Entry Hash (simplified)
    totalAmount.toString().padStart(12, '0'), // Total Debit Entry Dollar Amount
    '0'.repeat(12), // Total Credit Entry Dollar Amount
    '1234567890', // Company Identification
    ' '.repeat(19), // Message Authentication Code
    ' '.repeat(6), // Reserved
    '12345678', // Originating DFI Identification
    '0000001', // Batch Number
  ].join('');
  lines.push(batchControl);

  // File Control Record (Type 9)
  const fileControl = [
    '9', // Record Type
    '000001', // Batch Count
    '000001', // Block Count
    entryCount.toString().padStart(8, '0'), // Entry/Addenda Count
    '0'.repeat(10), // Entry Hash
    totalAmount.toString().padStart(12, '0'), // Total Debit Amount
    '0'.repeat(12), // Total Credit Amount
    ' '.repeat(39), // Reserved
  ].join('');
  lines.push(fileControl);

  // Pad to 94 characters per line and join
  return lines.map(line => line.padEnd(94)).join('\n');
}
