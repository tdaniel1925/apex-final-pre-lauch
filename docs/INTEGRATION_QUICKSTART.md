# Apex Platform Integration - Quick Start Guide

Get your platform integrated with Apex in under 30 minutes.

---

## Prerequisites

Before you begin, ensure you have:

- [ ] A registered platform account with Apex
- [ ] API credentials (API key and webhook secret)
- [ ] A development server capable of receiving HTTPS requests
- [ ] Basic knowledge of REST APIs and webhooks

---

## Integration Checklist

### Phase 1: Setup (5 minutes)
- [ ] Register your platform in Apex Admin Dashboard
- [ ] Receive API credentials via email
- [ ] Store credentials securely in environment variables
- [ ] Review API documentation

### Phase 2: User Creation (10 minutes)
- [ ] Implement user creation endpoint
- [ ] Test with Apex sandbox environment
- [ ] Verify idempotency handling
- [ ] Handle error responses

### Phase 3: Webhooks (10 minutes)
- [ ] Implement webhook signature verification
- [ ] Create webhook sender for sales events
- [ ] Test webhook delivery to Apex
- [ ] Implement retry logic

### Phase 4: Testing (5 minutes)
- [ ] End-to-end test: Create user → Make sale → Verify webhook
- [ ] Test error scenarios
- [ ] Verify rate limiting
- [ ] Load test (optional)

### Phase 5: Production (5 minutes)
- [ ] Switch to production credentials
- [ ] Configure product mappings in Apex Admin
- [ ] Enable integration in production
- [ ] Monitor first transactions

**Total Time: ~30 minutes**

---

## Step 1: Register Your Platform

### 1.1 Contact Apex Integration Team

Email: **integrations@theapexway.net**

**Subject**: New Platform Integration Request

**Email Template**:
```
Hello Apex Team,

We would like to integrate [Your Platform Name] with Apex.

Platform Details:
- Platform Name: [e.g., jordyn.app]
- Platform URL: https://yourplatform.com
- Technical Contact: [name@email.com]
- Expected User Volume: [e.g., 1000 users/month]
- Expected Transaction Volume: [e.g., 500 sales/month]

Integration Use Cases:
1. Automatically provision user accounts when Apex distributors join
2. Send sales webhooks to Apex for commission tracking
3. [Any other use cases]

Technical Requirements:
- Sandbox environment available: [Yes/No]
- Webhook endpoint ready: [Yes/No]
- Estimated go-live date: [Date]

Thank you,
[Your Name]
```

### 1.2 Receive API Credentials

You'll receive an email containing:

```
Platform Name: yourplatform
Platform ID: plt_abc123xyz789

Sandbox Credentials:
  API Key: sk_test_xxxxxxxxxxxxxxxx
  Webhook Secret: whsec_test_xxxxxxxxxxxxxxxx
  Base URL: https://sandbox.theapexway.net/api

Production Credentials:
  API Key: sk_live_xxxxxxxxxxxxxxxx
  Webhook Secret: whsec_live_xxxxxxxxxxxxxxxx
  Base URL: https://theapexway.net/api

Documentation: https://developers.theapexway.net
Support: integrations@theapexway.net
```

### 1.3 Store Credentials Securely

**Environment Variables (.env)**:
```bash
# Apex Integration
APEX_ENVIRONMENT=sandbox  # or 'production'
APEX_API_KEY=sk_test_xxxxxxxxxxxxxxxx
APEX_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxxxxx
APEX_BASE_URL=https://sandbox.theapexway.net/api

# Your Platform's API Key (for Apex to call you)
YOUR_PLATFORM_API_KEY=your_secure_api_key_here
```

**IMPORTANT**: Never commit `.env` to version control. Add to `.gitignore`:

```bash
echo ".env" >> .gitignore
```

---

## Step 2: Implement User Creation Endpoint

Apex will call this endpoint to create user accounts on your platform.

### 2.1 Create the Endpoint

**Node.js/Express Example**:

