// Test email to verify Resend delivery
// This simulates the n8n workflow email

async function sendTestEmail() {
  const RESEND_API_KEY = 're_N7WUE23T_FuSdXfAbD7WodviGa3nJnPtw';

  const emailPayload = {
    from: 'Apex Affinity Group <theapex@theapexway.net>',
    to: ['tdaniel@botmakers.ai'],
    subject: 'TEST: n8n Daily Enrollment Report',
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#ffffff;margin:0;padding:0">
  <div style="max-width:900px;margin:40px auto;background:#ffffff;padding:40px">

    <div style="text-align:center;margin-bottom:30px">
      <img src="https://reachtheapex.net/apex-affinity-logo.png" alt="Apex Affinity Group" style="max-width:250px;height:auto">
    </div>

    <div style="text-align:center;margin-bottom:40px">
      <h1 style="color:#2c5aa0;margin:0;font-size:28px;font-weight:bold">APEX AFFINITY GROUP</h1>
      <h2 style="color:#495057;margin:10px 0 0;font-size:20px;font-weight:normal">ENROLLMENT REPORT - TEST</h2>
      <p style="color:#6c757d;margin:10px 0 0">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <div style="text-align:center;margin-bottom:40px;padding:30px;background:#f8f9fa;border-radius:8px">
      <div style="font-size:56px;font-weight:bold;color:#2c5aa0;margin-bottom:10px">3</div>
      <div style="font-size:16px;color:#495057;text-transform:uppercase;letter-spacing:1px">Sample Test Signups</div>
    </div>

    <div style="margin-bottom:40px">
      <h3 style="color:#212529;font-size:18px;margin:0 0 20px;border-bottom:2px solid #2c5aa0;padding-bottom:10px">Enrollment Details</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#2c5aa0;color:#fff">
            <th style="padding:12px;text-align:left">Date/Time</th>
            <th style="padding:12px;text-align:left">Name</th>
            <th style="padding:12px;text-align:left">Email</th>
            <th style="padding:12px;text-align:left">Phone</th>
            <th style="padding:12px;text-align:left">Slug</th>
            <th style="padding:12px;text-align:left">Sponsored By</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:12px;border:1px solid #ddd">4/5/2026, 10:30 AM</td>
            <td style="padding:12px;border:1px solid #ddd">John Smith</td>
            <td style="padding:12px;border:1px solid #ddd">john@example.com</td>
            <td style="padding:12px;border:1px solid #ddd">(555) 123-4567</td>
            <td style="padding:12px;border:1px solid #ddd">johnsmith</td>
            <td style="padding:12px;border:1px solid #ddd">Phil Resch</td>
          </tr>
          <tr>
            <td style="padding:12px;border:1px solid #ddd">4/5/2026, 2:15 PM</td>
            <td style="padding:12px;border:1px solid #ddd">Sarah Johnson</td>
            <td style="padding:12px;border:1px solid #ddd">sarah@example.com</td>
            <td style="padding:12px;border:1px solid #ddd">(555) 987-6543</td>
            <td style="padding:12px;border:1px solid #ddd">sarahj</td>
            <td style="padding:12px;border:1px solid #ddd">Ahn Doan</td>
          </tr>
          <tr>
            <td style="padding:12px;border:1px solid #ddd">4/5/2026, 4:45 PM</td>
            <td style="padding:12px;border:1px solid #ddd">Mike Davis</td>
            <td style="padding:12px;border:1px solid #ddd">mike@example.com</td>
            <td style="padding:12px;border:1px solid #ddd">N/A</td>
            <td style="padding:12px;border:1px solid #ddd">mikedavis</td>
            <td style="padding:12px;border:1px solid #ddd">Direct</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="text-align:center;padding-top:30px;border-top:1px solid #dee2e6">
      <p style="color:#6c757d;font-size:12px;margin:0">TEST EMAIL - Automated report from n8n workflow automation</p>
      <p style="color:#6c757d;font-size:12px;margin:5px 0 0">© ${new Date().getFullYear()} Apex Affinity Group. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
    `,
  };

  console.log('Sending test email to tdaniel@botmakers.ai...');
  console.log('From:', emailPayload.from);
  console.log('Subject:', emailPayload.subject);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(emailPayload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Email send failed');
    console.error('Status:', response.status);
    console.error('Error:', data);
    return;
  }

  console.log('✅ Email sent successfully!');
  console.log('Email ID:', data.id);
  console.log('\nCheck tdaniel@botmakers.ai inbox (and spam folder) for the test email.');
}

sendTestEmail().catch(console.error);
