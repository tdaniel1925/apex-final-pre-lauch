#!/bin/bash

# =============================================
# RUN ALL COMMISSION ENGINE TESTS
# Convenience script to run complete test cycle
# =============================================

set -e  # Exit on error

echo "════════════════════════════════════════════════"
echo "APEX COMMISSION ENGINE - COMPLETE TEST SUITE"
echo "════════════════════════════════════════════════"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable not set"
  echo ""
  echo "Set it like this:"
  echo "  export DATABASE_URL='postgresql://user:pass@host:5432/dbname'"
  echo "  or use Supabase connection string"
  exit 1
fi

echo "✓ DATABASE_URL found"
echo ""

# Step 1: Setup
echo "STEP 1/6: Setting up test environment..."
psql "$DATABASE_URL" -f 00-setup-test-environment.sql > /dev/null 2>&1
echo "✅ Test environment setup complete"
echo ""

# Step 2: Seed distributors
echo "STEP 2/6: Seeding test distributors (150+ distributors)..."
psql "$DATABASE_URL" -f 01-seed-test-distributors.sql > /dev/null 2>&1
echo "✅ Test distributors created"
echo ""

# Step 3: Seed orders
echo "STEP 3/6: Seeding test customers and orders..."
psql "$DATABASE_URL" -f 02-seed-test-orders.sql > /dev/null 2>&1
echo "✅ Test orders and BV created"
echo ""

# Step 4: Run commissions
echo "STEP 4/6: Running commission calculations (all 16 types)..."
psql "$DATABASE_URL" -f 03-run-commission-tests.sql -q
echo "✅ Commission calculation complete"
echo ""

# Step 5: Verify results
echo "STEP 5/6: Verifying results..."
psql "$DATABASE_URL" -f 04-verify-results.sql -q
echo "✅ Verification complete"
echo ""

# Step 6: Ask about cleanup
echo "STEP 6/6: Cleanup"
read -p "Do you want to cleanup test data now? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
  psql "$DATABASE_URL" -f 99-cleanup-test-data.sql > /dev/null 2>&1
  echo "✅ Test data cleaned up"
else
  echo "⏭️  Cleanup skipped. Run 99-cleanup-test-data.sql manually when ready."
fi

echo ""
echo "════════════════════════════════════════════════"
echo "✅ COMPLETE TEST SUITE FINISHED"
echo "════════════════════════════════════════════════"
echo ""
echo "Review the output above for any failures or warnings."
echo ""
