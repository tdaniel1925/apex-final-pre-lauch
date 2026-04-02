require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('📦 Applying onboarding migration...\n');

  const sql = `
-- Add onboarding fields to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS requires_onboarding BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_duration_minutes INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS onboarding_instructions TEXT;
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Error:', error);
      console.log('\n⚠️  Trying direct approach...\n');

      // Try using Supabase SQL query
      const { error: error2 } = await supabase
        .from('products')
        .select('requires_onboarding')
        .limit(1);

      if (error2 && error2.code === '42703') {
        console.log('✅ Migration needed - columns do not exist yet');
        console.log('\n📋 Manual steps required:');
        console.log('1. Go to Supabase Dashboard → SQL Editor');
        console.log('2. Run this SQL:\n');
        console.log(sql);
      } else {
        console.log('✅ Columns already exist!');
      }
    } else {
      console.log('✅ Migration applied successfully!');
    }
  } catch (err) {
    console.error('Error:', err.message);
    console.log('\n📋 Please run this SQL in Supabase Dashboard:\n');
    console.log(sql);
  }
})();
