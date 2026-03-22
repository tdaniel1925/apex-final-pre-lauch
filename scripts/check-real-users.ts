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

async function checkRealUsers() {
  console.log('\n=== CHECKING REAL USERS ===\n');

  // Check John Jacob and Eric Wullschleger
  const { data: users, error } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, sponsor_id, slug, created_at, matrix_parent_id, matrix_position, matrix_depth')
    .in('email', ['johnjacob67@gmail.com', 'wullschleger.eric@gmail.com']);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!users || users.length === 0) {
    console.log('No users found.');
    return;
  }

  for (const user of users) {
    console.log(`\n📋 ${user.first_name} ${user.last_name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Slug (Website): /${user.slug}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);

    // Check sponsor
    if (user.sponsor_id) {
      const { data: sponsor } = await supabase
        .from('distributors')
        .select('first_name, last_name, email, slug')
        .eq('id', user.sponsor_id)
        .single();

      if (sponsor) {
        console.log(`   \n   👤 Enrolled By (Sponsor):`);
        console.log(`      ${sponsor.first_name} ${sponsor.last_name} (${sponsor.email})`);
        console.log(`      Website used: reachtheapex.net/${sponsor.slug}`);
      }
    } else {
      console.log(`   \n   ⚠️ No sponsor (direct signup or imported)`);
    }

    // Check matrix placement
    if (user.matrix_parent_id) {
      const { data: matrixParent } = await supabase
        .from('distributors')
        .select('first_name, last_name, email')
        .eq('id', user.matrix_parent_id)
        .single();

      if (matrixParent) {
        console.log(`   \n   🌳 Placement Matrix:`);
        console.log(`      Parent: ${matrixParent.first_name} ${matrixParent.last_name}`);
        console.log(`      Position: ${user.matrix_position} at depth ${user.matrix_depth}`);
      }
    } else {
      console.log(`   \n   📍 Matrix: Not placed yet`);
    }

    console.log(`   ${'='.repeat(60)}`);
  }
}

checkRealUsers();
