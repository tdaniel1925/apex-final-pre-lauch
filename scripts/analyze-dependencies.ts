#!/usr/bin/env node

/**
 * Comprehensive Dependency Analysis
 *
 * Generates a full dependency map of the application
 * - Visual graph (SVG)
 * - JSON export for programmatic access
 * - Circular dependency detection
 * - Module usage statistics
 */

import madge from 'madge';
import fs from 'fs/promises';
import path from 'path';

interface DependencyStats {
  totalFiles: number;
  totalDependencies: number;
  circularDependencies: string[][];
  orphanFiles: string[];
  mostDependent: Array<{ file: string; count: number }>;
  mostDependedUpon: Array<{ file: string; count: number }>;
  dependencyTree: Record<string, string[]>;
}

async function analyzeDependencies() {
  console.log('🔍 Analyzing Application Dependencies\n');

  try {
    // Analyze src directory
    console.log('📊 Scanning src/ directory...');
    const result = await madge('src', {
      fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      excludeRegExp: [
        /\.test\./,
        /\.spec\./,
        /__tests__/,
        /node_modules/,
        /\.next/,
        /dist/,
        /build/
      ],
      tsConfig: './tsconfig.json',
      webpack: false
    });

    // Get dependency tree
    const dependencyTree = result.obj();
    const circularDeps = result.circular();

    // Calculate statistics
    const allFiles = Object.keys(dependencyTree);
    const totalFiles = allFiles.length;
    const totalDeps = Object.values(dependencyTree).flat().length;

    // Find orphan files (no dependencies and not depended upon)
    const dependedUponFiles = new Set(Object.values(dependencyTree).flat());
    const orphans = allFiles.filter(
      file => dependencyTree[file].length === 0 && !dependedUponFiles.has(file)
    );

    // Find most dependent files (files that import many others)
    const mostDependent = allFiles
      .map(file => ({ file, count: dependencyTree[file].length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Find most depended upon files (files imported by many others)
    const dependedUponCount: Record<string, number> = {};
    Object.values(dependencyTree).flat().forEach(dep => {
      dependedUponCount[dep] = (dependedUponCount[dep] || 0) + 1;
    });

    const mostDependedUpon = Object.entries(dependedUponCount)
      .map(([file, count]) => ({ file, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const stats: DependencyStats = {
      totalFiles,
      totalDependencies: totalDeps,
      circularDependencies: circularDeps,
      orphanFiles: orphans,
      mostDependent,
      mostDependedUpon,
      dependencyTree
    };

    // Create output directory
    const outputDir = path.join(process.cwd(), 'dependency-analysis');
    await fs.mkdir(outputDir, { recursive: true });

    // Generate visual graph (SVG) - requires Graphviz
    try {
      console.log('📈 Generating dependency graph (requires Graphviz)...');
      const imagePath = path.join(outputDir, 'dependency-graph.svg');
      await result.image(imagePath);
      console.log('✅ Graph generated successfully');
    } catch (error: any) {
      console.log('⚠️  Skipping graph generation (Graphviz not installed)');
      console.log('   To install: choco install graphviz (Windows)');
    }

    // Save JSON data
    console.log('💾 Saving analysis data...');
    const jsonPath = path.join(outputDir, 'dependency-data.json');
    await fs.writeFile(jsonPath, JSON.stringify(stats, null, 2));

    // Generate detailed report
    const report = generateReport(stats);
    const reportPath = path.join(outputDir, 'DEPENDENCY-REPORT.md');
    await fs.writeFile(reportPath, report);

    // Print summary
    console.log('\n✨ Analysis Complete!\n');
    console.log(`📊 Statistics:`);
    console.log(`   - Total Files: ${totalFiles}`);
    console.log(`   - Total Dependencies: ${totalDeps}`);
    console.log(`   - Average Dependencies per File: ${(totalDeps / totalFiles).toFixed(1)}`);
    console.log(`   - Circular Dependencies: ${circularDeps.length}`);
    console.log(`   - Orphan Files: ${orphans.length}`);

    if (circularDeps.length > 0) {
      console.log('\n⚠️  Circular Dependencies Detected:');
      circularDeps.slice(0, 5).forEach(cycle => {
        console.log(`   ${cycle.join(' → ')}`);
      });
      if (circularDeps.length > 5) {
        console.log(`   ... and ${circularDeps.length - 5} more`);
      }
    }

    console.log('\n📁 Output Files:');
    console.log(`   - Visual Graph: dependency-analysis/dependency-graph.svg`);
    console.log(`   - JSON Data: dependency-analysis/dependency-data.json`);
    console.log(`   - Report: dependency-analysis/DEPENDENCY-REPORT.md`);

  } catch (error: any) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

function generateReport(stats: DependencyStats): string {
  const {
    totalFiles,
    totalDependencies,
    circularDependencies,
    orphanFiles,
    mostDependent,
    mostDependedUpon
  } = stats;

  return `# Apex Affinity Group - Dependency Analysis Report

Generated: ${new Date().toISOString()}

## Overview

- **Total Files:** ${totalFiles}
- **Total Dependencies:** ${totalDependencies}
- **Average Dependencies per File:** ${(totalDependencies / totalFiles).toFixed(1)}
- **Circular Dependencies:** ${circularDependencies.length}
- **Orphan Files:** ${orphanFiles.length}

## Most Dependent Files

These files import the most other modules:

${mostDependent.map((item, i) => `${i + 1}. **${item.file}** (${item.count} dependencies)`).join('\n')}

## Most Depended Upon Files

These files are imported by the most other modules (core utilities):

${mostDependedUpon.map((item, i) => `${i + 1}. **${item.file}** (imported ${item.count} times)`).join('\n')}

## Circular Dependencies

${circularDependencies.length === 0
  ? '✅ No circular dependencies detected!'
  : `⚠️ Found ${circularDependencies.length} circular dependency cycles:\n\n${circularDependencies.map((cycle, i) => `### Cycle ${i + 1}\n\`\`\`\n${cycle.join(' →\n')}\n\`\`\``).join('\n\n')}`
}

## Orphan Files

${orphanFiles.length === 0
  ? '✅ No orphan files detected!'
  : `⚠️ Found ${orphanFiles.length} orphan files (not imported and don't import anything):\n\n${orphanFiles.map(file => `- \`${file}\``).join('\n')}`
}

## Recommendations

### High Priority

${circularDependencies.length > 0
  ? '1. **Fix Circular Dependencies** - Circular dependencies can cause runtime errors and make code harder to maintain.\n'
  : ''
}${orphanFiles.length > 0
  ? '2. **Review Orphan Files** - These files may be unused and can be removed to reduce bundle size.\n'
  : ''
}

### Code Quality

1. **Core Utilities** - Files in the "Most Depended Upon" list are critical. Changes to these files affect many parts of the app.
2. **Complex Files** - Files in the "Most Dependent" list may be doing too much and could benefit from refactoring.

## Usage Guide

### Before Making Changes

1. Check if file is in "Most Depended Upon" list
2. If yes, review all dependent files before modifying
3. Run tests after changes
4. Re-run this analysis to verify no new circular dependencies

### Adding New Features

1. Keep dependencies minimal
2. Import from core utilities when possible
3. Avoid creating circular dependencies
4. Re-run analysis periodically

### Refactoring

1. Target files with high dependency counts
2. Extract reusable logic to utilities
3. Break up large files into smaller modules
4. Verify dependency graph improves

## Commands

\`\`\`bash
# Re-run analysis
npm run analyze:deps

# Generate visual graph only
npx madge --image dependency-graph.svg src

# Find circular dependencies
npx madge --circular src

# Analyze specific directory
npx madge --image api-graph.svg src/app/api
\`\`\`
`;
}

analyzeDependencies();
