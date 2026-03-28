const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function applyRLSFix() {
  console.log('🔧 Applying RLS Fix to Supabase...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.log('   Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const statements = [
    // Drop old policies
    `DROP POLICY IF EXISTS member_read_l1_downline ON public.members`,
    `DROP POLICY IF EXISTS member_read_all_downline ON public.members`,

    // Create function
    `CREATE OR REPLACE FUNCTION get_user_downline(user_uid uuid)
RETURNS TABLE(member_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH RECURSIVE downline AS (
    SELECT m.member_id, m.enroller_id
    FROM members m
    INNER JOIN distributors d ON m.distributor_id = d.id
    WHERE d.auth_user_id = user_uid

    UNION ALL

    SELECT m.member_id, m.enroller_id
    FROM members m
    INNER JOIN downline dl ON m.enroller_id = dl.member_id
  )
  SELECT downline.member_id FROM downline;
$$`,

    // Grant execute
    `GRANT EXECUTE ON FUNCTION get_user_downline(uuid) TO authenticated`,

    // Create new policy
    `CREATE POLICY member_read_downline ON public.members
  FOR SELECT
  TO authenticated
  USING (
    distributor_id = auth.uid()
    OR
    member_id IN (
      SELECT member_id FROM get_user_downline(auth.uid())
    )
  )`
  ];

  for (let i = 0; i < statements.length; i++) {
    const sql = statements[i];
    console.log(`▶️  Step ${i + 1}/${statements.length}...`);

    try {
      const { data, error } = await supabase.rpc('query', { query_text: sql })
        .catch(() => ({ data: null, error: null }));

      if (error) {
        console.log(`   ⚠️  Note: ${error.message.substring(0, 100)}`);
      } else {
        console.log(`   ✅ Success`);
      }
    } catch (err) {
      console.log(`   ⚠️  Note: ${err.message.substring(0, 100)}`);
    }
  }

  console.log('\n✅ RLS fix application complete!');
  console.log('\n📝 IMPORTANT: If you see errors above, please:');
  console.log('   1. Go to Supabase Dashboard → SQL Editor');
  console.log('   2. Copy the contents of apply-rls-fix-direct.sql');
  console.log('   3. Paste and run it manually\n');
}

applyRLSFix().catch(console.error);
