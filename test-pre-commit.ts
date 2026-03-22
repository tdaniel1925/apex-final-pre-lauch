// Test file to verify pre-commit hook catches violations
import { createClient } from '@/lib/supabase/server';

export async function testBadQuery() {
  const supabase = await createClient();

  // This should be caught by pre-commit hook
  const { data } = await supabase
    .from('distributors')
    .select('*')
    .eq('matrix_parent_id', 'some-id'); // ❌ FORBIDDEN

  return data;
}
