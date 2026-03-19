// Test Agent 1: Personal Signup
const http = require('http');

const testPersonalSignup = async () => {
  console.log('\n🧪 AGENT 1: Testing Personal Signup');
  console.log('=' .repeat(60));

  const timestamp = Date.now();
  const testData = {
    registration_type: 'personal',
    first_name: 'John',
    last_name: 'Smith',
    email: `john.smith.test${timestamp}@example.com`,
    password: 'TestPass123!',
    slug: `johnsmith${timestamp}`,
    phone: '555-123-4567',
    address_line1: '123 Main Street',
    city: 'Dallas',
    state: 'TX',
    zip: '75001',
    date_of_birth: '1990-05-15',
    ssn: '123-45-6789',
    licensing_status: 'licensed',
    sponsor_slug: 'apex-vision', // Use master distributor
  };

  console.log('\n📝 Test Data:');
  console.log(JSON.stringify({ ...testData, ssn: 'XXX-XX-XXXX', password: '***' }, null, 2));

  try {
    console.log('\n🚀 Sending signup request...');

    const result = await new Promise((resolve, reject) => {
      const data = JSON.stringify(testData);

      const options = {
        hostname: 'localhost',
        port: 3050,
        path: '/api/signup',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, statusText: res.statusMessage, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, statusText: res.statusMessage, data: { error: 'Parse error', raw: body } });
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });

    const response = { status: result.status, statusText: result.statusText, ok: result.status >= 200 && result.status < 300 };
    const resultData = result.data;

    console.log('\n📊 Response:');
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(JSON.stringify(resultData, null, 2));

    if (response.ok && resultData.success) {
      console.log('\n✅ SUCCESS: Personal signup completed!');
      console.log(`Distributor ID: ${resultData.data?.distributor?.id}`);
      console.log(`Matrix Position: ${resultData.data?.matrix_placement?.position}`);
      console.log(`Matrix Depth: ${resultData.data?.matrix_placement?.depth}`);
      return { success: true, result: resultData };
    } else {
      console.log('\n❌ FAILED: Signup returned error');
      console.log(`Error: ${resultData.error}`);
      console.log(`Message: ${resultData.message}`);
      return { success: false, error: resultData };
    }
  } catch (error) {
    console.log('\n💥 EXCEPTION:', error.message);
    console.log(error.stack);
    return { success: false, error: error.message };
  }
};

// Run test
testPersonalSignup()
  .then((result) => {
    process.exit(result.success ? 0 : 1);
  })
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