```javascript
// routes/apex-integration.js
const express = require('express');
const router = express.Router();

// Middleware to verify API key
function verifyApexApiKey(req, res, next) {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');

  if (apiKey !== process.env.YOUR_PLATFORM_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Invalid API key'
    });
  }

  next();
}

// POST /api/v1/apex/users
router.post('/api/v1/apex/users', verifyApexApiKey, async (req, res) => {
  try {
    const {
      email,
      first_name,
      last_name,
      username,
      apex_distributor_id,
      apex_member_id,
      apex_affiliate_code,
      phone,
      company_name
    } = req.body;

    // 1. Validate required fields
    if (!email || !first_name || !last_name || !apex_distributor_id) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'Missing required fields: email, first_name, last_name, apex_distributor_id'
      });
    }

    // 2. Check if user already exists (idempotency)
    let user = await db.users.findOne({ apex_distributor_id });

    if (user) {
      return res.status(200).json({
        success: true,
        user_id: user.id,
        username: user.username,
        site_url: `https://yourplatform.com/${user.username}`,
        dashboard_url: `https://yourplatform.com/dashboard/${user.username}`,
        message: 'User already exists'
      });
    }

    // 3. Create user account
    user = await db.users.create({
      email,
      first_name,
      last_name,
      username: username || generateUsername(first_name, last_name),
      phone,
      company_name,
      apex_distributor_id,
      apex_member_id,
      apex_affiliate_code,
      created_at: new Date()
    });

    // 4. Send welcome email (optional)
    await sendWelcomeEmail(user);

    // 5. Return success response
    return res.status(201).json({
      success: true,
      user_id: user.id,
      username: user.username,
      site_url: `https://yourplatform.com/${user.username}`,
      dashboard_url: `https://yourplatform.com/dashboard/${user.username}`,
      onboarding_url: `https://yourplatform.com/onboard?token=${user.onboarding_token}`,
      created_at: user.created_at.toISOString(),
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('User creation error:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to create user account',
      request_id: req.id
    });
  }
});

module.exports = router;
```

**Helper Function: Generate Username**:

```javascript
function generateUsername(firstName, lastName) {
  const base = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '');
  const random = Math.random().toString(36).substring(2, 6);
  return `${base}${random}`;
}
```

### 2.2 Test User Creation

**Test with cURL**:

```bash
curl -X POST http://localhost:3000/api/v1/apex/users \
  -H "Authorization: Bearer your_platform_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "username": "testuser",
    "apex_distributor_id": "00000000-0000-0000-0000-000000000001",
    "apex_member_id": "M123456",
    "apex_affiliate_code": "TEST8KEY"
  }'
```

**Expected Response**:

```json
{
  "success": true,
  "user_id": "user_abc123",
  "username": "testuser",
  "site_url": "https://yourplatform.com/testuser",
  "dashboard_url": "https://yourplatform.com/dashboard/testuser",
  "created_at": "2026-03-17T10:30:00Z",
  "message": "User created successfully"
}
```

### 2.3 Test Idempotency

Run the same cURL command again. You should receive a `200 OK` with the existing user data instead of creating a duplicate.

---

## Step 3: Implement Webhook Sender

Your platform sends webhooks to Apex when sales occur.

### 3.1 Create Webhook Sender Module

```javascript
// lib/apex-webhook.js
const crypto = require('crypto');
const axios = require('axios');

class ApexWebhook {
  constructor() {
    this.webhookSecret = process.env.APEX_WEBHOOK_SECRET;
    this.baseUrl = process.env.APEX_BASE_URL;
    this.platformName = 'yourplatform'; // Use your platform identifier
  }

