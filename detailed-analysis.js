// The real issue analysis
console.log(`
╔════════════════════════════════════════════════════════════════╗
║           ROOT CAUSE ANALYSIS: Email Send Failure              ║
╚════════════════════════════════════════════════════════════════╝

THE PROBLEM:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

send-phone-request-emails.js (line 50):
  console.log(\`✅ Sent! Message ID: \${result.id}\`);

The Resend SDK returns data in this structure:
  ✅ SUCCESS:  { data: { id: 'xxxx' }, error: null }
  ❌ FAILURE:  { data: null, error: { message: '...' } }

But the script tries to access:
  result.id           ← This doesn't exist! (always undefined)
  Should be: result.data?.id or result.data.id


WHAT HAPPENED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Script tried to send 17 emails ✓
2. Resend API returned success for each (if data was valid) ✓
3. But script logged: "✅ Sent! Message ID: undefined" ✗
4. The script has NO error handling for response.data ✗
5. Script assumed result.error would catch failures ✗
6. But Resend returns { data: null, error: {...} } on real failures ✗


THE CONFUSION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The console output says "✅ Sent!" 17 times because:
- The try/catch caught NO exceptions
- result.id is undefined (silent failure indicator)
- The script never checked result.error or result.data

The RESEND DASHBOARD shows the emails as FAILED because:
- The API call likely failed (wrong from address? rate limit?)
- Or they succeeded but 17 invalid/test recipients
- OR (most likely) the "from" address: notifications@reachtheapex.net
  is not verified/configured in Resend


VERIFICATION STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Check Resend dashboard for these 17 emails
   - Are they in "Sent", "Delivered", "Failed", or "Bounced"?
   - Check the error message in Resend UI

2. Check if the "from" address is verified:
   - Line 44: from: 'Apex Affinity Group <notifications@reachtheapex.net>'
   - In /api/invites/send/route.ts line 181: from: '{name} via Apex Affinity Group <theapex@theapexway.net>'
   - These use DIFFERENT from addresses!

3. Check Resend API rate limits:
   - Headers show: ratelimit-limit: 5; ratelimit-remaining: 4
   - This is VERY LOW! Only 5 emails per minute

4. Check error logging:
   - The script's try/catch only logs on thrown exceptions
   - It NEVER checks result.error or result.data

THE FIX:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace lines 43-50 with:

  const result = await resend.emails.send({...});
  
  // Check if Resend returned an error
  if (result.error) {
    console.error(\`❌ Error sending to \${rep.email}:\`, result.error.message);
    errorCount++;
  } else if (!result.data?.id) {
    console.error(\`❌ Invalid response for \${rep.email}\`);
    errorCount++;
  } else {
    console.log(\`✅ Sent! Message ID: \${result.data.id}\`);
    successCount++;
  }

This will properly detect failures and show actual error messages.
`);
