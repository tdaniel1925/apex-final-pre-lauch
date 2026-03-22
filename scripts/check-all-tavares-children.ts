import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAll() {
  const tavaresId = '4606542d-c513-49cd-bb48-6c2a047a2ca4';

  console.log('ALL children under Tavares (no status filter):\n');

  const { data, error } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, matrix_position, status')
    .eq('matrix_parent_id', tavaresId)
    .order('matrix_position', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data) {
    data.forEach(child => {
      console.log(`Position ${child.matrix_position}: ${child.first_name} ${child.last_name} - Status: ${child.status}`);
    });

    console.log(`\nTotal: ${data.length} children`);

    const activeCount = data.filter(c => c.status === 'active').length;
    console.log(`Active: ${activeCount}`);
    console.log(`Non-active: ${data.length - activeCount}`);
  }
}

checkAll();