  generateSignature(payload) {
    const payloadString = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payloadString)
      .digest('hex');
  }

  generateEventId() {
    return `evt_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  async sendSaleEvent(saleData) {
    const payload = {
      event: 'sale.created',
      event_id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      platform: {
        name: this.platformName,
        version: '1.0.0'
      },
      seller: {
        user_id: saleData.sellerId,
        apex_distributor_id: saleData.apexDistributorId,
        apex_member_id: saleData.apexMemberId,
        email: saleData.sellerEmail,
        name: `${saleData.sellerFirstName} ${saleData.sellerLastName}`
      },
      order: {
        order_id: saleData.orderId,
        order_number: saleData.orderNumber,
        status: 'completed'
      },
      product: {
        product_id: saleData.productId,
        product_name: saleData.productName,
        product_sku: saleData.productSku,
        product_category: saleData.productCategory
      },
      transaction: {
        amount: parseFloat(saleData.amount),
        currency: saleData.currency || 'USD',
        payment_method: saleData.paymentMethod,
        transaction_id: saleData.transactionId
      },
      customer: {
        customer_id: saleData.customerId,
        email: saleData.customerEmail,
        name: saleData.customerName,
        phone: saleData.customerPhone
      },
      metadata: {
        commission_eligible: true,
        sale_type: saleData.saleType || 'direct',
        channel: saleData.channel || 'web'
      }
    };

    const signature = this.generateSignature(payload);
    const eventTimestamp = Math.floor(Date.now() / 1000);

    try {
      const response = await axios.post(
        `${this.baseUrl}/webhooks/${this.platformName}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Platform-Signature': signature,
            'X-Event-ID': payload.event_id,
            'X-Event-Timestamp': eventTimestamp.toString()
          },
          timeout: 30000
        }
      );

      console.log('Webhook sent successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Webhook error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }
}

module.exports = new ApexWebhook();
```

### 3.2 Send Webhooks on Sale Events

Integrate webhook sender into your order completion flow:

```javascript
// In your order processing code
const apexWebhook = require('./lib/apex-webhook');

async function handleOrderCompletion(order) {
  // ... your existing order processing logic ...

  // Get seller's Apex distributor ID
  const seller = await db.users.findById(order.seller_id);

  if (seller.apex_distributor_id) {
    // Send webhook to Apex
    const result = await apexWebhook.sendSaleEvent({
      sellerId: seller.id,
      apexDistributorId: seller.apex_distributor_id,
      apexMemberId: seller.apex_member_id,
      sellerEmail: seller.email,
      sellerFirstName: seller.first_name,
      sellerLastName: seller.last_name,
      orderId: order.id,
      orderNumber: order.order_number,
      productId: order.product_id,
      productName: order.product_name,
      productSku: order.product_sku,
      productCategory: order.product_category,
      amount: order.amount,
      currency: 'USD',
      paymentMethod: order.payment_method,
      transactionId: order.transaction_id,
      customerId: order.customer_id,
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      saleType: 'direct',
      channel: 'web'
    });

    if (result.success) {
      console.log('Apex notified of sale:', order.id);
      // Optionally store Apex order ID
      await db.orders.update(order.id, {
        apex_order_id: result.data.apex_order_id
      });
    } else {
      console.error('Failed to notify Apex:', result.error);
      // Queue for retry
      await retryQueue.add('apex-webhook', { orderId: order.id });
    }
  }
}
```

### 3.3 Test Webhook Sending

Create a test script to send a webhook:

```javascript
// scripts/test-webhook.js
const apexWebhook = require('../lib/apex-webhook');

async function testWebhook() {
  const result = await apexWebhook.sendSaleEvent({
    sellerId: 'test_user_001',
    apexDistributorId: '00000000-0000-0000-0000-000000000001',
    apexMemberId: 'M123456',
    sellerEmail: 'test@example.com',
    sellerFirstName: 'Test',
    sellerLastName: 'User',
    orderId: 'ord_test_001',
    orderNumber: 'ORD-2026-TEST-001',
    productId: 'prod_001',
    productName: 'Test Product',
    productSku: 'TEST-001',
    productCategory: 'digital',
    amount: 99.00,
    currency: 'USD',
    paymentMethod: 'credit_card',
    transactionId: 'txn_test_001',
    customerId: 'cust_001',
    customerEmail: 'customer@example.com',
    customerName: 'Jane Smith',
    customerPhone: '+15559876543'
  });

  console.log('Result:', result);
}

