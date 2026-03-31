const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'APEX_COMP_ENGINE_SPEC_FINAL.md');

// Read the file
let content = fs.readFileSync(filePath, 'utf-8');

console.log('🔄 Updating APEX_COMP_ENGINE_SPEC_FINAL.md with QV/BV/GQV system...\n');

// ===== SECTION 2: PRODUCTS & VOLUME METRICS =====
console.log('📦 Section 2: Products & Volume Metrics...');

const oldSection2 = `## 2. PRODUCTS & PRODUCTION CREDITS

| Product | Member | Retail | Credit % | Mem Credits | Ret Credits |
|---|---|---|---|---|------|
| PulseGuard | $59 | $79 | 30% | 18 | 24 |
| PulseFlow | $129 | $149 | 50% | 65 | 75 |
| PulseDrive | $219 | $299 | 100% | 219 | 299 |
| PulseCommand | $349 | $499 | 100% | 349 | 499 |
| SmartLook | $99 | $99 | 40% | 40 | 40 |
| Business Center | $39 | — | — | 39 | — |

### Credit Calculation

\`\`\`python
def calc_credits(product, price_type):
    if product.id == 'business_center':
        return 39  # Fixed BV
    price = product.member_price if price_type == 'member' else product.retail_price
    return round(price * product.credit_pct)
\`\`\``;

const newSection2 = `## 2. PRODUCTS & VOLUME METRICS (QV/BV/GQV)

**KEY TERMINOLOGY:**
- **QV (Qualifying Volume)** = Purchase price (what customer pays)
- **BV (Business Volume)** = Remainder after waterfall (commission pool)
- **GQV (Group Qualifying Volume)** = Sum of team's QV
- **GBV (Group Business Volume)** = Sum of team's BV

| Product | Member | Retail | QV (Member) | QV (Retail) | BV (Member) | BV (Retail) |
|---|---|---|---|---|---|---|
| PulseMarket | $59 | $79 | 59 | 79 | $27.58 | $36.94 |
| PulseFlow | $129 | $149 | 129 | 149 | $60.32 | $69.66 |
| PulseDrive | $259 | $299 | 259 | 299 | $121.08 | $139.76 |
| PulseCommand | $429 | $499 | 429 | 499 | $200.60 | $233.26 |
| SmartLook | $99 | $99 | 99 | 99 | $46.28 | $46.28 |
| Business Center | $39 | — | 39 | — | $10.00 | — |

**Note:** BV for Business Center is fixed at $10 (not waterfall). All other products follow waterfall calculation.

### QV & BV Calculation

\`\`\`python
def calc_qv_and_bv(product, price_type):
    """
    QV (Qualifying Volume) = Purchase price
    BV (Business Volume) = Remainder after waterfall
    """
    if product.id == 'business_center':
        return {'qv': 39, 'bv': 10.00}  # Fixed for BC

    price = product.member_price if price_type == 'member' else product.retail_price
    qv = price  # QV = purchase price

    # BV = remainder after waterfall
    bm_fee = price * 0.30
    adjusted_gross = price - bm_fee
    apex_take = adjusted_gross * 0.30
    remainder = adjusted_gross - apex_take
    bonus_pool = remainder * 0.035
    leadership_pool = remainder * 0.015
    bv = remainder - bonus_pool - leadership_pool

    return {'qv': qv, 'bv': round(bv, 2)}
\`\`\``;

content = content.replace(oldSection2, newSection2);

// ===== SECTION 3: DATA MODEL =====
console.log('🗄️  Section 3: Data Model...');

// Replace field names in data model
content = content.replace(/personal_credits_monthly/g, 'personal_qv_monthly');
content = content.replace(/group_credits_monthly/g, 'group_qv_monthly');  // This is GQV
content = content.replace(/cross_credit_tech_to_ins/g, 'cross_credit_tech_to_ins_qv');
content = content.replace(/cross_credit_ins_to_tech/g, 'cross_credit_ins_to_tech_qv');

