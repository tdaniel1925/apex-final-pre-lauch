// Create compensation_run_status table with simpler approach
async function createTable() {
  const { Client } = await import('pg');

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log('📄 Creating compensation_run_status table...\n');

  try {
    // Create table first without the partial unique constraint
    await client.query(`
      CREATE TABLE IF NOT EXISTS compensation_run_status (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        run_id UUID NOT NULL UNIQUE,
        status TEXT NOT NULL CHECK (status IN (
          'pending', 'in_progress', 'completed', 'failed', 'cancelled'
        )),
        initiated_by UUID,
        initiated_at TIMESTAMPTZ DEFAULT NOW(),
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        members_processed INT DEFAULT 0,
        commissions_calculated INT DEFAULT 0,
        total_amount_cents BIGINT DEFAULT 0,
        error_message TEXT,
        dry_run BOOLEAN DEFAULT TRUE,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    console.log('✅ Table created\n');

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_comp_run_status_period ON compensation_run_status(period_start, period_end)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_comp_run_status_status ON compensation_run_status(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_comp_run_status_run_id ON compensation_run_status(run_id)');

    console.log('✅ Indexes created\n');

    // Create update trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_compensation_run_status_updated_at ON compensation_run_status
    `);

    await client.query(`
      CREATE TRIGGER update_compensation_run_status_updated_at
        BEFORE UPDATE ON compensation_run_status
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('✅ Trigger created\n');

    // Enable RLS
    await client.query('ALTER TABLE compensation_run_status ENABLE ROW LEVEL SECURITY');

    console.log('✅ RLS enabled\n');

    console.log('✅ Migration complete!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  await client.end();
}

createTable().catch(console.error);
