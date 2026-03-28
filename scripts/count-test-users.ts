import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function countTestUsers() {
  console.log('\n=== TEST USERS IN SYSTEM ===\n');

  // Find users with "test" in name or email
  const { data: testUsers, error } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, status, created_at')
    .or('first_name.ilike.%test%,last_name.ilike.%test%,email.ilike.%test%');

  if (error) {
    console.error('Error:', error);
    return;
  }

  const count = testUsers?.length || 0;
  console.log(`Total distributors with "test" in name/email: ${count}\n`);

  if (testUsers && testUsers.length > 0) {
    console.log('ACTIVE Test Users:');
    const active = testUsers.filter(u => u.status === 'active');
    active.forEach(u => {
      console.log(`  - ${u.first_name} ${u.last_name} (${u.email}) - ${u.status}`);
    });

    console.log(`\nDELETED Test Users:`);
    const deleted = testUsers.filter(u => u.status === 'deleted');
    deleted.forEach(u => {
      console.log(`  - ${u.first_name} ${u.last_name} (${u.email}) - ${u.status}`);
    });

    console.log(`\nSummary:`);
    console.log(`  Active: ${active.length}`);
    console.log(`  Deleted: ${deleted.length}`);
    console.log(`  Total: ${testUsers.length}`);
  }

  // Also check for users with no sponsor (likely test accounts)
  const { data: noSponsor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, status')
    .is('sponsor_id', null)
    .eq('status', 'active');

  const noSponsorCount = noSponsor?.length || 0;
  console.log(`\n=== ACTIVE DISTRIBUTORS WITH NO SPONSOR ===`);
  console.log(`Count: ${noSponsorCount}\n`);

  if (noSponsor && noSponsor.length > 0) {
    noSponsor.forEach(u => {
      console.log(`  - ${u.first_name} ${u.last_name} (${u.email})`);
    });
  }
}

countTestUsers();
