// Create 30 placeholder distributors under Jane, John, and Jenny Doe
import { createServiceClient } from '../src/lib/supabase/service';
import { generateSlug } from '../src/lib/utils/slug';

async function create30Placeholders() {
  const supabase = createServiceClient();

  console.log('🔍 Finding Jane, John, and Jenny Doe...\n');

  // Get the three placeholder sponsors
  const { data: sponsors, error: sponsorError } = await supabase
    .from('distributors')
    .select('*')
    .in('email', ['jane.doe@placeholder.com', 'john.doe@placeholder.com', 'jenny.doe@placeholder.com'])
    .order('first_name', { ascending: true });

  if (sponsorError || !sponsors || sponsors.length !== 3) {
    console.error('❌ Error finding sponsors:', sponsorError);
    console.log('Found:', sponsors?.length || 0, 'sponsors');
    return;
  }

  console.log('✅ Found sponsors:');
  sponsors.forEach(s => {
    console.log(`   - ${s.first_name} ${s.last_name} (${s.email})`);
  });
  console.log('');

  // Create 10 placeholders under each sponsor
  let totalCreated = 0;
  let startNumber = 1;

  for (const sponsor of sponsors) {
    console.log(`\n📝 Creating 10 placeholders under ${sponsor.first_name} ${sponsor.last_name}...\n`);

    for (let i = 1; i <= 10; i++) {
      const placeholderNumber = startNumber++;
      const firstName = `Placeholder`;
      const lastName = `${placeholderNumber}`;
      const email = `placeholder${placeholderNumber}@placeholder.com`;
      const slug = generateSlug(`${firstName} ${lastName}`);
      const affiliateCode = `PH${placeholderNumber.toString().padStart(4, '0')}`;

      try {
        // Get the highest rep_number to continue sequence
        const { data: maxRep } = await supabase
          .from('distributors')
          .select('rep_number')
          .order('rep_number', { ascending: false })
          .limit(1)
          .single();

        const nextRepNumber = (maxRep?.rep_number || 1000) + 1;

        // Create distributor WITHOUT auth account (no welcome email)
        const { data: newDist, error: insertError } = await supabase
          .from('distributors')
          .insert({
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: null,
            slug: slug,
            affiliate_code: affiliateCode,
            sponsor_id: sponsor.id,
            status: 'active',
            licensing_status: 'non_licensed',
            rep_number: nextRepNumber,
            company_name: null,
            bio: null,
            profile_photo_url: null,
            auth_user_id: null, // No auth account = no email
          })
          .select()
          .single();

        if (insertError) {
          console.error(`❌ Error creating ${firstName} ${lastName}:`, insertError);
          continue;
        }

        console.log(`✅ Created: ${firstName} ${lastName} (${email}) - Rep #${newDist.rep_number}`);
        totalCreated++;

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error creating placeholder ${placeholderNumber}:`, error);
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully created: ${totalCreated} placeholders`);
  console.log(`   📧 Welcome emails sent: 0 (auth accounts not created)`);
}

create30Placeholders().then(() => {
  console.log('\n✅ Done creating placeholders');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
