const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all route.ts files in [id] folders
const files = glob.sync('src/app/api/**/[*]/route.ts', { cwd: process.cwd() });

console.log(`Found ${files.length} files to check`);

let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Pattern 1: { params }: { params: { id: string } }
  if (content.includes('{ params }: { params: { id: string }')) {
    content = content.replace(
      /{ params }: { params: { id: string }/g,
      '{ params }: { params: Promise<{ id: string }>'
    );
    modified = true;
  }

  // Pattern 2: { params }: { params: { id: string; noteId: string } }
  if (content.includes('{ params }: { params: { id: string; noteId: string }')) {
    content = content.replace(
      /{ params }: { params: { id: string; noteId: string }/g,
      '{ params }: { params: Promise<{ id: string; noteId: string }>'
    );
    modified = true;
  }

  // If we modified the type, we need to add await for params access
  if (modified) {
    // Find all function signatures that were modified
    const lines = content.split('\n');
    let inFunction = false;
    let functionStartLine = -1;
    let needsAwait = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if this is a modified function signature
      if (line.includes('{ params }: { params: Promise<{')) {
        inFunction = true;
        functionStartLine = i;
        needsAwait = true;
        continue;
      }

      // If we're in a function that needs await and we hit the try block
      if (needsAwait && line.trim() === 'try {') {
        // Check if next line already has await params
        if (!lines[i + 1].includes('await params')) {
          // Extract param names from function signature
          const signatureLine = lines[functionStartLine];
          const match = signatureLine.match(/Promise<{ (.*?) }>/);
          if (match) {
            const paramNames = match[1].split(';').map(p => p.split(':')[0].trim());
            const destructure = paramNames.length === 1 ? `{ ${paramNames[0]} }` : `{ ${paramNames.join(', ')} }`;

            // Insert await params line after try {
            lines.splice(i + 1, 0, `    // Await params (Next.js 15+ requirement)`);
            lines.splice(i + 2, 0, `    const ${destructure} = await params;`);
            lines.splice(i + 3, 0, ``);
          }
        }
        needsAwait = false;
        inFunction = false;
      }
    }

    content = lines.join('\n');

    // Now replace params.id with id (or other param names)
    content = content.replace(/params\.id(?!:)/g, 'id');
    content = content.replace(/params\.noteId/g, 'noteId');

    fs.writeFileSync(filePath, content);
    fixedCount++;
    console.log(`✅ Fixed: ${file}`);
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
