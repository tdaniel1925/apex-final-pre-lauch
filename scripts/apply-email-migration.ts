// Apply email nurture system migration directly
import { createServiceClient } from '../src/lib/supabase/service';
import { readFileSync } from 'fs';
import { join } from 'path';

async function applyMigration() {
  const supabase = createServiceClient();

  console.log('📝 Reading email migration SQL...\n');

  const migrationPath = join(
    process.cwd(),
    'supabase/migrations/20260223000005_email_nurture_system.sql'
  );

  const sql = readFileSync(migrationPath, 'utf-8');

  console.log(`📄 Migration file size: ${sql.length} characters`);
  console.log('🚀 Applying migration to database...\n');

  try {
    // Supabase doesn't support running raw SQL directly through the client
    // We need to run it manually through the Supabase dashboard or CLI

    console.log('⚠️  Cannot run SQL migrations through TypeScript client.');
    console.log('\n📋 To apply this migration, run this command:\n');
    console.log('   npx supabase db execute --file supabase/migrations/20260223000005_email_nurture_system.sql\n');
    console.log('Or copy the SQL and run it in the Supabase SQL Editor:\n');
    console.log('   https://supabase.com/dashboard/project/YOUR_PROJECT/sql\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

applyMigration().then(() => {
  console.log('✅ Check complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
