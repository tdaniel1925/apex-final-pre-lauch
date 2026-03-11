#!/bin/bash

# =====================================================
# Test Script: Stripe Webhook Handlers
# Phase 2.1 & 2.3 Testing
# =====================================================

set -e

echo "===================================================="
echo "Stripe Webhook Testing Suite"
echo "===================================================="
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not installed"
    echo "   Install: brew install stripe/stripe-cli/stripe"
    exit 1
fi

if ! command -v curl &> /dev/null; then
    echo "❌ curl not installed"
    exit 1
fi

if [ ! -f .env.local ]; then
    echo "❌ .env.local not found"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# =====================================================
# TEST 1: Subscription Renewal (invoice.paid)
# =====================================================

echo "===================================================="
echo "TEST 1: Subscription Renewal → Order Creation"
echo "===================================================="
echo ""

echo "📋 Test Scenario:"
echo "  - Trigger invoice.paid event"
echo "  - Verify new order created"
echo "  - Verify BV credited"
echo "  - Verify notification sent"
echo ""

read -p "Press Enter to trigger invoice.paid event..."

echo "🔥 Triggering invoice.paid..."
stripe trigger invoice.payment_succeeded

echo ""
echo "⏳ Waiting 3 seconds for webhook processing..."
sleep 3

echo ""
echo "✅ TEST 1 Complete"
echo ""
echo "📊 Verify in database:"
echo "  SELECT * FROM orders WHERE stripe_invoice_id = '[invoice-id]';"
echo "  SELECT * FROM org_bv_cache WHERE rep_id = '[rep-id]';"
echo "  SELECT * FROM notifications WHERE type = 'subscription_renewed';"
echo ""

read -p "Did the renewal create a new order? (y/n): " renewal_result

if [ "$renewal_result" = "y" ]; then
    echo "✅ PASS: Renewal order created"
else
    echo "❌ FAIL: Renewal order NOT created"
fi

echo ""

# =====================================================
# TEST 2: Charge Refunded (charge.refunded)
# =====================================================

echo "===================================================="
echo "TEST 2: Refund Handler → BV Deduction"
echo "===================================================="
echo ""

echo "📋 Test Scenario:"
echo "  - Trigger charge.refunded event"
echo "  - Verify order status = 'refunded'"
echo "  - Verify BV deducted"
echo "  - Verify notification sent"
echo ""

read -p "Press Enter to trigger charge.refunded event..."

echo "🔥 Triggering charge.refunded..."
stripe trigger charge.refunded

echo ""
echo "⏳ Waiting 3 seconds for webhook processing..."
sleep 3

echo ""
echo "✅ TEST 2 Complete"
echo ""
echo "📊 Verify in database:"
echo "  SELECT * FROM orders WHERE stripe_payment_intent_id = '[pi-id]';"
echo "  SELECT * FROM org_bv_cache WHERE rep_id = '[rep-id]';"
echo "  SELECT * FROM audit_log WHERE action = 'order_refunded_needs_clawback';"
echo "  SELECT * FROM notifications WHERE type = 'order_refunded';"
echo ""

read -p "Did the refund deduct BV? (y/n): " refund_result

if [ "$refund_result" = "y" ]; then
    echo "✅ PASS: Refund processed correctly"
else
    echo "❌ FAIL: Refund NOT processed"
fi

echo ""

# =====================================================
# TEST SUMMARY
# =====================================================

echo "===================================================="
echo "TEST SUMMARY"
echo "===================================================="
echo ""

if [ "$renewal_result" = "y" ] && [ "$refund_result" = "y" ]; then
    echo "✅ ALL TESTS PASSED"
    echo ""
    echo "Revenue Protected:"
    echo "  - Renewals: $240k-$1.2M annually"
    echo "  - Refunds: $24k-$120k annually"
    echo ""
    exit 0
else
    echo "❌ SOME TESTS FAILED"
    echo ""
    echo "Failed tests:"
    [ "$renewal_result" != "y" ] && echo "  - Subscription Renewal"
    [ "$refund_result" != "y" ] && echo "  - Refund Handler"
    echo ""
    echo "Review webhook logs:"
    echo "  supabase functions logs stripe-webhook"
    echo ""
    exit 1
fi
