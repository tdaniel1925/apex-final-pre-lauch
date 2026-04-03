import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('\n📋 Creating crm_activities table...\n');

const createTableSQL = `
CREATE TABLE IF NOT EXISTS public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note')),
  subject TEXT NOT NULL,
  description TEXT,
  activity_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration INTEGER,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

// Try to create using INSERT (workaround)
const { error: tableError } = await supabase.from('crm_activities').select('id').limit(0);

if (tableError && tableError.message.includes('does not exist')) {
  console.log('✅ Table does not exist, needs to be created manually.');
  console.log('\nPlease run this SQL in Supabase SQL Editor:');
  console.log('https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new\n');
  console.log(createTableSQL);
  console.log('\nThen run the full migration file:');
  console.log('supabase/migrations/20260403000001_create_crm_activities.sql\n');
} else {
  console.log('✅ crm_activities table already exists!\n');
}
