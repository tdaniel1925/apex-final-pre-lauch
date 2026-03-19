// Script to test compensation waterfall calculations
import { calculateWaterfall, getBusinessCenterSponsorBonus } from '../src/lib/compensation/waterfall';
import { BUSINESS_CENTER_CONFIG } from '../src/lib/compensation/config';

console.log('='.repeat(60));
console.log('COMPENSATION WATERFALL TEST');
console.log('='.repeat(60));

// Test 1: Standard Product ($100)
console.log('\n📊 TEST 1: Standard Product ($100)');
console.log('-'.repeat(60));
const standard = calculateWaterfall(10000, 'standard');

console.log('Price:', '$' + (standard.priceCents / 100).toFixed(2));
console.log('\nWaterfall Breakdown:');
console.log('  1. BotMakers (30%):', '$' + (standard.botmakersFeeCents / 100).toFixed(2), `(${((standard.botmakersFeeCents / standard.priceCents) * 100).toFixed(2)}%)`);
console.log('  2. Adjusted Gross:', '$' + (standard.adjustedGrossCents / 100).toFixed(2), `(${((standard.adjustedGrossCents / standard.priceCents) * 100).toFixed(2)}%)`);
console.log('  3. Apex (30% of AG):', '$' + (standard.apexTakeCents / 100).toFixed(2), `(${((standard.apexTakeCents / standard.priceCents) * 100).toFixed(2)}%)`);
console.log('  4. Remainder:', '$' + (standard.remainderCents / 100).toFixed(2), `(${((standard.remainderCents / standard.priceCents) * 100).toFixed(2)}%)`);
console.log('  5. Bonus Pool (5%):', '$' + (standard.bonusPoolCents / 100).toFixed(2), `(${((standard.bonusPoolCents / standard.priceCents) * 100).toFixed(2)}%)`);
console.log('  6. Leadership Pool (1.5%):', '$' + (standard.leadershipPoolCents / 100).toFixed(2), `(${((standard.leadershipPoolCents / standard.priceCents) * 100).toFixed(2)}%)`);
console.log('  7. Commission Pool:', '$' + (standard.commissionPoolCents / 100).toFixed(2), `(${((standard.commissionPoolCents / standard.priceCents) * 100).toFixed(2)}%)`);
console.log('  8. Seller Commission (60%):', '$' + (standard.sellerCommissionCents / 100).toFixed(2), `(${((standard.sellerCommissionCents / standard.priceCents) * 100).toFixed(2)}%)`);
console.log('  9. Override Pool (40%):', '$' + (standard.overridePoolCents / 100).toFixed(2), `(${((standard.overridePoolCents / standard.priceCents) * 100).toFixed(2)}%)`);

const totalStandard = standard.botmakersFeeCents + standard.apexTakeCents + standard.bonusPoolCents + standard.leadershipPoolCents + standard.sellerCommissionCents + standard.overridePoolCents;
console.log('\n✓ Total:', '$' + (totalStandard / 100).toFixed(2), '(should equal $100.00)');

// Test 2: Business Center ($39)
console.log('\n\n📦 TEST 2: Business Center ($39)');
console.log('-'.repeat(60));
const bc = calculateWaterfall(BUSINESS_CENTER_CONFIG.PRICE_CENTS, 'business_center');

console.log('Price:', '$' + (bc.priceCents / 100).toFixed(2));
console.log('\nFixed Dollar Breakdown:');
console.log('  1. BotMakers:', '$' + (bc.botmakersFeeCents / 100).toFixed(2));
console.log('  2. Apex:', '$' + (bc.apexTakeCents / 100).toFixed(2));
console.log('  3. Sponsor:', '$' + (getBusinessCenterSponsorBonus() / 100).toFixed(2));
console.log('  4. Rep Commission:', '$' + (bc.sellerCommissionCents / 100).toFixed(2));
console.log('  5. Corporate Expenses:', '$' + (BUSINESS_CENTER_CONFIG.COSTS_CENTS / 100).toFixed(2));

const totalBC = bc.botmakersFeeCents + bc.apexTakeCents + getBusinessCenterSponsorBonus() + bc.sellerCommissionCents + BUSINESS_CENTER_CONFIG.COSTS_CENTS;
console.log('\n✓ Total:', '$' + (totalBC / 100).toFixed(2), '(should equal $39.00)');

// Verify correct values
console.log('\n\n' + '='.repeat(60));
console.log('VERIFICATION');
console.log('='.repeat(60));

const errors: string[] = [];

// Standard Product Checks
if (standard.botmakersFeeCents !== 3000) errors.push('❌ BotMakers should be $30.00');
if (standard.apexTakeCents !== 2100) errors.push('❌ Apex should be $21.00');
if (standard.bonusPoolCents !== 245) errors.push('❌ Bonus Pool should be $2.45 (5% of $49)');
if (standard.leadershipPoolCents !== 74) errors.push('❌ Leadership Pool should be $0.74 (1.5% of $49)');

// Business Center Checks
if (bc.botmakersFeeCents !== 1100) errors.push('❌ BC BotMakers should be $11.00');
if (bc.apexTakeCents !== 800) errors.push('❌ BC Apex should be $8.00');
if (bc.sellerCommissionCents !== 1000) errors.push('❌ BC Rep should be $10.00');
if (getBusinessCenterSponsorBonus() !== 800) errors.push('❌ BC Sponsor should be $8.00');
if (BUSINESS_CENTER_CONFIG.COSTS_CENTS !== 200) errors.push('❌ BC Costs should be $2.00');

if (errors.length > 0) {
  console.log('\n⚠️  ERRORS FOUND:');
  errors.forEach(err => console.log(err));
} else {
  console.log('\n✅ All calculations correct!');
  console.log('\nStandard Product Summary:');
  console.log('  • BotMakers: 30% of retail');
  console.log('  • Apex: 30% of adjusted gross (21% of retail)');
  console.log('  • Bonus Pool: 5% of remainder (2.45% of retail)');
  console.log('  • Field Compensation: 60% direct, 40% overrides');

  console.log('\nBusiness Center Summary:');
  console.log('  • BotMakers: $11');
  console.log('  • Apex: $8');
  console.log('  • Rep: $10');
  console.log('  • Sponsor: $8');
  console.log('  • Costs: $2');
  console.log('  • Total: $39');
}

console.log('\n' + '='.repeat(60));
