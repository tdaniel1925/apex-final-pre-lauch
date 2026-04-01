const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all route.ts files with params pattern
const files = execSync(
  'grep -r "{ params }: { params:" src/app/api --include="*.ts" -l',
  { encoding: 'utf-8', cwd: process.cwd() }
)
  .split('\n')
  .filter(f => f && !f.includes('.bak'));

console.log(`Found ${files.length} files to fix\n`);

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Pattern 1: { id: string }
  if (content.includes('{ params }: { params: { id: string }')) {
    content = content.replace(
      /{ params }: { params: { id: string } }/g,
      '{ params }: { params: Promise<{ id: string }> }'
    );
    modified = true;
  }

  // Pattern 2: { id: string; noteId: string }
  if (content.includes('{ params }: { params: { id: string; noteId: string }')) {
    content = content.replace(
      /{ params }: { params: { id: string; noteId: string } }/g,
      '{ params }: { params: Promise<{ id: string; noteId: string }> }'
    );
    modified = true;
  }

  // Pattern 3: { slug: string }
  if (content.includes('{ params }: { params: { slug: string }')) {
    content = content.replace(
      /{ params }: { params: { slug: string } }/g,
      '{ params }: { params: Promise<{ slug: string }> }'
    );
    modified = true;
  }

  if (!modified) {
    console.log(`⏭️  Skipped (no match): ${file}`);
    return;
  }

  // Add await params after try { in each function
  const lines = content.split('\n');
  const newLines = [];
  let lastFunctionParams = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line has Promise params
    if (line.includes('{ params }: { params: Promise<{')) {
      const match = line.match(/Promise<{ (.*?) }>/);
      if (match) {
        lastFunctionParams = match[1].split(';').map(p => p.split(':')[0].trim());
      }
    }

    newLines.push(line);

    // If we see "try {" and we have params to await
    if (lastFunctionParams && line.trim() === 'try {') {
      // Check if next line already has await params
      if (i + 1 < lines.length && !lines[i + 1].includes('await params')) {
        const destructure = lastFunctionParams.length === 1
          ? `{ ${lastFunctionParams[0]} }`
          : `{ ${lastFunctionParams.join(', ')} }`;
        newLines.push(`    const ${destructure} = await params;`);
        newLines.push('');
      }
      lastFunctionParams = null;
    }
  }

  content = newLines.join('\n');

  // Replace params.id with id, params.noteId with noteId, params.slug with slug
  content = content.replace(/params\.id(?!:)/g, 'id');
  content = content.replace(/params\.noteId/g, 'noteId');
  content = content.replace(/params\.slug/g, 'slug');

  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed: ${file}`);
});

console.log(`\n✅ Done! Fixed ${files.length} files`);
