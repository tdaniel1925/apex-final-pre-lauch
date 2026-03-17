// Script to lookup distributor relationships
import { createServiceClient } from '../src/lib/supabase/service';

const serviceClient = createServiceClient();

async function lookupDistributors() {
  // Find all Trent Daniels
  const { data: trents, error: trentError } = await serviceClient
    .from('distributors')
    .select('*')
    .ilike('first_name', '%trent%')
    .ilike('last_name', '%daniel%');

  if (trentError || !trents || trents.length === 0) {
    console.log('Trent Daniel not found:', trentError);
    return;
  }

  console.log(`\n=== FOUND ${trents.length} TRENT DANIEL(S) ===`);
  trents.forEach((trent, idx) => {
    console.log(`\n[${idx + 1}] ${trent.first_name} ${trent.last_name}`);
    console.log('  ID:', trent.id);
    console.log('  Email:', trent.email);
    console.log('  Slug:', trent.slug);
    console.log('  Enrollment Sponsor ID:', trent.enrollment_sponsor_id);
    console.log('  Created:', trent.created_at);
  });

  // Use the first Trent Daniel for the search
  const trent = trents[0];

  // Search for Potter (any first name)
  const { data: potters, error: potterError } = await serviceClient
    .from('distributors')
    .select('*')
    .ilike('last_name', '%potter%');

  if (potterError || !potters || potters.length === 0) {
    console.log('\n❌ No Potter found in database');

    // Also try searching for "TC" in first name
    const { data: tcSearch } = await serviceClient
      .from('distributors')
      .select('*')
      .or('first_name.ilike.%tc%,first_name.ilike.%t.c.%');

    if (tcSearch && tcSearch.length > 0) {
      console.log('\n=== DISTRIBUTORS WITH "TC" IN NAME ===');
      tcSearch.forEach((dist, idx) => {
        console.log(`\n[${idx + 1}] ${dist.first_name} ${dist.last_name}`);
        console.log('  ID:', dist.id);
        console.log('  Email:', dist.email);
        console.log('  Slug:', dist.slug);
      });
    }
    return;
  }

  console.log(`\n=== FOUND ${potters.length} POTTER(S) ===`);

  for (const potter of potters) {
    console.log(`\n${potter.first_name} ${potter.last_name}`);
    console.log('  ID:', potter.id);
    console.log('  Email:', potter.email);
    console.log('  Slug:', potter.slug);
    console.log('  Enrollment Sponsor ID:', potter.enrollment_sponsor_id);
    console.log('  Created:', potter.created_at);

    // Check if this Potter is under Trent
    if (potter.enrollment_sponsor_id === trent.id) {
      console.log('  ✅ DIRECTLY under Trent Daniel');
    } else {
      // Check if Potter is in Trent's downline (indirect)
      let currentSponsor = potter.enrollment_sponsor_id;
      let depth = 0;
      let found = false;
      const upline: string[] = [];

      while (currentSponsor && depth < 20) {
        const { data: sponsor } = await serviceClient
          .from('distributors')
          .select('id, first_name, last_name, enrollment_sponsor_id')
          .eq('id', currentSponsor)
          .single();

        if (sponsor) {
          depth++;
          upline.push(`${sponsor.first_name} ${sponsor.last_name}`);

          if (sponsor.id === trent.id) {
            console.log(`  ✅ Under Trent Daniel at depth ${depth}`);
            console.log(`  Upline: ${upline.join(' ← ')}`);
            found = true;
            break;
          }
          currentSponsor = sponsor.enrollment_sponsor_id;
        } else {
          break;
        }
      }

      if (!found && upline.length > 0) {
        console.log(`  ❌ NOT under Trent Daniel`);
        console.log(`  Upline: ${upline.join(' ← ')}`);
      } else if (!found) {
        console.log(`  ❌ NOT under Trent Daniel (no sponsor)`);
      }
    }
  }
}

lookupDistributors().catch(console.error);
