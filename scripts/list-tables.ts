import dotenv from 'dotenv'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function listTables() {
  // Query information_schema to get all tables
  const { data, error } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `
    })

  if (error) {
    console.log('Trying direct query instead...\n')

    // Try a known table to test connection
    const testResult: any = await (supabase as any).from('auth.users').select('count')
    console.log('Auth users query:', testResult)
  } else {
    console.log('Tables:', data)
  }
}

listTables()
