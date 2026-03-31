const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'db', 'schema.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf-8');

console.log('🔄 Updating TypeScript schema with QV/BV/GQV system...\n');

// ===== Update Member interface =====
console.log('👤 Updating Member interface...');

// Replace the credits section in Member interface
const oldMemberFields = `  // LIVE BV DATA (Source of Truth)
  personal_credits_monthly: number; // ✅ USE THIS for personal BV
  team_credits_monthly: number; // ✅ USE THIS for team BV
  tech_personal_credits_monthly: number;
  tech_team_credits_monthly: number;
  insurance_personal_credits_monthly: number;
  insurance_team_credits_monthly: number;

  // Override Qualification
  override_qualified: boolean; // Auto-calculated: personal_credits_monthly >= 50`;

const newMemberFields = `  // VOLUME METRICS (Source of Truth)
  // QV = Qualifying Volume (purchase price)
  // BV = Business Volume (remainder after waterfall, used for commissions)
  // GQV = Group Qualifying Volume (sum of team QV)
  // GBV = Group Business Volume (sum of team BV)

  personal_qv_monthly: number; // ✅ USE THIS for personal QV
  personal_bv_monthly: number; // ✅ USE THIS for personal BV (commission pool)
  group_qv_monthly: number; // ✅ USE THIS for team QV (GQV) - rank qualification
  group_bv_monthly: number; // ✅ USE THIS for team BV (GBV)

  tech_personal_qv_monthly: number;
  tech_group_qv_monthly: number;
  insurance_personal_qv_monthly: number;
  insurance_group_qv_monthly: number;

  // Override Qualification
  override_qualified: boolean; // Auto-calculated: personal_qv_monthly >= 50`;

content = content.replace(oldMemberFields, newMemberFields);

// ===== Update DistributorWithMember interface =====
console.log('🔗 Updating DistributorWithMember interface...');

const oldDistWithMember = `export interface DistributorWithMember extends Distributor {
  member: {
    personal_credits_monthly: number;
    team_credits_monthly: number;
    override_qualified: boolean;
    tech_rank: TechRank;
    paying_rank: TechRank;
  };
}`;

const newDistWithMember = `export interface DistributorWithMember extends Distributor {
  member: {
    personal_qv_monthly: number;
    personal_bv_monthly: number;
    group_qv_monthly: number; // GQV
    group_bv_monthly: number; // GBV
    override_qualified: boolean;
    tech_rank: TechRank;
    paying_rank: TechRank;
  };
}`;

content = content.replace(oldDistWithMember, newDistWithMember);

// ===== Update comments about credits =====
console.log('💬 Updating comments...');

// Update comment in Distributor interface
content = content.replace(
  /Dual-ladder rank tracking with monthly BV\/credits/,
  'Dual-ladder rank tracking with monthly QV/BV/GQV/GBV metrics'
);

content = content.replace(
  /CRITICAL: This is the ONLY source of truth for BV data!\n \* Always JOIN with this table for personal_credits_monthly and team_credits_monthly/,
  'CRITICAL: This is the ONLY source of truth for QV/BV data!\n * Always JOIN with this table for personal_qv_monthly, personal_bv_monthly, group_qv_monthly (GQV), group_bv_monthly (GBV)'
);

// ===== Add Product QV/BV fields =====
console.log('📦 Adding QV/BV fields to Product interface...');

// Find Product interface and add new fields
const productInterface = content.match(/(export interface Product \{[\s\S]*?bv: number;[^\n]*\n)/);
if (productInterface) {
  const oldProduct = productInterface[1];
  const newProduct = oldProduct.replace(
    /bv: number;.*\n/,
    `qv_member: number | null; // Qualifying Volume (member price)
  qv_retail: number | null; // Qualifying Volume (retail price)
  bv_member: number | null; // Business Volume (member price, after waterfall)
  bv_retail: number | null; // Business Volume (retail price, after waterfall)
  bv: number; // Legacy field - use qv_member/qv_retail and bv_member/bv_retail instead
`
  );
  content = content.replace(oldProduct, newProduct);
}

// ===== Add Order QV/BV fields =====
console.log('📋 Adding QV/BV fields to Order interface...');

const orderInterface = content.match(/(export interface Order \{[\s\S]*?total_bv: number;[^\n]*\n)/);
if (orderInterface) {
  const oldOrder = orderInterface[1];
  const newOrder = oldOrder.replace(
    /total_bv: number;.*\n/,
    `total_qv: number; // Total Qualifying Volume
  total_bv_calculated: number; // Total Business Volume (calculated from waterfall)
  total_bv: number; // Legacy field - use total_bv_calculated instead
`
  );
  content = content.replace(oldOrder, newOrder);
}

// Write the updated content
fs.writeFileSync(filePath, content, 'utf-8');

console.log('\n✅ TypeScript schema updated successfully!');
console.log('\n📊 Changes made:');
console.log('   - Member interface: Updated to use QV/BV/GQV/GBV fields');
console.log('   - DistributorWithMember: Updated join type');
console.log('   - Product interface: Added qv_member, qv_retail, bv_member, bv_retail');
console.log('   - Order interface: Added total_qv, total_bv_calculated');
console.log('   - Comments: Updated to reflect QV/BV terminology');
