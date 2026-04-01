const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/api/crm/contacts/[id]/route.ts',
  'src/app/api/crm/leads/[id]/convert/route.ts',
  'src/app/api/crm/leads/[id]/route.ts',
  'src/app/api/crm/tasks/[id]/complete/route.ts',
  'src/app/api/crm/tasks/[id]/route.ts',
];

filesToFix.forEach(file => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Step 1: Fix type declarations
  content = content.replace(
    /{ params }: { params: { id: string } }/g,
    '{ params }: { params: Promise<{ id: string }> }'
  );

  // Step 2: Add await params after try { in each function
  const lines = content.split('\n');
  const newLines = [];
  let justSeenTry = false;
  let needsAwait = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    newLines.push(line);

    // Check if previous lines had the Promise params pattern
    if (i > 0 && lines[i - 1].includes('{ params }: { params: Promise<{ id: string }> }')) {
      needsAwait = true;
    }

    // If we just saw "try {" and we need await
    if (needsAwait && line.trim() === 'try {') {
      justSeenTry = true;
      needsAwait = false;
    }

    // Add await params line after try {
    if (justSeenTry && i < lines.length - 1) {
      // Check if next line already has await params
      if (!lines[i + 1].includes('await params')) {
        newLines.push('    const { id } = await params;');
        newLines.push('');
      }
      justSeenTry = false;
    }
  }

  content = newLines.join('\n');

  // Step 3: Replace params.id with id
  content = content.replace(/params\.id/g, 'id');

  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed: ${file}`);
});

console.log('\n✅ Done!');
