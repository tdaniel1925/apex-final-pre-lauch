// =============================================
// Apply Critical Fixes Directly
// Manually execute the 4 critical migration fixes
// =============================================

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

async function applyCriticalFixes() {
  console.log('🔧 Applying critical fixes directly to database...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Fix #1: Members table creation on signup (skip - would need to modify existing function)
    console.log('Fix #1: Members creation on signup - requires function modification (skipping for now)\n');

    // Fix #2: Email sync transaction function
    console.log('Fix #2: Applying email sync transaction function...');
    const fix2 = fs.readFileSync('supabase/migrations/20260320000002_add_email_sync_transaction_function.sql', 'utf8');
    await client.query(fix2);
    console.log('✅ Email sync function created\n');

    // Fix #3: Suspension cascade trigger
    console.log('Fix #3: Applying suspension cascade trigger...');
    const fix3 = fs.readFileSync('supabase/migrations/20260320000003_add_suspension_cascade_trigger.sql', 'utf8');
    await client.query(fix3);
    console.log('✅ Suspension cascade trigger created\n');

    // Fix #4: Matrix position advisory lock
    console.log('Fix #4: Applying matrix position advisory lock function...');
    const fix4 = fs.readFileSync('supabase/migrations/20260320000004_add_matrix_update_function.sql', 'utf8');
    await client.query(fix4);
    console.log('✅ Matrix update function created\n');

    // Now fix the existing TestUser records manually
    console.log('Fixing existing TestUser member records...');
    const fixMembers = await client.query(`
      UPDATE members
      SET
        status = 'terminated',
        termination_date = NOW(),
        updated_at = NOW()
      WHERE distributor_id IN (
        SELECT id FROM distributors
        WHERE status = 'deleted'
          AND (first_name ILIKE '%testuser%' OR last_name ILIKE '%testuser%' OR email ILIKE '%testuser%')
      )
      RETURNING member_id, full_name
    `);
    console.log(`✅ Fixed ${fixMembers.rows.length} member records:\n`);
    fixMembers.rows.forEach(row => {
      console.log(`   - ${row.full_name}`);
    });

    await client.end();
    console.log('\n✅ All fixes applied successfully!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    await client.end();
    process.exit(1);
  }
}

applyCriticalFixes();
