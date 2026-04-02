// Check what the runtime actually sees
console.log('\n🔍 RUNTIME ENVIRONMENT CHECK\n');
console.log('================================\n');

console.log('STRIPE_SECRET_KEY:');
console.log('  First 15 chars:', process.env.STRIPE_SECRET_KEY?.substring(0, 15) || 'NOT SET');
console.log('  Mode:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? '✅ LIVE' : '⚠️ TEST');

console.log('\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:');
console.log('  First 15 chars:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 15) || 'NOT SET');
console.log('  Mode:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_') ? '✅ LIVE' : '⚠️ TEST');

console.log('\nNODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('\n');