testWebhook();
```

Run the test:

```bash
node scripts/test-webhook.js
```

---

## Step 4: Configure Product Mappings

Map your platform's products to Apex's commission structure.

### 4.1 Login to Apex Admin Dashboard

Navigate to: **https://theapexway.net/admin/integrations**

### 4.2 Select Your Platform

1. Click on your platform name (e.g., "jordyn")
2. Click **"Product Mappings"** tab

### 4.3 Add Product Mappings

For each product on your platform that should earn commissions:

| Your Product ID | Your Product Name | Commission Type | Commission Amount | BV Amount |
|-----------------|-------------------|-----------------|-------------------|-----------|
| `prod_001` | Business Starter Pack | Fixed | $50.00 | 100 |
| `prod_002` | Premium Training Course | Percentage | 20% | 200 |
| `prod_003` | Monthly Subscription | Recurring | $15.00/mo | 50 |

**Example Configuration**:

```json
{
  "prod_001": {
    "name": "Business Starter Pack",
    "commission_type": "fixed",
    "commission_amount": 50.00,
    "bv_amount": 100,
    "commission_eligible": true
  },
  "prod_002": {
    "name": "Premium Training Course",
    "commission_type": "percentage",
    "commission_percentage": 0.20,
    "bv_amount": 200,
    "commission_eligible": true
  },
  "prod_003": {
    "name": "Monthly Subscription",
    "commission_type": "recurring",
    "commission_amount": 15.00,
    "bv_amount": 50,
    "commission_eligible": true,
    "recurring_interval": "monthly"
  }
}
```

### 4.4 Save Configuration

Click **"Save Product Mappings"** to apply changes.

---

## Step 5: End-to-End Testing

Test the complete integration flow.

### Test Scenario

1. **Apex creates a user on your platform**
2. **User makes a sale**
3. **Your platform notifies Apex via webhook**
4. **Apex processes commission**

### 5.1 Create Test User

Ask Apex support to trigger a test user creation:

```
Email: integrations@theapexway.net
Subject: Test User Creation for [Your Platform]

Please create a test user on our platform:
Apex Distributor ID: 00000000-0000-0000-0000-000000000001
Email: integration-test@yourplatform.com
```

### 5.2 Verify User Created

Check your database:

```sql
SELECT * FROM users WHERE apex_distributor_id = '00000000-0000-0000-0000-000000000001';
```

Expected result: User record exists

### 5.3 Simulate a Sale

Create a test order for this user:

```javascript
// scripts/create-test-order.js
const db = require('../db');
const apexWebhook = require('../lib/apex-webhook');

async function createTestOrder() {
  const user = await db.users.findOne({
    apex_distributor_id: '00000000-0000-0000-0000-000000000001'
  });

  const order = await db.orders.create({
    seller_id: user.id,
    product_id: 'prod_001',
    product_name: 'Business Starter Pack',
    amount: 99.00,
    status: 'completed'
  });

  await apexWebhook.sendSaleEvent({
    sellerId: user.id,
    apexDistributorId: user.apex_distributor_id,
    apexMemberId: user.apex_member_id,
    sellerEmail: user.email,
    sellerFirstName: user.first_name,
    sellerLastName: user.last_name,
    orderId: order.id,
    orderNumber: order.order_number,
    productId: 'prod_001',
    productName: 'Business Starter Pack',
    amount: 99.00,
    currency: 'USD',
    paymentMethod: 'test',
    transactionId: 'txn_test_' + Date.now(),
    customerId: 'cust_test',
    customerEmail: 'testcustomer@example.com',
    customerName: 'Test Customer'
  });

  console.log('Test order created and webhook sent:', order.id);
}

