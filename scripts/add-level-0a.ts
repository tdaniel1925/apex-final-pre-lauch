// =============================================
// Add Level 0A - "Apex Affinity Team"
// Creates corporate override position above Apex Vision
// =============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addLevel0A() {
  console.log('🚀 Starting Level 0A Migration...\n');

  try {
    // Step 1: Find existing Apex Vision (current master)
    console.log('📍 Step 1: Finding Apex Vision...');
    const { data: apexVision, error: findError } = await supabase
      .from('distributors')
      .select('*')
      .eq('is_master', true)
      .eq('matrix_depth', 0)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (findError || !apexVision) {
      throw new Error('Could not find Apex Vision (current master)');
    }

    console.log(`✅ Found Apex Vision: ${apexVision.first_name} ${apexVision.last_name} (ID: ${apexVision.id})`);
    console.log(`   Current depth: ${apexVision.matrix_depth}`);
    console.log(`   Rep number: ${apexVision.rep_number}\n`);

    // Step 2: Check if Level 0A already exists
    console.log('📍 Step 2: Checking if Level 0A already exists...');
    const { data: existingLevel0A } = await supabase
      .from('distributors')
      .select('*')
      .eq('matrix_depth', -1)
      .single();

    if (existingLevel0A) {
      console.log('⚠️  Level 0A already exists! Skipping creation.');
      console.log(`   Name: ${existingLevel0A.first_name} ${existingLevel0A.last_name}\n`);
      return;
    }

    // Step 3: Create Apex Affinity Team at Level 0A
    console.log('📍 Step 3: Creating Apex Affinity Team (Level 0A)...');
    const { data: level0A, error: createError } = await supabase
      .from('distributors')
      .insert({
        first_name: 'Apex',
        last_name: 'Affinity Team',
        company_name: 'Apex Affinity Group',
        email: 'team@theapexway.net',
        slug: 'apex-affinity-team',
        affiliate_code: 'AAT00000', // Special code for Level 0A
        sponsor_id: null, // No sponsor - this is the ultimate top
        matrix_parent_id: null, // No parent - this is the root
        matrix_position: 1,
        matrix_depth: -1, // Level 0A
        rep_number: 0, // Rep #0 - before all others
        is_master: true, // Master account (like Apex Vision)
        profile_complete: true,
        phone: '281-600-4000',
        licensing_status: 'licensed',
        licensing_verified: true,
        licensing_verified_at: new Date().toISOString(),
        onboarding_completed: true,
        onboarding_step: 5,
        status: 'active',
      })
      .select()
      .single();

    if (createError || !level0A) {
      throw new Error(`Failed to create Level 0A: ${createError?.message}`);
    }

    console.log(`✅ Created Apex Affinity Team (ID: ${level0A.id})`);
    console.log(`   Matrix depth: ${level0A.matrix_depth}`);
    console.log(`   Rep number: ${level0A.rep_number}\n`);

    // Step 4: Update Apex Vision to be child of Level 0A
    console.log('📍 Step 4: Updating Apex Vision to be child of Apex Affinity Team...');
    const { error: updateError } = await supabase
      .from('distributors')
      .update({
        matrix_parent_id: level0A.id,
        matrix_position: 1, // First (and only) child of Level 0A
        sponsor_id: level0A.id, // Also sponsored by Level 0A
      })
      .eq('id', apexVision.id);

    if (updateError) {
      throw new Error(`Failed to update Apex Vision: ${updateError.message}`);
    }

    console.log('✅ Updated Apex Vision:');
    console.log(`   Matrix parent: ${level0A.first_name} ${level0A.last_name}`);
    console.log(`   Matrix position: 1 (only child of Level 0A)`);
    console.log(`   Matrix depth: 0 (unchanged)\n`);

    // Step 5: Verify structure
    console.log('📍 Step 5: Verifying new structure...');
    const { data: verifyLevel0A } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, matrix_depth, matrix_parent_id')
      .eq('id', level0A.id)
      .single();

    const { data: verifyApexVision } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, matrix_depth, matrix_parent_id, matrix_position')
      .eq('id', apexVision.id)
      .single();

    const { data: level1Reps, count: level1Count } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .eq('matrix_parent_id', apexVision.id);

    console.log('✅ Structure verified:');
    console.log('\n📊 New Matrix Structure:');
    console.log('─────────────────────────────────────────');
    console.log(`Level 0A (Depth -1): ${verifyLevel0A?.first_name} ${verifyLevel0A?.last_name}`);
    console.log(`   └─ Parent: None (Root)`);
    console.log(`   └─ Children: 1 (Apex Vision)`);
    console.log('');
    console.log(`Level 0 (Depth 0): ${verifyApexVision?.first_name} ${verifyApexVision?.last_name}`);
    console.log(`   └─ Parent: Apex Affinity Team`);
    console.log(`   └─ Children: ${level1Count || 0} (Level 1 reps)`);
    console.log('─────────────────────────────────────────\n');

    console.log('✅ Migration Complete!\n');
    console.log('📝 Summary:');
    console.log('   - Level 0A created: Apex Affinity Team (Override & Bonus Position)');
    console.log('   - Apex Vision is now child of Apex Affinity Team');
    console.log('   - All existing reps remain unchanged');
    console.log('   - Apex Affinity Team gets ALL commissions and overrides');
    console.log('   - Apex Affinity Team is always bonus qualified\n');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
addLevel0A()
  .then(() => {
    console.log('✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
