const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'api', 'webhooks', 'stripe', 'route.ts');

let content = fs.readFileSync(filePath, 'utf-8');

console.log('🔄 Updating webhook handler with QV/BV system...\n');

// Add import for QV/BV calculator at the top
if (!content.includes('qv-bv-calculator')) {
  content = content.replace(
    /import { calculateCreditedBV } from '@\/lib\/compliance\/anti-frontloading';/,
    `import { calculateCreditedBV } from '@/lib/compliance/anti-frontloading';
import { calculateQVAndBV } from '@/lib/compensation/qv-bv-calculator';`
  );
  console.log('✅ Added QV/BV calculator import');
}

// Update handlePulseProductCheckout to calculate and store QV/BV
const oldPulseHandler = /\/\/ Determine which price was used[\s\S]*?const priceCents = priceType === 'member' \? product\.wholesale_price_cents : product\.retail_price_cents;/;

const newPulseHandler = `// Determine which price was used
    const priceType = metadata.price_type || 'retail';
    const priceCents = priceType === 'member' ? product.wholesale_price_cents : product.retail_price_cents;

    // Calculate QV and BV
    const { qv, bv } = calculateQVAndBV(priceCents, product.slug);
    console.log(\`💰 Calculated QV: \${qv}, BV: $\${bv.toFixed(2)}\`);`;

content = content.replace(oldPulseHandler, newPulseHandler);

// Update order creation to include QV/BV
content = content.replace(
  /total_cents: session\.amount_total \|\| priceCents,\s*total_bv: product\.bv,/,
  `total_cents: session.amount_total || priceCents,
        total_qv: qv,
        total_bv_calculated: bv,
        total_bv: product.bv, // Legacy field`
);

// Update BV crediting to use both QV and BV
content = content.replace(
  /const baseBV = product\.bv;/,
  `const baseQV = qv;
      const baseBV = bv;`
);

// Update member BV credit to use QV and BV
content = content.replace(
  /await supabase\s*\.from\('members'\)\s*\.update\(\{\s*personal_credits_monthly: \(referrerMember\.personal_credits_monthly \|\| 0\) \+ credited_bv,\s*\}\)/,
  `await supabase.from('members').update({
        personal_qv_monthly: (referrerMember.personal_qv_monthly || 0) + baseQV,
        personal_bv_monthly: (referrerMember.personal_bv_monthly || 0) + credited_bv,
      })`
);

// Update commission calculation comment
content = content.replace(
  /\/\/ Calculate commission \(60% of total BV\)/,
  '// Calculate commission (60% of BV pool)'
);

// Replace all personal_credits_monthly references
content = content.replace(/personal_credits_monthly/g, 'personal_qv_monthly');

// Replace member query selects
content = content.replace(
  /\.select\('member_id, personal_qv_monthly'\)/g,
  ".select('member_id, personal_qv_monthly, personal_bv_monthly')"
);

fs.writeFileSync(filePath, content, 'utf-8');

console.log('✅ Webhook handler updated successfully!');
console.log('\n📊 Changes made:');
console.log('   - Added QV/BV calculator import');
console.log('   - Calculate QV and BV from price');
console.log('   - Store total_qv and total_bv_calculated in orders');
console.log('   - Credit both QV and BV to referrer');
console.log('   - Updated all personal_credits_monthly → personal_qv_monthly');
console.log('   - Updated member queries to select both QV and BV');