createTestOrder();
```

### 5.4 Verify in Apex Admin

1. Login to Apex Admin Dashboard
2. Navigate to **Integrations → [Your Platform] → Recent Webhooks**
3. Verify webhook was received and processed successfully
4. Check **Commissions → Pending** to see if commission was calculated

---

## Step 6: Switch to Production

Once testing is complete, switch to production environment.

### 6.1 Update Environment Variables

```bash
# .env.production
APEX_ENVIRONMENT=production
APEX_API_KEY=sk_live_xxxxxxxxxxxxxxxx
APEX_WEBHOOK_SECRET=whsec_live_xxxxxxxxxxxxxxxx
APEX_BASE_URL=https://theapexway.net/api
```

### 6.2 Enable Production Integration

Contact Apex support:

```
Email: integrations@theapexway.net
Subject: Enable Production Integration for [Your Platform]

We have completed testing and are ready to enable production integration.

Testing Summary:
✅ User creation tested successfully
✅ Webhook delivery tested successfully
✅ Error handling verified
✅ Idempotency verified
✅ Product mappings configured

Please enable production integration for: [Your Platform Name]
```

### 6.3 Monitor First Transactions

After production is enabled:

1. Monitor your server logs for any errors
2. Check Apex Admin Dashboard for incoming webhooks
3. Verify commissions are calculated correctly
4. Test with a real distributor (with their permission)

---

## Common Issues & Solutions

### Issue 1: User Creation Returns 401 Unauthorized

**Cause**: Invalid API key

**Solution**:
- Verify API key in request header: `Authorization: Bearer sk_test_...`
- Check API key matches the one provided by Apex
- Ensure no extra whitespace or newlines in API key

### Issue 2: Webhook Signature Verification Fails

**Cause**: Incorrect signature generation

**Solution**:
- Use HMAC SHA-256 algorithm
- Sign the exact JSON payload (no formatting changes)
- Use webhook secret, not API key
- Generate lowercase hex string

**Debug Code**:
```javascript
const payload = { event: 'sale.created', /* ... */ };
const payloadString = JSON.stringify(payload);
console.log('Payload String:', payloadString);
console.log('Secret:', process.env.APEX_WEBHOOK_SECRET.substring(0, 8) + '...');

const signature = crypto
  .createHmac('sha256', process.env.APEX_WEBHOOK_SECRET)
  .update(payloadString)
  .digest('hex');
console.log('Signature:', signature);
```

### Issue 3: Webhooks Not Being Received

**Cause**: Network/firewall issues

**Solution**:
- Verify your webhook endpoint is publicly accessible via HTTPS
- Check firewall rules allow incoming HTTPS traffic
- Test with ngrok for local development
- Verify URL is correct in your webhook sender

### Issue 4: Duplicate Users Being Created

**Cause**: Idempotency not implemented

**Solution**:
- Check for existing user by `apex_distributor_id` before creating
- Return existing user with `200 OK` instead of `409 Conflict`
- Use database unique constraint on `apex_distributor_id`

```javascript
// Add unique constraint
ALTER TABLE users ADD CONSTRAINT users_apex_distributor_id_unique
  UNIQUE (apex_distributor_id);
```

---

## Next Steps

After completing this quick start:

1. **Review Full API Documentation**: [INTEGRATIONS_API.md](./INTEGRATIONS_API.md)
2. **Implement Webhook Retry Logic**: Handle transient failures
3. **Add Monitoring**: Track webhook success/failure rates
4. **Set Up Alerts**: Get notified of integration issues
5. **Implement Additional Event Types**: subscription.created, sale.refunded, etc.
6. **Optimize Performance**: Implement async webhook processing
7. **Document Internal Processes**: For your team's reference

---

## Support Resources

### Documentation
- **Full API Docs**: [INTEGRATIONS_API.md](./INTEGRATIONS_API.md)
- **API Reference**: https://developers.theapexway.net
- **Postman Collection**: [apex-integrations.postman_collection.json](./apex-integrations.postman_collection.json)

### Getting Help
- **Email**: integrations@theapexway.net
- **Phone**: +1 (555) 123-4567
- **Slack**: https://apex-developers.slack.com
- **Status Page**: https://status.theapexway.net

### Office Hours
Monday-Friday, 9 AM - 5 PM EST

---

**Document Version**: 1.0.0
**Last Updated**: March 17, 2026

🎉 **Congratulations!** You've completed the Apex integration quick start.
