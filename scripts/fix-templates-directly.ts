// Fix email templates - replace {{variable}} with {variable}
import { createServiceClient } from '../src/lib/supabase/service';

async function fixTemplates() {
  const supabase = createServiceClient();

  console.log('🔧 Fixing email templates...\n');

  // Get all templates
  const { data: templates, error } = await supabase
    .from('email_templates')
    .select('id, template_key, subject, body');

  if (error || !templates) {
    console.error('❌ Error fetching templates:', error);
    return;
  }

  console.log(`Found ${templates.length} templates\n`);

  for (const template of templates) {
    console.log(`Processing: ${template.template_key}`);
    console.log(`  Current subject: ${template.subject}`);

    // Replace {{var}} with {var}
    const fixedSubject = template.subject.replace(/\{\{/g, '{').replace(/\}\}/g, '}');
    const fixedBody = template.body.replace(/\{\{/g, '{').replace(/\}\}/g, '}');

    if (fixedSubject !== template.subject || fixedBody !== template.body) {
      console.log(`  Fixed subject: ${fixedSubject}`);

      const { error: updateError } = await supabase
        .from('email_templates')
        .update({
          subject: fixedSubject,
          body: fixedBody,
        })
        .eq('id', template.id);

      if (updateError) {
        console.error(`  ❌ Error updating:`, updateError);
      } else {
        console.log(`  ✅ Updated successfully`);
      }
    } else {
      console.log(`  ⏭️  Already correct`);
    }

    console.log('');
  }

  console.log('✅ All templates fixed!');
}

fixTemplates().then(() => {
  console.log('\nDone');
  process.exit(0);
}).catch((error) => {
  console.error('\nError:', error);
  process.exit(1);
});
