// Test Agent 2: Business Signup
const http = require('http');

const testBusinessSignup = async () => {
  console.log('\n🧪 AGENT 2: Testing Business Signup');
  console.log('='.repeat(60));

  const timestamp = Date.now();
  const testData = {
    registration_type: 'business',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: `sarah.johnson.test${timestamp}@example.com`,
    password: 'TestPass123!',
    slug: `sarahjohnson${timestamp}`,
    phone: '555-987-6543',
    company_name: 'Johnson Insurance Agency LLC',
    business_type: 'llc',
    dba_name: 'Johnson Agency',
    business_website: 'https://johnsonagency.com',
    address_line1: '456 Business Blvd Suite 200',
    city: 'Houston',
    state: 'TX',
    zip: '77001',
    ein: '12-3456789',
    licensing_status: 'licensed',
    sponsor_slug: 'apex-vision',
  };

  console.log('\n📝 Test Data:');
  console.log(JSON.stringify({ ...testData, ein: 'XX-XXXXXXX', password: '***' }, null, 2));

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
      console.log('\n✅ SUCCESS: Business signup completed!');
      console.log(`Distributor ID: ${resultData.data?.distributor?.id}`);
      console.log(`Company Name: ${resultData.data?.distributor?.company_name}`);
      console.log(`Business Type: ${resultData.data?.distributor?.business_type}`);
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
testBusinessSignup()
  .then((result) => {
    process.exit(result.success ? 0 : 1);
  })
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
