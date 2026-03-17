/**
 * Dashboard Routes Audit Script
 * Comprehensive audit of all dashboard routes and functionality
 */

import fs from 'fs';
import path from 'path';

interface RouteAudit {
  path: string;
  status: 'working' | 'broken' | 'partial' | 'unknown';
  issues: string[];
  missing_apis: string[];
  broken_components: string[];
  broken_handlers: string[];
  security_issues: string[];
  auth_check: boolean;
}

interface AuditReport {
  summary: {
    total_routes: number;
    working_routes: number;
    broken_routes: number;
    partial_routes: number;
    missing_api_endpoints: number;
    broken_buttons: number;
    security_issues: number;
  };
  routes: RouteAudit[];
  critical_issues: string[];
  recommendations: string[];
}

const DASHBOARD_DIR = path.join(process.cwd(), 'src/app/dashboard');
const API_DIR = path.join(process.cwd(), 'src/app/api');
const COMPONENTS_DIR = path.join(process.cwd(), 'src/components');

// Common issues patterns to check
const ISSUE_PATTERNS = {
  // Missing handlers
  onClick_no_handler: /onClick=\{(\s*)\}/,
  onSubmit_no_handler: /onSubmit=\{(\s*)\}/,

  // Broken API calls
  fetch_api: /fetch\(['"`](\/api\/[^'"`]+)['"`]/g,
  axios_api: /axios\.(get|post|put|delete)\(['"`](\/api\/[^'"`]+)['"`]/g,

  // Component imports
  import_component: /import\s+(?:\{[^}]+\}|\w+)\s+from\s+['"]@\/components\/([^'"]+)['"]/g,

  // Auth patterns
  auth_check: /(getUser|getSession|useUser|createClient)/,
  redirect_login: /redirect\(['"`]\/login['"`]\)/,

  // Buttons without handlers
  button_no_handler: /<[Bb]utton[^>]*(?!onClick|type=["']submit["']|asChild)[^>]*>/g,

  // Forms without submit
  form_no_submit: /<form[^>]*(?!onSubmit)[^>]*>/g,

  // Broken links
  link_href: /<Link\s+href=["']([^"']+)["']/g,
};

function getAllDashboardRoutes(): string[] {
  const routes: string[] = [];

  function traverse(dir: string, basePath: string = '') {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath, `${basePath}/${file}`);
      } else if (file === 'page.tsx') {
        routes.push(fullPath);
      }
    }
  }

  traverse(DASHBOARD_DIR);
  return routes;
}

function getAPIEndpoints(): Set<string> {
  const endpoints = new Set<string>();

  function traverse(dir: string, basePath: string = '') {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Handle dynamic routes
        const cleanName = file.startsWith('[') && file.endsWith(']')
          ? ':id'
          : file;
        traverse(fullPath, `${basePath}/${cleanName}`);
      } else if (file === 'route.ts') {
        endpoints.add(basePath);
      }
    }
  }

  traverse(API_DIR, '/api');
  return endpoints;
}

function getExistingComponents(): Set<string> {
  const components = new Set<string>();

  function traverse(dir: string, basePath: string = '') {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath, basePath ? `${basePath}/${file}` : file);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const componentName = file.replace(/\.(tsx|ts)$/, '');
        const componentPath = basePath ? `${basePath}/${componentName}` : componentName;
        components.add(componentPath);
      }
    }
  }

  traverse(COMPONENTS_DIR);
  return components;
}

function auditRoute(routePath: string, apiEndpoints: Set<string>, components: Set<string>): RouteAudit {
  const content = fs.readFileSync(routePath, 'utf-8');
  const relativePath = routePath.replace(DASHBOARD_DIR, '/dashboard').replace(/\\page\.tsx$/, '').replace(/\\/g, '/');

  const audit: RouteAudit = {
    path: relativePath || '/dashboard',
    status: 'working',
    issues: [],
    missing_apis: [],
    broken_components: [],
    broken_handlers: [],
    security_issues: [],
    auth_check: false,
  };

  // Check for auth
  if (ISSUE_PATTERNS.auth_check.test(content)) {
    audit.auth_check = true;
  } else {
    audit.security_issues.push('No authentication check found');
    audit.status = 'broken';
  }

  // Check for API calls
  const fetchMatches = [...content.matchAll(ISSUE_PATTERNS.fetch_api)];
  const axiosMatches = [...content.matchAll(ISSUE_PATTERNS.axios_api)];

  for (const match of [...fetchMatches, ...axiosMatches]) {
    const apiPath = match[1] || match[2];
    // Normalize dynamic routes for comparison
    const normalizedPath = apiPath.replace(/\/[^/]+(?=\/|$)/g, (segment) => {
      // If segment looks like it might be dynamic, replace with :id
      if (segment.includes('${') || segment.includes('`')) {
        return '/:id';
      }
      return segment;
    });

    if (!apiEndpoints.has(apiPath) && !apiEndpoints.has(normalizedPath)) {
      audit.missing_apis.push(apiPath);
      audit.status = audit.status === 'working' ? 'partial' : audit.status;
    }
  }

  // Check for component imports
  const componentMatches = [...content.matchAll(ISSUE_PATTERNS.import_component)];
  for (const match of componentMatches) {
    const componentPath = match[1];
    if (!components.has(componentPath)) {
      audit.broken_components.push(componentPath);
      audit.status = 'broken';
    }
  }

  // Check for buttons without handlers (if client component)
  if (content.includes("'use client'")) {
    const buttonMatches = [...content.matchAll(ISSUE_PATTERNS.button_no_handler)];
    if (buttonMatches.length > 0) {
      audit.broken_handlers.push(`${buttonMatches.length} buttons may be missing onClick handlers`);
      audit.issues.push('Potential buttons without handlers detected');
    }

    // Check for forms without submit handlers
    const formMatches = [...content.matchAll(ISSUE_PATTERNS.form_no_submit)];
    if (formMatches.length > 0) {
      audit.broken_handlers.push(`${formMatches.length} forms may be missing onSubmit handlers`);
      audit.issues.push('Potential forms without submit handlers detected');
    }
  }

  // Check for broken links
  const linkMatches = [...content.matchAll(ISSUE_PATTERNS.link_href)];
  for (const match of linkMatches) {
    const href = match[1];
    // Only check dashboard links
    if (href.startsWith('/dashboard/')) {
      const targetPath = path.join(DASHBOARD_DIR, href.replace('/dashboard', ''), 'page.tsx');
      if (!fs.existsSync(targetPath)) {
        audit.issues.push(`Link to non-existent route: ${href}`);
        audit.status = audit.status === 'working' ? 'partial' : audit.status;
      }
    }
  }

  // Check for TypeScript errors (basic)
  if (content.includes('// @ts-ignore') || content.includes('// @ts-expect-error')) {
    audit.issues.push('Contains TypeScript suppression comments');
  }

  return audit;
}

