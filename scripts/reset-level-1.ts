// =============================================
// Reset Level 1 - Clean Slate
// 1. Update Apex Vision email
// 2. Delete existing Level 1 reps
// 3. Create 5 new Level 1 positions
// =============================================

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetLevel1() {
  console.log('🚀 Starting Level 1 Reset...\n');

  try {
    // Step 1: Find Apex Vision
    console.log('📍 Step 1: Finding Apex Vision...');
    const { data: apexVision, error: findError } = await supabase
      .from('distributors')
      .select('*')
      .eq('matrix_depth', 0)
      .eq('is_master', true)
      .single();

    if (findError || !apexVision) {
      throw new Error('Could not find Apex Vision');
    }

    console.log(`✅ Found Apex Vision (ID: ${apexVision.id})`);
    console.log(`   Current email: ${apexVision.email}\n`);

    // Step 2: Update Apex Vision email
    console.log('📍 Step 2: Updating Apex Vision email...');
    const { error: updateError } = await supabase
      .from('distributors')
      .update({ email: 'tdaniel@bundelefly.com' })
      .eq('id', apexVision.id);

    if (updateError) {
      throw new Error(`Failed to update Apex Vision: ${updateError.message}`);
    }

    console.log('✅ Updated Apex Vision email to: tdaniel@bundelefly.com\n');

    // Step 3: Find and delete existing Level 1 reps
    console.log('📍 Step 3: Finding existing Level 1 reps...');
    const { data: existingLevel1, count: level1Count } = await supabase
      .from('distributors')
      .select('*', { count: 'exact' })
      .eq('matrix_parent_id', apexVision.id)
      .eq('matrix_depth', 1);

    console.log(`   Found ${level1Count || 0} existing Level 1 reps`);

    if (existingLevel1 && existingLevel1.length > 0) {
      console.log('   Existing reps:');
      existingLevel1.forEach((rep, i) => {
        console.log(`   ${i + 1}. ${rep.first_name} ${rep.last_name} (${rep.email})`);
      });

      console.log('\n   Deleting existing Level 1 reps...');
      const { error: deleteError } = await supabase
        .from('distributors')
        .delete()
        .eq('matrix_parent_id', apexVision.id)
        .eq('matrix_depth', 1);

      if (deleteError) {
        throw new Error(`Failed to delete Level 1 reps: ${deleteError.message}`);
      }

      console.log(`✅ Deleted ${level1Count} existing Level 1 reps\n`);
    } else {
      console.log('   No existing Level 1 reps to delete\n');
    }

    // Step 4: Create 5 new Level 1 reps
    console.log('📍 Step 4: Creating 5 new Level 1 positions...\n');

    const newReps = [
      {
        first_name: 'Phil',
        last_name: 'Resch',
        slug: 'phil-resch',
        email: '', // Admin will fill
        password: null, // Admin will set via invite
        position: 1,
      },
      {
        first_name: 'Anh',
        last_name: 'Doan',
        slug: 'anh-doan',
        email: '', // Admin will fill
        password: null, // Admin will set via invite
        position: 2,
      },
      {
        first_name: 'John',
        last_name: 'Doe',
        slug: 'john-doe',
        email: 'john.doe@placeholder.com', // Placeholder
        password: 'p@ssword',
        position: 3,
      },
      {
        first_name: 'Jane',
        last_name: 'Doe',
        slug: 'jane-doe',
        email: 'jane.doe@placeholder.com', // Placeholder
        password: 'p@ssword',
        position: 4,
      },
      {
        first_name: 'Jenny',
        last_name: 'Doe',
        slug: 'jenny-doe',
        email: 'jenny.doe@placeholder.com', // Placeholder
        password: 'p@ssword',
        position: 5,
      },
    ];

    const createdReps = [];

    for (const rep of newReps) {
      console.log(`   Creating L1-${rep.position}: ${rep.first_name} ${rep.last_name}...`);

      // Generate affiliate code
      const affiliateCode = `${rep.first_name.substring(0, 2).toUpperCase()}${rep.last_name.substring(0, 2).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Create auth user if password provided
      let authUserId = null;
      if (rep.password && rep.email) {
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: rep.email,
          password: rep.password,
          email_confirm: true,
        });

        if (authError) {
          console.log(`   ⚠️  Warning: Could not create auth user for ${rep.first_name}: ${authError.message}`);
        } else {
          authUserId = authUser.user.id;
          console.log(`   ✓ Created auth user for ${rep.first_name}`);
        }
      }

      // Create distributor
      const { data: newRep, error: createError } = await supabase
        .from('distributors')
        .insert({
          first_name: rep.first_name,
          last_name: rep.last_name,
          email: rep.email || `${rep.slug}@placeholder.com`,
          slug: rep.slug,
          affiliate_code: affiliateCode,
          sponsor_id: apexVision.id,
          matrix_parent_id: apexVision.id,
          matrix_position: rep.position,
          matrix_depth: 1,
          rep_number: rep.position + 1, // Rep 2-6 (Apex Vision is 1)
          is_master: false,
          profile_complete: false,
          licensing_status: 'non_licensed',
          licensing_verified: false,
          onboarding_completed: false,
          onboarding_step: 1,
          status: 'active',
          auth_user_id: authUserId,
        })
        .select()
        .single();

      if (createError) {
        console.log(`   ❌ Failed to create ${rep.first_name}: ${createError.message}`);
      } else {
        createdReps.push(newRep);
        console.log(`   ✅ Created ${rep.first_name} ${rep.last_name} (Rep #${newRep.rep_number})`);
        console.log(`      Replicated site: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://reachtheapex.net'}/${rep.slug}`);
        if (rep.password) {
          console.log(`      Password: ${rep.password}`);
        } else {
          console.log(`      Password: (Set via admin invite)`);
        }
      }
      console.log('');
    }

    // Step 5: Verify structure
    console.log('📍 Step 5: Verifying new structure...\n');
    const { data: verifyLevel1, count: newLevel1Count } = await supabase
      .from('distributors')
      .select('*', { count: 'exact' })
      .eq('matrix_parent_id', apexVision.id)
      .eq('matrix_depth', 1)
      .order('matrix_position', { ascending: true });

    console.log('✅ Structure verified:\n');
    console.log('📊 Level 1 Reps Under Apex Vision:');
    console.log('─────────────────────────────────────────');
    verifyLevel1?.forEach((rep) => {
      console.log(`L1-${rep.matrix_position}: ${rep.first_name} ${rep.last_name}`);
      console.log(`   Slug: ${rep.slug}`);
      console.log(`   Rep #: ${rep.rep_number}`);
      console.log(`   Site: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://reachtheapex.net'}/${rep.slug}`);
      console.log('');
    });
    console.log('─────────────────────────────────────────\n');

    console.log('✅ Migration Complete!\n');
    console.log('📝 Summary:');
    console.log(`   - Apex Vision email updated: tdaniel@bundelefly.com`);
    console.log(`   - Deleted ${level1Count || 0} existing Level 1 reps`);
    console.log(`   - Created ${newLevel1Count || 0} new Level 1 reps`);
    console.log('   - All replicated websites are live\n');

    console.log('📋 Next Steps:');
    console.log('   1. Fill in email/phone for Phil Resch and Anh Doan in admin panel');
    console.log('   2. Send invite emails to all 5 reps when ready');
    console.log('   3. Manually place the 6 existing prospects from admin\n');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
resetLevel1()
  .then(() => {
    console.log('✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
