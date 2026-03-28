// =============================================
// Extract Insurance Comp Documents
// Extract text from Word docs in ins-comp/
// =============================================

import mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';

async function extractInsCompDocs() {
  console.log('📄 Extracting insurance comp documents...\n');

  const insCompDir = path.join(process.cwd(), 'ins-comp');
  const files = fs.readdirSync(insCompDir).filter(f => f.endsWith('.docx'));

  console.log(`Found ${files.length} Word documents:\n`);

  for (const file of files) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📄 ${file}`);
    console.log('='.repeat(80));

    const filePath = path.join(insCompDir, file);

    try {
      const result = await mammoth.extractRawText({ path: filePath });
      const text = result.value;

      // Print the text
      console.log(text);
      console.log('\n');

      // Save to markdown file
      const mdFileName = file.replace('.docx', '.md');
      const mdPath = path.join(insCompDir, mdFileName);
      fs.writeFileSync(mdPath, `# ${file}\n\n${text}`);
      console.log(`✅ Saved to: ${mdFileName}\n`);

    } catch (err) {
      console.error(`❌ Error extracting ${file}:`, err);
    }
  }

  console.log('\n✅ All documents extracted!');
}

extractInsCompDocs();
