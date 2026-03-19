// Apply compensation configuration migrations
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Migration 1: Core schema
    console.log('📄 Migration 1: Compensation Config System');
    console.log('   Creating tables, triggers, and helper functions...');

    const migration1 = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20260316000010_compensation_config_system.sql'),
      'utf8'
    );

    await client.query(migration1);
    console.log('   ✅ Migration 1 applied successfully\n');

    // Verify tables were created
    const { rows: tables } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN (
        'compensation_plan_configs',
        'tech_rank_configs',
        'waterfall_configs',
        'bonus_program_configs',
        'compensation_config_audit_log'
      )
      ORDER BY table_name
    `);

    console.log('   📋 Tables created:');
    tables.forEach(t => console.log(`      - ${t.table_name}`));
    console.log('');

    // Migration 2: Seed default config
    console.log('📄 Migration 2: Seed Default Configuration');
    console.log('   Loading Version 1 (2026 Standard Plan)...');

    const migration2 = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20260316000011_seed_default_compensation_config_v2.sql'),
      'utf8'
    );

    await client.query(migration2);
    console.log('   ✅ Migration 2 applied successfully\n');

    // Verify seed data
    const { rows: configs } = await client.query(`
      SELECT id, name, version, effective_date, is_active
      FROM compensation_plan_configs
    `);

    console.log('   📋 Compensation plans:');
    configs.forEach(c => {
      console.log(`      - v${c.version}: ${c.name} (${c.is_active ? 'ACTIVE' : 'draft'})`);
      console.log(`        Effective: ${c.effective_date}`);
    });
    console.log('');

    const { rows: ranks } = await client.query(`
      SELECT rank_name, personal_credits_required, group_credits_required,
             rank_bonus_cents/100.0 as bonus_usd
      FROM tech_rank_configs
      WHERE plan_config_id = (SELECT id FROM compensation_plan_configs WHERE is_active = TRUE)
      ORDER BY rank_order
    `);

    console.log('   📋 Tech ranks seeded:');
    ranks.forEach(r => {
      console.log(`      - ${r.rank_name}: ${r.personal_credits_required}/${r.group_credits_required} credits, $${r.bonus_usd} bonus`);
    });
    console.log('');

    const { rows: waterfalls } = await client.query(`
      SELECT product_type, botmakers_pct, apex_pct, bonus_pool_pct,
             leadership_pool_pct, seller_commission_pct, override_pool_pct
      FROM waterfall_configs
      WHERE plan_config_id = (SELECT id FROM compensation_plan_configs WHERE is_active = TRUE)
    `);

    console.log('   📋 Waterfall configs:');
    waterfalls.forEach(w => {
      console.log(`      - ${w.product_type}:`);
      console.log(`        BotMakers: ${w.botmakers_pct}%, Apex: ${w.apex_pct}%`);
      console.log(`        Pools: ${w.bonus_pool_pct}% + ${w.leadership_pool_pct}%`);
      console.log(`        Seller: ${w.seller_commission_pct}%, Override: ${w.override_pool_pct}%`);
    });
    console.log('');

    const { rows: bonuses } = await client.query(`
      SELECT program_name, enabled
      FROM bonus_program_configs
      WHERE plan_config_id = (SELECT id FROM compensation_plan_configs WHERE is_active = TRUE)
      ORDER BY program_name
    `);

    console.log('   📋 Bonus programs:');
    bonuses.forEach(b => {
      console.log(`      - ${b.program_name}: ${b.enabled ? '✅ enabled' : '❌ disabled'}`);
    });
    console.log('');

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ MIGRATIONS COMPLETE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('Summary:');
    console.log(`  ✅ ${tables.length}/5 tables created`);
    console.log(`  ✅ ${configs.length} compensation plan(s) loaded`);
    console.log(`  ✅ ${ranks.length} tech ranks configured`);
    console.log(`  ✅ ${waterfalls.length} waterfall configs loaded`);
    console.log(`  ✅ ${bonuses.length} bonus programs configured`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Visit /admin/compensation-settings to view UI');
    console.log('  2. Test waterfall editor with live data');
    console.log('  3. Create a new plan version to test versioning');
    console.log('═══════════════════════════════════════════════════════');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('\nFull error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigrations();
