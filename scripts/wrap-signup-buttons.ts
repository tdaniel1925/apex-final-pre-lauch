// Temporary script to wrap all signup buttons with isMainSite conditional
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src/components/optive/OptiveReplicatedSite.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Pattern to match <a href={signupUrl}...>...</a> buttons
// We need to find each button and wrap it with {!isMainSite && (...)}

const lines = content.split('\n');
const result: string[] = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i];

  // Check if this line contains href={signupUrl}
  if (line.includes('href={signupUrl}') && line.trim().startsWith('<a')) {
    // This is a signup button line
    // Check if it's already wrapped
    if (i > 0 && lines[i-1].includes('{!isMainSite &&')) {
      // Already wrapped, skip
      result.push(line);
      i++;
      continue;
    }

    // Get indentation
    const indent = line.match(/^(\s*)/)?.[1] || '';

    // Check if it's a self-closing or multi-line button
    if (line.includes('</a>')) {
      // Single line button - wrap it
      result.push(`${indent}{!isMainSite && (`);
      result.push(line);
      result.push(`${indent})}`);
    } else {
      // Multi-line button - find the closing tag
      result.push(`${indent}{!isMainSite && (`);
      result.push(line);
      i++;

      // Keep adding lines until we find </a>
      while (i < lines.length) {
        result.push(lines[i]);
        if (lines[i].includes('</a>')) {
          result.push(`${indent})}`);
          break;
        }
        i++;
      }
    }
    i++;
  } else {
    result.push(line);
    i++;
  }
}

fs.writeFileSync(filePath, result.join('\n'), 'utf-8');
console.log('✅ Wrapped all signup buttons with isMainSite conditional');
