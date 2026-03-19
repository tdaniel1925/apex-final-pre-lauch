// =============================================
// Phone Formatting Test Script
// Test all phone formatting functions
// =============================================

// Simulate the formatting functions
function formatPhoneToE164(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  } else if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  return null;
}

function formatPhoneForDisplay(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `${cleaned[0]}-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `1-${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

function formatPhoneInput(input) {
  if (!input) return '';
  const cleaned = input.replace(/\D/g, '');
  const limited = cleaned.slice(0, 10);

  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}-${limited.slice(3)}`;
  } else {
    return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
  }
}

// Test cases
console.log('📱 PHONE FORMATTING TEST\n');
console.log('═'.repeat(60));

const testInputs = [
  '5551234567',
  '555-123-4567',
  '(555) 123-4567',
  '+15551234567',
  '15551234567',
  '+1 555 123 4567',
  '555.123.4567',
];

console.log('\n✅ E.164 STORAGE FORMAT (for Twilio/Database):');
console.log('─'.repeat(60));
testInputs.forEach(input => {
  const result = formatPhoneToE164(input);
  console.log(`Input:  "${input}"`);
  console.log(`E.164:  ${result}`);
  console.log('');
});

console.log('\n📺 DISPLAY FORMAT (for UI):');
console.log('─'.repeat(60));
testInputs.forEach(input => {
  const result = formatPhoneForDisplay(input);
  console.log(`Input:   "${input}"`);
  console.log(`Display: ${result}`);
  console.log('');
});

console.log('\n⌨️  INPUT FORMATTING (as user types):');
console.log('─'.repeat(60));
const typingSequence = ['5', '55', '555', '5551', '55512', '555123', '5551234', '55512345', '555123456', '5551234567'];
typingSequence.forEach(input => {
  const result = formatPhoneInput(input);
  console.log(`Typed: "${input.padEnd(10)}" → Formatted: "${result}"`);
});

console.log('\n');
console.log('═'.repeat(60));
console.log('✅ All formatting tests completed!');
console.log('');
console.log('🔑 KEY POINTS:');
console.log('   • Backend stores: +1XXXXXXXXXX (E.164)');
console.log('   • Frontend displays: 1-XXX-XXX-XXXX');
console.log('   • Input formatting: XXX-XXX-XXXX → 1-XXX-XXX-XXXX');
console.log('   • Twilio receives: +1XXXXXXXXXX (automatically)');
console.log('');
