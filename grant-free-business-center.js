import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function grantFreeBusinessCenter() {
  console.log('🚀 Starting Business Center access grant...\n');

  const results = {
    found: 0,
    granted: 0,
    errors: [],
    details: []
  };

  // Step 1: Get Business Center product
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, stripe_price_id')
    .eq('slug', 'businesscenter')
    .single();

  if (productError || !product) {
    console.error('❌ Failed to find Business Center product:', productError);
    process.exit(1);
  }

  console.log(`✅ Found Business Center product: ${product.id}\n`);

  // Step 2: Define user search criteria
  const userSearches = [
    { type: 'email', value: 'sellag.sb@gmail.com', label: 'sellag.sb@gmail.com' },
    { type: 'email', value: 'phil@valorfs.com', label: 'phil@valorfs.com' },
    { type: 'email', value: 'fyifromcharles@gmail.com', label: 'fyifromcharles@gmail.com' },
    { type: 'email', value: 'bartlt01@gmail.com', label: 'Taunya Bartlett (bartlt01@gmail.com)' },
    { type: 'email', value: 'anh@doanfs.com', label: 'Anh Doan (anh@doanfs.com)' },
    { type: 'full_name', first: 'donna', last: 'harvey', label: 'Donna Harvey' },
    { type: 'full_name', first: 'donna', last: 'potter', label: 'Donna Potter' }
  ];

  const users = [];

  // Step 3: Find all users
  console.log('🔍 Searching for users...\n');

  for (const search of userSearches) {
    let query;

    if (search.type === 'email') {
      // Search by email in members table
      query = supabase
        .from('members')
        .select(`
          member_id,
          distributor_id,
          email,
          full_name
        `)
        .eq('email', search.value);
    } else if (search.type === 'first_name') {
      // Search by first name in distributors table
      query = supabase
        .from('distributors')
        .select(`
          id,
          email,
          first_name,
          last_name,
          sponsor_id
        `)
        .ilike('first_name', search.value);
    } else if (search.type === 'full_name') {
      // Search by full name in distributors table
      query = supabase
        .from('distributors')
        .select(`
          id,
          email,
          first_name,
          last_name,
          sponsor_id
        `)
        .ilike('first_name', search.first)
        .ilike('last_name', search.last);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`❌ Error searching for ${search.label}:`, error);
      results.errors.push({ user: search.label, error: error.message });
      continue;
    }

    if (!data || data.length === 0) {
      console.log(`⚠️  User not found: ${search.label}`);
      results.errors.push({ user: search.label, error: 'User not found' });
      continue;
    }

    // Handle multiple matches (for first name searches)
    for (const user of data) {
      let userData;

      if (search.type === 'email') {
        // For email search, we have member data, need to get distributor data
        const { data: distData, error: distError } = await supabase
          .from('distributors')
          .select('id, first_name, last_name, sponsor_id')
          .eq('id', user.distributor_id)
          .single();

        if (distError || !distData) {
          console.log(`⚠️  No distributor record for: ${user.email}`);
          results.errors.push({ user: user.email, error: 'No distributor record' });
          continue;
        }

        userData = {
          member_id: user.member_id,
          distributor_id: user.distributor_id,
          sponsor_id: distData.sponsor_id,
          email: user.email,
          first_name: distData.first_name,
          last_name: distData.last_name,
          search_label: search.label
        };
      } else {
        // For name search, we have distributor data, need to get member_id
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('member_id')
          .eq('distributor_id', user.id)
          .single();

        if (memberError || !memberData) {
          console.log(`⚠️  No member record for: ${user.email || `${user.first_name} ${user.last_name}`}`);
          results.errors.push({
            user: user.email || `${user.first_name} ${user.last_name}`,
            error: 'No member record'
          });
          continue;
        }

        userData = {
          member_id: memberData.member_id,
          distributor_id: user.id,
          sponsor_id: user.sponsor_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          search_label: search.label
        };
      }

      users.push(userData);
      console.log(`✅ Found: ${userData.first_name} ${userData.last_name} (${userData.email})`);
    }
  }

  results.found = users.length;
  console.log(`\n📊 Total users found: ${results.found}\n`);

  if (results.found === 0) {
    console.log('❌ No users found to grant access');
    return results;
  }

  // Step 4: Special check - Verify Donna Harvey's sponsor is Donna Potter
  const donnaHarvey = users.find(u =>
    u.first_name?.toLowerCase() === 'donna' && u.last_name?.toLowerCase() === 'harvey'
  );
  const donnaPotter = users.find(u =>
    u.first_name?.toLowerCase() === 'donna' && u.last_name?.toLowerCase() === 'potter'
  );

  if (donnaHarvey && donnaPotter) {
    console.log('🔍 Checking Donna Harvey\'s sponsor...');

    if (donnaHarvey.sponsor_id !== donnaPotter.distributor_id) {
      console.log(`⚠️  Donna Harvey's sponsor_id (${donnaHarvey.sponsor_id}) does not match Donna Potter's distributor_id (${donnaPotter.distributor_id})`);
      console.log('🔧 Updating sponsor relationship...');

      const { error: updateError } = await supabase
        .from('distributors')
        .update({ sponsor_id: donnaPotter.distributor_id })
        .eq('id', donnaHarvey.distributor_id);

      if (updateError) {
        console.error('❌ Failed to update sponsor relationship:', updateError);
        results.errors.push({
          user: 'Donna Harvey',
          error: `Failed to update sponsor: ${updateError.message}`
        });
      } else {
        console.log('✅ Updated Donna Harvey\'s sponsor to Donna Potter\n');
      }
    } else {
      console.log('✅ Donna Harvey\'s sponsor is correctly set to Donna Potter\n');
    }
  }

  // Step 5: Grant access to each user
  console.log('🎁 Granting Business Center access...\n');

  for (const user of users) {
    // Check if access already exists
    const { data: existing } = await supabase
      .from('service_access')
      .select('id, status')
      .eq('distributor_id', user.distributor_id)
      .eq('product_id', product.id)
      .single();

    if (existing) {
      if (existing.status === 'active') {
        console.log(`ℹ️  ${user.first_name} ${user.last_name} already has active access`);
        results.details.push({
          user: `${user.first_name} ${user.last_name} (${user.email})`,
          status: 'already_active'
        });
        results.granted++;
        continue;
      } else {
        // Reactivate existing record
        const { error: updateError } = await supabase
          .from('service_access')
          .update({
            status: 'active',
            is_trial: false,
            expires_at: null,
            trial_ends_at: null
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error(`❌ Failed to reactivate access for ${user.first_name} ${user.last_name}:`, updateError);
          results.errors.push({
            user: `${user.first_name} ${user.last_name} (${user.email})`,
            error: updateError.message
          });
          continue;
        }

        console.log(`✅ Reactivated access for ${user.first_name} ${user.last_name}`);
        results.details.push({
          user: `${user.first_name} ${user.last_name} (${user.email})`,
          status: 'reactivated'
        });
        results.granted++;
        continue;
      }
    }

    // Insert new access record
    const { error: insertError } = await supabase
      .from('service_access')
      .insert({
        distributor_id: user.distributor_id,
        product_id: product.id,
        status: 'active',
        is_trial: false,
        expires_at: null,
        trial_ends_at: null,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error(`❌ Failed to grant access to ${user.first_name} ${user.last_name}:`, insertError);
      results.errors.push({
        user: `${user.first_name} ${user.last_name} (${user.email})`,
        error: insertError.message
      });
      continue;
    }

    console.log(`✅ Granted access to ${user.first_name} ${user.last_name}`);
    results.details.push({
      user: `${user.first_name} ${user.last_name} (${user.email})`,
      status: 'granted'
    });
    results.granted++;
  }

  // Step 6: Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Users Found: ${results.found}`);
  console.log(`Access Granted: ${results.granted}`);
  console.log(`Errors: ${results.errors.length}`);

  if (results.details.length > 0) {
    console.log('\n📝 Details:');
    results.details.forEach(detail => {
      const statusEmoji = {
        granted: '🎁',
        reactivated: '🔄',
        already_active: 'ℹ️'
      }[detail.status] || '•';
      console.log(`  ${statusEmoji} ${detail.user} - ${detail.status}`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(err => {
      console.log(`  • ${err.user}: ${err.error}`);
    });
  }

  console.log('='.repeat(60) + '\n');

  return results;
}

grantFreeBusinessCenter()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
