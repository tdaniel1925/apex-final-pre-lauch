// Check if distributor exists for user

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const userId = 'ab1e4182-144a-4e2e-8eda-879c1d50fc14';

  const { data, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('auth_user_id', userId);

  console.log('Distributor for user:', userId);
  console.log('Data:', data);
  console.log('Error:', error);
}

check().then(() => process.exit(0));
