// ============================================================
// Send Reminder Emails Script
// Sends corrected schedule reminders to invite recipients
// ============================================================

import { Resend } from 'resend';
import { buildReminderEmail } from './src/lib/email/reminder-email';

const resend = new Resend(process.env.RESEND_API_KEY);

// Recipients invited by Darrell Wolfe
const darrellRecipients = [
  { email: 'sally.zhao@afgia.com', name: 'Sally Zhao' },
  { email: 'lesley.jen@ppfgusa.com', name: 'Lesley Jen' },
  { email: 'tim@bsgideas.com', name: 'Tim' },
  { email: 'Kimberley@intelione.com', name: 'Kimberley' },
  { email: 'mike@infinite-insurance.com', name: 'Mike' },
  { email: 'grace@communitycareagency.com', name: 'Grace' },
  { email: 'cameronfanning@gmail.com', name: 'Cameron Fanning' },
  { email: 'seank@3mark.com', name: 'Sean K' },
  { email: 'beau.Blouin@3mark.com', name: 'Beau Blouin' },
  { email: 'chriscaowsb@gmail.com', name: 'Chris Cao' },
  { email: 'rskaufmann@comcast.net', name: 'R.S. Kaufmann' },
  { email: 'lucywin2014@gmail.com', name: 'Lucy Win' },
  { email: 'reaganwolfe@gmail.com', name: 'Reagan Wolfe' },
  { email: 'ryannwolfe06@icloud.com', name: 'Ryann Wolfe' },
  { email: 'frank.c.dragna@gmail.com', name: 'Frank C. Dragna' },
  { email: 'Antoinehd@gmail.com', name: 'Antoine' },
];

// Recipients invited by Johnathon Bunch
const johnathonRecipients = [
  { email: 'hafeez@pifgonline.com', name: 'Hafeez' },
  { email: 'phil@valorfs.com', name: 'Phil' },
  { email: 'pietrolisa@yahoo.com', name: 'Pietro Lisa' },
];

async function sendReminders() {
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  console.log('📧 Sending reminder emails...\n');

  // Send to Darrell's recipients
  console.log('Sending to Darrell Wolfe\'s invites (16 recipients)...');
  for (const recipient of darrellRecipients) {
    try {
      const { subject, html } = buildReminderEmail(recipient.name, 'Darrell Wolfe');

      await resend.emails.send({
        from: 'Darrell Wolfe via Apex Affinity Group <theapex@theapexway.net>',
        to: recipient.email,
        subject,
        html,
      });

      sent++;
      console.log(`  ✅ Sent to ${recipient.name} (${recipient.email})`);
    } catch (error) {
      failed++;
      const errorMsg = `  ❌ Failed: ${recipient.name} (${recipient.email})`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }

  console.log('\nSending to Johnathon Bunch\'s invites (3 recipients)...');
  for (const recipient of johnathonRecipients) {
    try {
      const { subject, html } = buildReminderEmail(recipient.name, 'Johnathon Bunch');

      await resend.emails.send({
        from: 'Johnathon Bunch via Apex Affinity Group <theapex@theapexway.net>',
        to: recipient.email,
        subject,
        html,
      });

      sent++;
      console.log(`  ✅ Sent to ${recipient.name} (${recipient.email})`);
    } catch (error) {
      failed++;
      const errorMsg = `  ❌ Failed: ${recipient.name} (${recipient.email})`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Results:`);
  console.log(`  ✅ Successfully sent: ${sent}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log('='.repeat(50));

  if (errors.length > 0) {
    console.log('\n⚠️  Errors:');
    errors.forEach(err => console.log(err));
  }
}

// Run the script
sendReminders()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script error:', error);
    process.exit(1);
  });
