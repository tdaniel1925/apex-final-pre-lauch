import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();

    // Add column using raw SQL
    const { error: columnError } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE distributors ADD COLUMN IF NOT EXISTS is_test_account BOOLEAN DEFAULT FALSE;'
    });

    if (columnError) {
      console.error('Error adding column:', columnError);
      return NextResponse.json({ error: 'Failed to add column', details: columnError }, { status: 500 });
    }

    // Create index
    const { error: indexError } = await supabase.rpc('exec_sql', {
      query: 'CREATE INDEX IF NOT EXISTS idx_distributors_is_test_account ON distributors(is_test_account) WHERE is_test_account = TRUE;'
    });

    if (indexError) {
      console.error('Error creating index:', indexError);
    }

    return NextResponse.json({ success: true, message: 'Column added successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
