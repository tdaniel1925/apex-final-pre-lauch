// Test custom password reset email to tdaniel@botmakers.ai
async function testPasswordReset() {
  console.log('📧 Sending test password reset email...\n');

  const response = await fetch('http://localhost:3050/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'tdaniel@bundelefly.com' }), // Apex Vision's email
  });

  const data = await response.json();

  if (response.ok) {
    console.log('✅ Test email sent successfully!');
    console.log('   To: tdaniel@bundelefly.com (Apex Vision account)');
    console.log('   From: Apex Affinity Group <aag@theapexway.net>');
    console.log('   Subject: Reset Your Password - Apex Affinity Group');
    console.log('\n📧 Check your email for the Apex-branded password reset link!');
  } else {
    console.error('❌ Failed to send:', data);
  }
}

testPasswordReset().then(() => {
  console.log('\n✅ Done');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
