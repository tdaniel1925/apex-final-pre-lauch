/**
 * Execute SQL Files via Supabase Connection
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

// Connection string
const connectionString = `postgresql://postgres.brejvdvzwshroxkkhmzy:${encodeURIComponent('Botmaker$2024')}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

async function executeSQLFile(filepath: string) {
  const filename = path.basename(filepath);
  console.log(`\n📄 Executing: ${filename}`);
  console.log('═'.repeat(60));

  const sql = fs.readFileSync(filepath, 'utf8');

  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    const result = await client.query(sql);
    console.log('✅ Success');
    return true;
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('   APEX COMMISSION ENGINE - AUTOMATED TEST EXECUTION');
  console.log('════════════════════════════════════════════════════════════\n');

  const testDir = path.join(__dirname, 'commission-engine');

  const files = [
    '00-setup-test-environment.sql',
    '01-seed-test-distributors.sql',
    '02-seed-test-orders.sql',
    '03-run-commission-tests.sql',
  ];

  for (const file of files) {
    const filepath = path.join(testDir, file);
    if (fs.existsSync(filepath)) {
      const success = await executeSQLFile(filepath);
      if (!success) {
        console.error(`\n❌ Failed to execute ${file}`);
        process.exit(1);
      }
    } else {
      console.error(`\n❌ File not found: ${file}`);
      process.exit(1);
    }
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('✅ ALL SQL FILES EXECUTED SUCCESSFULLY');
  console.log('════════════════════════════════════════════════════════════\n');

  console.log('Now run: npx tsx tests/run-commission-tests.ts');
}

main().catch(console.error);
