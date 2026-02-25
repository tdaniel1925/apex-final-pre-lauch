// =============================================
// Check Recent Prospect Signups
// Query and display recent prospects from database
// =============================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProspects() {
  const { data, error } = await supabase
    .from('prospects')
    .select('first_name, last_name, email, phone, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error querying prospects:', error);
    process.exit(1);
  }

  console.log('\n=== Recent Prospect Signups ===\n');

  if (!data || data.length === 0) {
    console.log('No prospects found.');
    return;
  }

  data.forEach((p, i) => {
    const date = new Date(p.created_at).toLocaleString();
    console.log(`${i + 1}. ${p.first_name} ${p.last_name}`);
    console.log(`   Email: ${p.email}`);
    console.log(`   Phone: ${p.phone || 'Not provided'}`);
    console.log(`   Signed up: ${date}\n`);
  });

  console.log(`Total: ${data.length} prospects`);
}

checkProspects().catch(console.error);
