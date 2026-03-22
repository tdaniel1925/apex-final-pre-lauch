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

async function checkTavaresPositions() {
  console.log('Checking Tavares Davis matrix positions...\n');

  // Tavares Davis ID from the error message
  const tavaresId = '4606542d-c513-49cd-bb48-6c2a047a2ca4';

  const { data, error } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, matrix_position, matrix_depth')
    .eq('matrix_parent_id', tavaresId)
    .order('matrix_position', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Children under Tavares Davis (${tavaresId}):`);
  console.log('');

  if (data && data.length > 0) {
    data.forEach((child, i) => {
      console.log(`Position ${child.matrix_position}: ${child.first_name} ${child.last_name} (${child.email})`);
    });

    console.log('');
    console.log(`Total: ${data.length}/5 positions filled`);

    // Check which positions are available
    const occupiedPositions = new Set(data.map(c => c.matrix_position));
    const availablePositions = [];

    for (let pos = 1; pos <= 5; pos++) {
      if (!occupiedPositions.has(pos)) {
        availablePositions.push(pos);
      }
    }

    if (availablePositions.length > 0) {
      console.log(`Available positions: ${availablePositions.join(', ')}`);
    } else {
      console.log('All 5 positions are FULL!');
    }
  } else {
    console.log('No children found (0/5 positions filled)');
  }
}

checkTavaresPositions();
