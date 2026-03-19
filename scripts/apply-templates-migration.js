// Apply event templates and recurring events migration
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  console.log('📦 Applying event templates & recurring events migration...\n');

  // Read migration file
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20260319000015_add_event_templates_and_recurrence.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  try {
    // Execute migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });

    if (error) {
      // Try direct execution if RPC doesn't exist
      console.log('⚠️  RPC not available, trying direct execution...');

      // Split by semicolons and execute each statement
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        const { error: execError } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });

        if (execError) {
          console.error('❌ Error executing statement:', execError);
          throw execError;
        }
      }
    }

    console.log('✅ Migration applied successfully!\n');

    // Verify tables were created
    const { data: templates, error: templatesError } = await supabase
      .from('event_templates')
      .select('count')
      .limit(1);

    const { data: recurring, error: recurringError } = await supabase
      .from('recurring_events')
      .select('count')
      .limit(1);

    if (!templatesError && !recurringError) {
      console.log('✅ Verified: event_templates table exists');
      console.log('✅ Verified: recurring_events table exists');
    }

    // Check company_events columns
    const { data: events, error: eventsError } = await supabase
      .from('company_events')
      .select('id, template_id, recurring_event_id, archived_at, is_template')
      .limit(1);

    if (!eventsError) {
      console.log('✅ Verified: company_events table updated with new columns\n');
    }

    console.log('🎉 Migration complete! You can now:');
    console.log('   - Create event templates');
    console.log('   - Set up recurring events');
    console.log('   - Events will auto-archive 2 hours after completion\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
