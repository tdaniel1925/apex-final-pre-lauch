# Dependency Analysis System

## Overview

This system provides a **full dependency map** of the entire Apex application that you can refer to when making changes. It helps you understand:

- Which files depend on which other files
- Which files are most critical (imported by many others)
- Which files are most complex (import many others)
- Circular dependencies that need fixing
- Orphan files that might be unused

## Quick Start

### Run Full Analysis

```bash
npm run analyze:deps
```

This generates:
- `dependency-analysis/DEPENDENCY-REPORT.md` - Human-readable report
- `dependency-analysis/dependency-data.json` - Machine-readable data
- `dependency-analysis/dependency-graph.svg` - Visual graph (if Graphviz installed)

### Quick Commands

```bash
# Check for circular dependencies only
npm run deps:circular

# Generate visual graph (requires Graphviz)
npm run deps:graph

# Analyze specific directories
npm run deps:api          # API routes only
npm run deps:components   # Components only
```

## Current Analysis Results

### App Statistics

- **Total Files:** 974
- **Total Dependencies:** 1,466
- **Average Dependencies:** 1.5 per file
- **Circular Dependencies:** 1 (needs fixing)
- **Orphan Files:** 113

### Critical Files (Most Depended Upon)

These are your **CORE UTILITIES** - changes to these files affect many parts of the app:

1. **lib/supabase/server.ts** (244 imports) - Database access
2. **lib/supabase/service.ts** (177 imports) - Service role database
3. **lib/auth/admin.ts** (103 imports) - Admin authentication
4. **lib/types/index.ts** (74 imports) - Type definitions
5. **components/ui/button.tsx** (46 imports) - UI components

**⚠️ IMPORTANT:** Before modifying these files:
1. Review all dependent files
2. Run full test suite
3. Check for breaking changes
4. Update TypeScript types if needed

### Complex Files (Most Dependencies)

These files import many modules and may benefit from refactoring:

1. **components/admin/DistributorDetailView.tsx** (14 imports)
2. **components/admin/SmartOfficeClient.tsx** (12 imports)
3. **app/api/signup/route.ts** (10 imports)

### Circular Dependency (Needs Fixing)

```
components/organization/OrganizationTable.tsx ↔ components/organization/OrganizationRow.tsx
```

**How to fix:**
1. Extract shared types to separate file
2. Use dependency injection
3. Refactor to one-way dependency

## How to Use Before Making Changes

### Scenario 1: Modifying Core Utility

**Example:** You want to change `lib/supabase/server.ts`

1. **Check dependency report:**
   ```bash
   npm run analyze:deps
   ```

2. **Find in "Most Depended Upon" section:**
   - Shows **244 files** import this module
   - This is a CRITICAL file

3. **Review impact:**
   - Open `dependency-analysis/dependency-data.json`
   - Search for files importing `lib/supabase/server.ts`
   - Test each affected area

4. **Test thoroughly:**
   ```bash
   npm run test
   npm run test:e2e
   ```

### Scenario 2: Adding New Feature

**Example:** You want to add a new dashboard widget

1. **Check existing patterns:**
   ```bash
   npm run deps:components
   ```

2. **Find similar components:**
   - Look at other dashboard components
   - See what utilities they use
   - Follow same dependency patterns

3. **After implementation:**
   ```bash
   npm run analyze:deps
   ```
   - Verify no circular dependencies added
   - Check your file doesn't have too many imports

### Scenario 3: Refactoring Complex File

**Example:** `DistributorDetailView.tsx` has 14 imports

1. **View current dependencies:**
   ```bash
   npm run analyze:deps
   ```

2. **Extract reusable logic:**
   - Create new utility files
   - Move business logic to lib/
   - Keep component focused on UI

3. **Verify improvement:**
   ```bash
   npm run analyze:deps
   ```
   - Check import count decreased
   - Ensure no circular deps created

## Understanding the Data

### dependency-data.json Structure

