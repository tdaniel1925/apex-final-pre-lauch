// Check existing compensation configuration data
const { Client } = require('pg');

async function checkData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected\n');

    const { rows: plans } = await client.query(`
      SELECT id, name, version, is_active FROM compensation_plan_configs
    `);

    console.log('📋 Compensation Plans:', plans.length);
    plans.forEach(p => console.log(`   - v${p.version}: ${p.name} (${p.is_active ? 'ACTIVE' : 'draft'})`));
    console.log('');

    if (plans.length > 0) {
      const planId = plans[0].id;

      const { rows: ranks } = await client.query(`
        SELECT COUNT(*) as count FROM tech_rank_configs WHERE plan_config_id = $1
      `, [planId]);
      console.log('📋 Tech Ranks:', ranks[0].count);

      const { rows: waterfalls } = await client.query(`
        SELECT COUNT(*) as count FROM waterfall_configs WHERE plan_config_id = $1
      `, [planId]);
      console.log('📋 Waterfalls:', waterfalls[0].count);

      const { rows: bonuses } = await client.query(`
        SELECT COUNT(*) as count FROM bonus_program_configs WHERE plan_config_id = $1
      `, [planId]);
      console.log('📋 Bonus Programs:', bonuses[0].count);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

checkData();
