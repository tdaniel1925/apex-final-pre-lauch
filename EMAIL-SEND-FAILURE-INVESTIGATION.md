# Email Send Failure Investigation Report

Date: March 19, 2026  
Incident: 17 emails to distributors without phone numbers failed to send  
Status: ROOT CAUSE IDENTIFIED

---

## Executive Summary

Batch emails attempting to send SMS feature announcements to 17 distributors appeared to succeed in the console output but actually failed silently in Resend. 

ROOT CAUSES IDENTIFIED:
1. Script error handling bug - doesn't validate Resend response structure
2. Unverified from address - using notifications@reachtheapex.net instead of verified theapex@theapexway.net
3. Silent failure handling - script never checks result.error or validates result.data

---

## The Problem

send-phone-request-emails.js line 50:
  const result = await resend.emails.send({...});
  console.log(`✅ Sent! Message ID: ${result.id}\n`);  // WRONG!

The Resend SDK returns: { data: { id: 'xxxx' }, error: null }
But script accesses: result.id (which is undefined!)
Should access: result.data.id

---

## Evidence

Test output shows "undefined" message IDs:
  ✅ Sent! Message ID: undefined
  ✅ Sent! Message ID: undefined
  ... (repeated 17 times)

This indicates the response structure was wrong.

---

## Root Cause #1: Response Handling Bug

Resend SDK Response Structure:
{
  data: { id: '61140988-b509-492a-8998-a700958a244d' },
  error: null,
  headers: { ratelimit-limit: 5, ratelimit-remaining: 4, ... }
}

Script tries to access: result.id → undefined
Should be: result.data.id → "61140988-..."

The script has ZERO validation of the response, so it counts
failures as successes.

---

## Root Cause #2: Unverified From Address

send-phone-request-emails.js uses:
  from: 'Apex Affinity Group <notifications@reachtheapex.net>'

But working code uses:
  from: 'Apex Affinity Group <theapex@theapexway.net>'

Resend requires verified domains/addresses. The script uses
an unverified address while other code uses a verified one
(since test emails worked).

When Resend receives email from unverified address:
  { data: null, error: { message: "Email not sent from verified domain" } }

---

## Root Cause #3: Silent Failure

Script only catches thrown exceptions:

try {
  const result = await resend.emails.send({...});
  console.log(`✅ Sent!`);
  successCount++;  // Counted as success!
} catch (err) {
  console.error(err);  // Only catches thrown errors
}

Resend SDK doesn't throw exceptions for API errors. It returns:
  { error: { message: '...' } }

Script never checks result.error, so failures pass as successes.

---

## The 17 Affected Recipients

1. Matthew Porter (matthewbporter@yahoo.com)
2. Trinity Rawlston (trinr187@gmail.com)
3. Saalik Patel (saalik@lifeguardagency.com)
4. Falguni Jariwala (plan4securelife@gmail.com)
5. Dessiah Daniel (dessiah@m.botmakers.ai)
6. Trent Daniel (tdaniel@bundlefly.com)
7. John Tran (svn1906@hotmail.com)
8. Juan Olivella (juandavid0305@icloud.com)
9. Eric Wullschleger (wullschleger.eric@gmail.com)
10. John Jacob (johnjacob67@gmail.com)
11. Hafeez Rangwala (hafeez@pifgonline.com)
12. Mark Hughes (marhughes@gmail.com)
13. Hannah Townsend (hannah@bedrockfinancialplanning.com)
14. Justin Christensen (justin@3markslc.com)
15. Grayson Millard (grayson@3markslc.com)
16. Phil Resch (phil@valorfs.com)
17. Apex Vision (tdaniel@botmakers.ai)

These users did NOT receive the SMS feature announcement email.

---

## Immediate Fix

1. Change send-phone-request-emails.js line 44:
   from: 'Apex Affinity Group <theapex@theapexway.net>'

2. Add proper error handling (replace lines 43-50):
   const result = await resend.emails.send({...});
   
   if (result.error) {
     console.error(`Error: ${result.error.message}`);
     errorCount++;
   } else if (!result.data?.id) {
     console.error(`Invalid response`);
     errorCount++;
   } else {
     console.log(`✅ Sent! ID: ${result.data.id}`);
     successCount++;
   }

3. Verify Resend dashboard:
   https://resend.com/emails
   Look for emails from Mar 19, 2026 to these recipients
   Check if they show "Failed" status with verification error

4. Re-send with corrected script to all 17 recipients

---

## Long-term Recommendations

1. Use src/lib/email/resend.ts for all email sending (already correct)
2. Add email logging to database for audit trail
3. Consolidate from addresses to single verified: theapex@theapexway.net
4. Add validation before batch sending
5. Add rate limiting awareness (Resend shows limit-5: only 5 per minute)

---

## Related Files

Email Sending Code:
  src/lib/email/resend.ts (CORRECT - has error handling)
  src/app/api/invites/send/route.ts (uses Resend class)
  src/app/api/test-email/route.ts (test endpoint)
  src/app/api/admin/test-email/route.ts (admin test)

Script (FAILED):
  send-phone-request-emails.js (manual script - not in git)
  sms-feature-announcement-email.html (template)

Commit:
  11af2db: feat: add SMS attendance notifications and phone number requirements

---

SUMMARY:
The script appeared to succeed (said "✅ Sent!" 17 times) but actually failed
because it used an unverified sender address AND didn't validate the response.
The console output was misleading because it checked neither result.error nor
result.data, just logged result.id which was always undefined.

Resend dashboard likely shows these 17 emails as "Failed" with status
"Email not sent from a verified domain" or similar error.