```json
{
  "dependencyTree": {
    "file/path.ts": [
      "dependency1.ts",
      "dependency2.ts"
    ]
  },
  "mostDependent": [
    { "file": "complex-file.ts", "count": 14 }
  ],
  "mostDependedUpon": [
    { "file": "core-util.ts", "count": 244 }
  ],
  "circularDependencies": [
    ["file1.ts", "file2.ts"]
  ],
  "orphanFiles": ["unused-file.ts"]
}
```

### Programmatic Access

```typescript
import dependencies from './dependency-analysis/dependency-data.json';

// Find what a file imports
const imports = dependencies.dependencyTree['src/app/dashboard/page.tsx'];

// Find what imports a file
const importedBy = Object.entries(dependencies.dependencyTree)
  .filter(([_, deps]) => deps.includes('lib/supabase/server.ts'))
  .map(([file]) => file);

// Check if file is critical (>50 imports)
const isCritical = dependencies.mostDependedUpon
  .find(f => f.file === 'lib/supabase/server.ts')?.count > 50;
```

## Best Practices

### 1. Run Analysis Regularly

- **Before major refactoring**
- **After adding new features**
- **Weekly during active development**
- **Before releases**

### 2. Keep Dependencies Minimal

Good:
```typescript
// Only import what you need
import { createClient } from '@/lib/supabase/server';
```

Bad:
```typescript
// Importing entire module
import * as supabase from '@/lib/supabase/server';
```

### 3. Fix Circular Dependencies Immediately

- Circular deps can cause runtime errors
- Make code harder to test
- Indicate poor separation of concerns

### 4. Review Orphan Files

- May indicate unused code
- Could be pages not linked in nav
- Might be legacy files to remove

### 5. Monitor Core Files

Files in "Most Depended Upon" list need:
- **Comprehensive tests**
- **Clear documentation**
- **Careful version control**
- **Code review for all changes**

## Integration with Development Workflow

### Pre-Commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
# Check for new circular dependencies
npm run deps:circular

if [ $? -ne 0 ]; then
  echo "❌ Circular dependencies detected!"
  echo "Run: npm run analyze:deps"
  exit 1
fi
```

### CI/CD Pipeline

Add to GitHub Actions:

```yaml
- name: Analyze Dependencies
  run: |
    npm run analyze:deps

- name: Upload Analysis
  uses: actions/upload-artifact@v3
  with:
    name: dependency-analysis
    path: dependency-analysis/
```

### Code Review Checklist

Before approving PR:
- [ ] No new circular dependencies
- [ ] No new high-dependency files (>10 imports)
- [ ] Core files not modified without tests
- [ ] Dependency analysis report reviewed

## Troubleshooting

### "Graphviz not found" Error

The visual graph requires Graphviz.

**Windows:**
```bash
choco install graphviz
```

**Mac:**
```bash
brew install graphviz
```

**Linux:**
```bash
apt-get install graphviz
```

Or skip visual graph - JSON/report still generated.

### Analysis Takes Too Long

Analyze specific directories:
```bash
# Just API routes
npx madge src/app/api

# Just components
npx madge src/components

# Just lib utilities
npx madge src/lib
```

### False Positives in Orphans

Some files are meant to be standalone:
- API route endpoints
- Page components (accessed via routes)
- Cron jobs
- Webhooks

This is normal and not a problem.

## Advanced Usage

### Find All Files Using a Module

```bash
npx madge --depends lib/supabase/server.ts src
```

### Exclude Test Files

```bash
npx madge --exclude '\.test\.' src
```

### Export as DOT Format

```bash
npx madge --dot src > dependency-graph.dot
```

### Analyze Package Dependencies

```bash
npx madge --json package.json > package-deps.json
```

## When to Re-run Analysis

### Always

- Before modifying core utilities
- After major refactoring
- Before production releases

### Often

- After adding new features
- When file gets too complex
- Weekly during active development

### Occasionally

- Monthly maintenance check
- Before architecture changes
- When onboarding new developers

## Questions?

Contact: tdaniel@botmakers.ai