// Add BV fields to schema
const schemaSection = content.match(/(CREATE TABLE members \([\s\S]*?-- Credits[\s\S]*?INT DEFAULT 0,)/);
if (schemaSection) {
  const oldSchema = schemaSection[1];
  const newSchema = oldSchema.replace(
    /-- Credits.*\n.*personal_qv_monthly.*INT DEFAULT 0,\n.*group_qv_monthly.*INT DEFAULT 0,/,
    `  -- Volume Metrics (QV/BV/GQV)
  personal_qv_monthly        INT DEFAULT 0,       -- Qualifying Volume
  personal_bv_monthly        DECIMAL(10,2) DEFAULT 0, -- Business Volume
  group_qv_monthly           INT DEFAULT 0,       -- Group Qualifying Volume (GQV)
  group_bv_monthly           DECIMAL(10,2) DEFAULT 0, -- Group Business Volume (GBV)`
  );
  content = content.replace(oldSchema, newSchema);
}

// ===== SECTION 4: TECH LADDER =====
console.log('🪜 Section 4: Tech Ladder Ranks...');

content = content.replace(/Personal Credits\/Mo/g, 'Personal QV/Mo');
content = content.replace(/Group Credits\/Mo/g, 'Group QV/Mo (GQV)');

// Update rank requirements table
const rankTable = `| Rank | Personal QV/Mo | Group QV/Mo (GQV) | Downline Rank Req | Rank Bonus | Override Depth |
|---|---|---|---|---|---|
| Starter | 0 | 0 | None | — | L1 only |
| Bronze | 150 | 300 | None | $250 | L1–L2 |
| Silver | 500 | 1,500 | None | $1,000 | L1–L3 |
| Gold | 1,200 | 5,000 | 1 Bronze (sponsored) | $3,000 | L1–L4 |
| Platinum | 2,500 | 15,000 | 2 Silvers (sponsored) | $7,500 | L1–L5 |
| Ruby | 4,000 | 30,000 | 2 Golds (sponsored) | $12,000 | L1–L5 |
| Diamond | 5,000 | 50,000 | 3 Golds OR 2 Plat (sponsored) | $18,000 | L1–L5 |
| Crown | 6,000 | 75,000 | 2 Plat + 1 Gold (sponsored) | $22,000 | L1–L5 |
| Elite | 8,000 | 120,000 | 3 Plat OR 2 Diamond (sponsored) | $30,000 | L1–L5+Ldshp |`;

const oldRankTable = /\| Rank \| Personal.*Credits.*\n\|---|.*\n(?:\|.*\n){9}/;
if (content.match(oldRankTable)) {
  content = content.replace(oldRankTable, rankTable + '\n');
}

// ===== SECTION 5: OVERRIDE QUALIFICATION =====
console.log('💰 Section 5: Override Qualification...');

content = content.replace(/50 Credits\/Month Minimum/g, '50 QV/Month Minimum');
content = content.replace(/50\+ personal credits\/month/g, '50+ personal QV/month');
content = content.replace(/member\.personal_qv_monthly >= 50/g, 'member.personal_qv_monthly >= 50');

// ===== GLOBAL REPLACEMENTS =====
console.log('🌐 Global replacements (credits → QV)...');

// Replace "credits" with "QV" in comments and descriptions (but preserve code variable names we already changed)
content = content.replace(/(\d+) credits/gi, '$1 QV');
content = content.replace(/generate (\d+\+?) credits/gi, 'generate $1 QV');
content = content.replace(/Must earn \d+ personal credits/gi, match => match.replace('credits', 'QV'));

// Write the updated content
fs.writeFileSync(filePath, content, 'utf-8');

console.log('\n✅ APEX_COMP_ENGINE_SPEC_FINAL.md updated successfully!');
console.log('\n📊 Changes made:');
console.log('   - Section 2: Products table now shows QV/BV columns');
console.log('   - Section 3: Data model updated with QV/BV/GQV/GBV fields');
console.log('   - Section 4: Tech ladder uses QV/GQV thresholds');
console.log('   - Section 5: Override qualification is 50 QV minimum');
console.log('   - Global: Replaced "credits" with "QV" terminology');
