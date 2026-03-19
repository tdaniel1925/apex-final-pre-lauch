const { Resend } = require('resend');

const resend = new Resend('re_test_key');

async function test() {
  const result = await resend.emails.send({
    from: 'test@example.com',
    to: 'user@example.com',
    subject: 'Test',
    html: '<p>Test</p>',
  }).catch(e => ({ error: e }));
  
  console.log('What the script checks:');
  console.log('- result.id:', result.id);
  console.log('- result.data:', result.data);
  console.log('- result.data?.id:', result.data?.id);
  console.log('\nIn the script (line 50): console.log(`✅ Sent! Message ID: ${result.id}`)');
  console.log('Should be: console.log(`✅ Sent! Message ID: ${result.data.id}`)');
  console.log('\nThis is why all 17 emails show "undefined" message IDs!');
}

test();
