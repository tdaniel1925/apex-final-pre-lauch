console.log(`
╔════════════════════════════════════════════════════════════════╗
║              FROM ADDRESS VERIFICATION ISSUE                   ║
╚════════════════════════════════════════════════════════════════╝

The script uses:
  from: 'Apex Affinity Group <notifications@reachtheapex.net>'
        └─ notifications@reachtheapex.net

But other files use:
  from: 'Apex Affinity Group <theapex@theapexway.net>'
        └─ theapex@theapexway.net

AND in /api/invites/send/route.ts:
  from: '\${senderName} via Apex Affinity Group <theapex@theapexway.net>'
        └─ theapex@theapexway.net


CRITICAL ISSUE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Resend requires the "from" address to be:
1. ✅ A verified domain OR
2. ✅ An official Resend address OR
3. ❌ An unverified third-party address (FAILS)

If notifications@reachtheapex.net is NOT verified in Resend,
the emails will be rejected with an error like:
  "Email not sent from a verified domain"

This explains why:
- Test emails worked (may have used verified address)
- 17 batch emails failed (used unverified notifications@...)
- No actual error was logged (script didn't check result.error)
- Console said "✅ Sent!" but Resend dashboard shows "Failed"


NEXT STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Check Resend dashboard:
   https://resend.com/emails
   
   Look for the 17 emails with recipients:
   - matthewbporter@yahoo.com
   - trinr187@gmail.com
   - saalik@lifeguardagency.com
   - ... (and 14 others)
   
   Check their status and error messages

2. Verify your domain in Resend:
   https://resend.com/domains
   
   Make sure:
   - reachtheapex.net is configured
   - All subdomains are verified (notifications@, theapex@, etc.)

3. Use a known-good "from" address:
   Change script to use: theapex@theapexway.net
   (This is already verified based on test emails working)

4. Fix the error handling in the script to catch and log
   result.error and missing result.data
`);
