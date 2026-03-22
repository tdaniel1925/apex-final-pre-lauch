import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkCharlesTeam() {
  console.log('\n=== CHARLES POTTER ENROLLMENT STRUCTURE ===\n');

  // Get Charles Potter
  const { data: charles } = await supabase
    .from('distributors')
    .select('*')
    .eq('email', 'fyifromcharles@gmail.com')
    .single();

  if (!charles) {
    console.log('❌ Charles Potter not found');
    return;
  }

  console.log(`📋 CHARLES POTTER (${charles.email})`);
  console.log(`   Rep #: ${charles.rep_number}`);
  console.log(`   Slug: /${charles.slug}`);

  // Get Charles's sponsor
  if (charles.sponsor_id) {
    const { data: sponsor } = await supabase
      .from('distributors')
      .select('first_name, last_name, email, slug')
      .eq('id', charles.sponsor_id)
      .single();
    
    if (sponsor) {
      console.log(`   👤 Sponsor: ${sponsor.first_name} ${sponsor.last_name} (/${sponsor.slug})`);
    }
  }

  // Get Charles's direct enrollees (L1)
  const { data: l1Enrollees } = await supabase
    .from('distributors')
    .select('*')
    .eq('sponsor_id', charles.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  console.log(`\n   📊 L1 ENROLLEES (${l1Enrollees?.length || 0}):`);
  if (l1Enrollees && l1Enrollees.length > 0) {
    for (const enrollee of l1Enrollees) {
      console.log(`      • ${enrollee.first_name} ${enrollee.last_name} (${enrollee.email}) - /${enrollee.slug}`);
    }
  } else {
    console.log(`      (none)`);
  }

  // Check specific people mentioned
  console.log(`\n=== CHECKING SPECIFIC PEOPLE ===\n`);

  const peopleToCheck = [
    { name: 'Donna Potter', email: 'donnambpotter@gmail.com', shouldBeSponsoredBy: 'Charles Potter' },
    { name: 'Brian Rawlston', email: null, shouldBeSponsoredBy: 'Charles Potter' },
    { name: 'John Smith', email: null, shouldBeSponsoredBy: 'Charles Potter' },
    { name: 'Trent Daniel', email: 'shall@botmakers.ai', shouldBeSponsoredBy: 'Charles Potter' },
    { name: 'Dessiah Daniel', email: 'dessiah@m.botmakers.ai', shouldBeSponsoredBy: 'Charles Potter' },
    { name: 'Jennifer Fuchs', email: null, shouldBeSponsoredBy: 'Charles Potter' },
    { name: 'Donna Harvey', email: null, shouldBeSponsoredBy: 'Donna Potter' },
    { name: 'Lamyrle Ituah', email: null, shouldBeSponsoredBy: 'Donna Harvey' },
  ];

  for (const person of peopleToCheck) {
    let query = supabase
      .from('distributors')
      .select('id, first_name, last_name, email, slug, sponsor_id, status');

    if (person.email) {
      query = query.eq('email', person.email);
    } else {
      const [firstName, ...lastNameParts] = person.name.split(' ');
      const lastName = lastNameParts.join(' ');
      query = query.ilike('first_name', `%${firstName}%`).ilike('last_name', `%${lastName}%`);
    }

    const { data: users } = await query;

    if (!users || users.length === 0) {
      console.log(`❌ ${person.name}: NOT FOUND`);
      continue;
    }

    const user = users[0];
    
    // Get sponsor info
    let sponsorName = 'NONE';
    if (user.sponsor_id) {
      const { data: sponsor } = await supabase
        .from('distributors')
        .select('first_name, last_name, slug')
        .eq('id', user.sponsor_id)
        .single();
      
      if (sponsor) {
        sponsorName = `${sponsor.first_name} ${sponsor.last_name}`;
      }
    }

    const isCorrect = sponsorName === person.shouldBeSponsoredBy;
    const icon = isCorrect ? '✅' : '❌';
    
    console.log(`${icon} ${person.name} (${user.email || 'no email'})`);
    console.log(`   Current Sponsor: ${sponsorName}`);
    console.log(`   Expected Sponsor: ${person.shouldBeSponsoredBy}`);
    console.log(`   Status: ${user.status}`);
    console.log();
  }
}

checkCharlesTeam();