function generateReport(): AuditReport {
  console.log('🔍 Starting dashboard audit...\n');

  console.log('📂 Scanning API endpoints...');
  const apiEndpoints = getAPIEndpoints();
  console.log(`   Found ${apiEndpoints.size} API endpoints\n`);

  console.log('🧩 Scanning components...');
  const components = getExistingComponents();
  console.log(`   Found ${components.size} components\n`);

  console.log('📄 Scanning dashboard routes...');
  const routes = getAllDashboardRoutes();
  console.log(`   Found ${routes.length} routes\n`);

  console.log('⚙️  Auditing routes...');
  const routeAudits = routes.map(route => {
    const audit = auditRoute(route, apiEndpoints, components);
    console.log(`   ${audit.status === 'working' ? '✅' : audit.status === 'partial' ? '⚠️' : '❌'} ${audit.path}`);
    return audit;
  });

  const summary = {
    total_routes: routeAudits.length,
    working_routes: routeAudits.filter(r => r.status === 'working').length,
    broken_routes: routeAudits.filter(r => r.status === 'broken').length,
    partial_routes: routeAudits.filter(r => r.status === 'partial').length,
    missing_api_endpoints: routeAudits.reduce((sum, r) => sum + r.missing_apis.length, 0),
    broken_buttons: routeAudits.reduce((sum, r) => sum + r.broken_handlers.length, 0),
    security_issues: routeAudits.reduce((sum, r) => sum + r.security_issues.length, 0),
  };

  const critical_issues = routeAudits
    .filter(r => r.security_issues.length > 0 || r.status === 'broken')
    .map(r => `${r.path}: ${[...r.security_issues, ...r.issues].join(', ')}`);

  const recommendations: string[] = [];

  if (summary.security_issues > 0) {
    recommendations.push('⚠️ CRITICAL: Add authentication checks to all routes without them');
  }

  if (summary.missing_api_endpoints > 0) {
    recommendations.push('Create missing API endpoints or remove references to them');
  }

  if (summary.broken_routes > 0) {
    recommendations.push('Fix broken component imports and links');
  }

  recommendations.push('Run TypeScript compiler (npx tsc --noEmit) to catch type errors');
  recommendations.push('Test all forms and buttons to ensure handlers work correctly');
  recommendations.push('Review compensation calculator for calculation accuracy');

  return {
    summary,
    routes: routeAudits,
    critical_issues,
    recommendations,
  };
}

// Run audit
const report = generateReport();

// Write report to file
const reportPath = path.join(process.cwd(), 'DASHBOARD-AUDIT-REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log('\n' + '='.repeat(60));
console.log('📊 AUDIT SUMMARY');
console.log('='.repeat(60));
console.log(`Total Routes:           ${report.summary.total_routes}`);
console.log(`✅ Working:             ${report.summary.working_routes}`);
console.log(`⚠️  Partial:            ${report.summary.partial_routes}`);
console.log(`❌ Broken:              ${report.summary.broken_routes}`);
console.log(`🔌 Missing APIs:        ${report.summary.missing_api_endpoints}`);
console.log(`🖱️  Broken Handlers:    ${report.summary.broken_buttons}`);
console.log(`🔒 Security Issues:     ${report.summary.security_issues}`);
console.log('='.repeat(60));

if (report.critical_issues.length > 0) {
  console.log('\n🚨 CRITICAL ISSUES:');
  report.critical_issues.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });
}

console.log('\n💡 RECOMMENDATIONS:');
report.recommendations.forEach((rec, i) => {
  console.log(`   ${i + 1}. ${rec}`);
});

console.log(`\n📄 Full report saved to: ${reportPath}\n`);
