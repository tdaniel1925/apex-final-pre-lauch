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

async function debugPlacement() {
  console.log('Debugging placement algorithm for Tavares Davis...\n');

  const tavaresId = '4606542d-c513-49cd-bb48-6c2a047a2ca4';

  // Get children EXACTLY as the algorithm does
  const { data: children, error } = await supabase
    .from('distributors')
    .select('id, matrix_position, matrix_depth')
    .eq('matrix_parent_id', tavaresId)
    .eq('status', 'active')
    .order('matrix_position', { ascending: true });

  console.log('Query for Tavares children:');
  console.log('  .eq(\'matrix_parent_id\', tavaresId)');
  console.log('  .eq(\'status\', \'active\')');
  console.log('');

  if (error) {
    console.log('ERROR:', error);
    return;
  }

  console.log(`Children found: ${children?.length || 0}`);
  console.log('');

  if (children) {
    children.forEach((child, i) => {
      console.log(`  ${i + 1}. ID: ${child.id.substring(0, 8)}..., Position: ${child.matrix_position}, Depth: ${child.matrix_depth}`);
    });
  }

  console.log('');
  console.log(`Check: children.length < 5? ${(children?.length || 0) < 5}`);

  if ((children?.length || 0) < 5) {
    console.log('✓ Algorithm WOULD place here (Tavares has < 5 children)');

    const occupiedPositions = new Set(children?.map(c => c.matrix_position) || []);
    console.log(`  Occupied positions: ${Array.from(occupiedPositions).sort().join(', ')}`);

    for (let pos = 1; pos <= 5; pos++) {
      if (!occupiedPositions.has(pos)) {
        console.log(`  → Would assign position: ${pos}`);
        break;
      }
    }
  } else {
    console.log('✗ Algorithm would add children to queue and search deeper');
  }
}

debugPlacement();
