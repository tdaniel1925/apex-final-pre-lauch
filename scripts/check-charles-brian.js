// Check Charles and Brian in the database
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCharlesAndBrian() {
  console.log('\n=== Searching for Charles Potter ===\n');
  
  // Try different email patterns
  const charlesQueries = [
    'charles@example.com',
    'charles.potter@email.com',
    '%charles%',
    '%potter%'
  ];
  
  for (const query of charlesQueries) {
    const { data, error } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, rep_number')
      .ilike('email', query);
    
    if (data && data.length > 0) {
      console.log(`Found with pattern "${query}":`, data);
    }
  }
  
  // Search by name
  const { data: charlesByName } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, rep_number')
    .ilike('first_name', 'charles');
  
  if (charlesByName && charlesByName.length > 0) {
    console.log('Found Charles by name:', charlesByName);
  }
  
  console.log('\n=== Searching for Brian ===\n');
  
  const { data: brianByName } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, rep_number, sponsor_id')
    .ilike('first_name', 'brian');
  
  if (brianByName && brianByName.length > 0) {
    console.log('Found Brian by name:', brianByName);
  }
  
  console.log('\n=== Checking members table ===\n');
  
  const { data: charlesMembers } = await supabase
    .from('members')
    .select('member_id, full_name, enroller_id')
    .ilike('full_name', '%charles%');
  
  if (charlesMembers && charlesMembers.length > 0) {
    console.log('Found Charles in members:', charlesMembers);
  }
  
  const { data: brianMembers } = await supabase
    .from('members')
    .select('member_id, full_name, enroller_id')
    .ilike('full_name', '%brian%');
  
  if (brianMembers && brianMembers.length > 0) {
    console.log('Found Brian in members:', brianMembers);
  }
}

checkCharlesAndBrian().catch(console.error);
