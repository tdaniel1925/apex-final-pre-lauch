const fs = require('fs');

console.log('\n=== Environment File Loading Test ===\n');
console.log('Current directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');

const envFiles = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.development.local',
  '.env.test',
];

console.log('\n📁 Checking for env files:\n');
envFiles.forEach(file => {
  const exists = fs.existsSync(file);
  const symbol = exists ? '✓' : '✗';
  console.log(`${symbol} ${file}`);

  if (exists && file.includes('local')) {
    const content = fs.readFileSync(file, 'utf-8');
    const stripeKey = content.match(/^STRIPE_SECRET_KEY=(.+)$/m);
    if (stripeKey) {
      console.log(`  → Stripe key: ${stripeKey[1].substring(0, 20)}...`);
    }
  }
});

// Now load dotenv and check what it loads
require('dotenv').config({ path: '.env.local' });

console.log('\n🔑 Loaded Stripe keys:\n');
console.log(`STRIPE_SECRET_KEY: ${(process.env.STRIPE_SECRET_KEY || 'NOT SET').substring(0, 20)}...`);
console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'NOT SET').substring(0, 20)}...`);
