const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing QV/BV TypeScript Errors\n');

// Files with TypeScript errors
const fixes = [
  {
    file: 'src/app/dashboard/genealogy/page.tsx',
    replacements: [
      {
        from: /personal_qv_monthly: d\.member\.personal_qv_monthly,\s*group_qv_monthly: d\.member\.group_qv_monthly,/,
        to: `personal_qv_monthly: d.member.personal_qv_monthly,
        personal_bv_monthly: d.member.personal_bv_monthly || 0,
        group_qv_monthly: d.member.group_qv_monthly,
        group_bv_monthly: d.member.group_bv_monthly || 0,`
      }
    ]
  },
  {
    file: 'src/app/dashboard/home/page.tsx',
    replacements: [
      {
        from: /personalCredits:/g,
        to: 'personalQV:'
      },
      {
        from: /teamCredits:/g,
        to: 'groupQV:'
      }
    ]
  },
  {
    file: 'src/components/dashboard/CompensationStatsWidget.test.tsx',
    replacements: [
      {
        from: /personalCredits:/g,
        to: 'personalQV:'
      },
      {
        from: /teamCredits:/g,
        to: 'groupQV:'
      }
    ]
  },
  {
    file: 'src/components/genealogy/CompensationTreeView.test.tsx',
    replacements: [
      {
        from: /personal_credits_monthly:/g,
        to: 'personal_qv_monthly:'
      },
      {
        from: /team_credits_monthly:/g,
        to: 'group_qv_monthly:'
      }
    ]
  },
  {
    file: 'src/components/genealogy/TreeNodeCard.test.tsx',
    replacements: [
      {
        from: /personal_credits_monthly:/g,
        to: 'personal_qv_monthly:'
      },
      {
        from: /team_credits_monthly:/g,
        to: 'group_qv_monthly:'
      }
    ]
  }
];

let totalFixes = 0;

for (const { file, replacements } of fixes) {
  const fullPath = path.join(__dirname, '..', file);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  SKIP: ${file} (not found)`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;
  let fileChanges = 0;

  for (const { from, to } of replacements) {
    const matches = content.match(from);
    if (matches) {
      content = content.replace(from, to);
      fileChanges += matches.length;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ ${file} (${fileChanges} fixes)`);
    totalFixes += fileChanges;
  } else {
    console.log(`⏭️  ${file} (no changes needed)`);
  }
}

console.log(`\n✅ Applied ${totalFixes} TypeScript fixes`);
