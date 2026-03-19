# Apex Platform Integration API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [User Creation API (Required from External Platforms)](#user-creation-api)
4. [Sales Webhook API (Send to Apex)](#sales-webhook-api)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Testing & Sandbox](#testing--sandbox)
8. [Security Best Practices](#security-best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Support](#support)

---

## Overview

The Apex Integration API enables external platforms (like jordyn.app, agentpulse.cloud, and future partners) to seamlessly integrate with Apex's distributor network. This integration consists of two main flows:

### Flow 1: User Creation (Apex → External Platform)
When a new distributor joins Apex, we automatically provision their account on integrated external platforms.

### Flow 2: Sales Notifications (External Platform → Apex)
When a distributor makes a sale on an external platform, that platform sends a webhook to Apex to track commissions and analytics.

```
┌─────────────┐                    ┌──────────────────┐
│    Apex     │──── User Create ───▶│ External Platform│
│             │                    │  (jordyn.app)    │
│             │◀─── Sale Webhook ───│                  │
└─────────────┘                    └──────────────────┘
```

---

## Authentication

All API requests between Apex and external platforms use **API Key authentication** with HMAC signature verification for webhooks.

### API Key Authentication (HTTP Header)

```http
Authorization: Bearer {api_key}
Content-Type: application/json
```

### Obtaining API Keys

1. **External platforms receive their API key** when registered in Apex Admin Dashboard
2. **Apex receives platform API keys** during integration setup
3. Keys should be stored securely and never exposed in client-side code

### Key Rotation

- API keys should be rotated every 90 days
- During rotation, both old and new keys are valid for 7 days
- Contact Apex support to initiate key rotation

---

## User Creation API

**Required Endpoint:** External platforms must provide this API for Apex to create user accounts.

### Endpoint Specification

```http
POST https://platform.example.com/api/v1/apex/users
Authorization: Bearer {platform_api_key}
Content-Type: application/json
```

### Request Body

```json
{
  "email": "john.doe@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "company_name": "John Doe Insurance",
  "phone": "+1-555-123-4567",
  "apex_distributor_id": "550e8400-e29b-41d4-a716-446655440000",
  "apex_member_id": "M123456",
  "apex_affiliate_code": "JD8X9K2L",
  "apex_sponsor": {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "name": "Jane Smith",
    "email": "jane.smith@example.com"
  },
  "metadata": {
    "licensing_status": "licensed",
    "onboarding_complete": true,
    "signup_date": "2026-03-17T10:30:00Z"
  }
}
```

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email address (unique identifier) |
| `first_name` | string | Yes | User's first name |
| `last_name` | string | Yes | User's last name |
| `username` | string | Yes | Suggested username (platform may modify if taken) |
| `company_name` | string | No | Business name (if applicable) |
| `phone` | string | No | Phone number in E.164 format |
| `apex_distributor_id` | string (UUID) | Yes | Apex's internal distributor ID |
| `apex_member_id` | string | Yes | Human-readable member ID (e.g., M123456) |
| `apex_affiliate_code` | string | Yes | 8-character affiliate tracking code |
| `apex_sponsor` | object | No | Information about the user's sponsor in Apex |
| `metadata` | object | No | Additional context about the user |

### Success Response (201 Created)

```json
{
  "success": true,
  "user_id": "ext_user_7a9b3c4d5e6f",
  "username": "johndoe",
  "site_url": "https://platform.example.com/johndoe",
  "dashboard_url": "https://platform.example.com/dashboard/johndoe",
  "api_key": "sk_live_a1b2c3d4e5f6g7h8i9j0",
  "onboarding_url": "https://platform.example.com/onboard?token=abc123xyz",
  "created_at": "2026-03-17T10:30:15Z",
  "message": "User account created successfully"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for successful requests |
| `user_id` | string | Platform's internal user ID |
| `username` | string | Actual username assigned (may differ from requested) |
| `site_url` | string | Public URL for the user's profile/storefront |
| `dashboard_url` | string | URL to the user's admin dashboard |
| `api_key` | string | Optional: User-specific API key for platform access |
| `onboarding_url` | string | Optional: One-time URL for user onboarding |
| `created_at` | string (ISO 8601) | Timestamp of account creation |
| `message` | string | Human-readable success message |

### Error Responses

#### 400 Bad Request - Invalid Input
```json
{
  "success": false,
  "error": "INVALID_REQUEST",
  "message": "Email address is invalid",
  "details": {
    "field": "email",
    "reason": "Must be a valid email address"
  }
}
```

#### 409 Conflict - User Already Exists
```json
{
  "success": false,
  "error": "USER_EXISTS",
  "message": "User with this email already exists",
  "existing_user": {
    "user_id": "ext_user_7a9b3c4d5e6f",
    "email": "john.doe@example.com",
    "apex_distributor_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### 401 Unauthorized - Invalid API Key
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired API key"
}
```

#### 429 Too Many Requests - Rate Limited
```json
{
  "success": false,
  "error": "RATE_LIMITED",
  "message": "Too many requests. Please retry after indicated time.",
  "retry_after": 60
}
```

#### 500 Internal Server Error - Platform Error
```json
{
  "success": false,
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred. Please contact support.",
  "request_id": "req_abc123xyz789"
}
```

### Idempotency

To prevent duplicate user creation, use `apex_distributor_id` as an idempotency key:

- If a request with the same `apex_distributor_id` is received twice, return the existing user (200 OK) instead of creating a duplicate
- Update user information if provided data differs from existing record

### Example Implementation (Node.js/Express)

```javascript
// POST /api/v1/apex/users
app.post('/api/v1/apex/users', async (req, res) => {
  // 1. Verify API key
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  if (!verifyApexApiKey(apiKey)) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Invalid API key'
    });
  }

  // 2. Validate request body
  const { email, first_name, last_name, apex_distributor_id } = req.body;
  if (!email || !first_name || !last_name || !apex_distributor_id) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_REQUEST',
      message: 'Missing required fields'
    });
  }

  // 3. Check for existing user (idempotency)
  const existingUser = await db.users.findOne({
    apex_distributor_id
  });
  if (existingUser) {
    return res.status(200).json({
      success: true,
      user_id: existingUser.id,
      username: existingUser.username,
      site_url: `https://platform.example.com/${existingUser.username}`,
      message: 'User already exists'
    });
  }

  // 4. Create user account
  try {
    const user = await db.users.create({
      email,
      first_name,
      last_name,
      username: req.body.username || generateUsername(first_name, last_name),
      apex_distributor_id,
      apex_member_id: req.body.apex_member_id,
      apex_affiliate_code: req.body.apex_affiliate_code,
      phone: req.body.phone,
      company_name: req.body.company_name
    });

    // 5. Return success response
    return res.status(201).json({
      success: true,
      user_id: user.id,
      username: user.username,
      site_url: `https://platform.example.com/${user.username}`,
      dashboard_url: `https://platform.example.com/dashboard/${user.username}`,
      created_at: user.created_at
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
```

---

## Sales Webhook API

**Apex Endpoint:** External platforms send sale notifications to this endpoint.

### Endpoint

```http
POST https://theapexway.net/api/webhooks/{platform_name}
X-Platform-Signature: {hmac_signature}
X-Event-ID: {unique_event_id}
X-Event-Timestamp: {unix_timestamp}
Content-Type: application/json
```

### URL Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `platform_name` | Platform identifier (lowercase, no spaces) | `jordyn`, `agentpulse` |

### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `X-Platform-Signature` | Yes | HMAC SHA-256 signature of the request body |
| `X-Event-ID` | Yes | Unique identifier for this event (for idempotency) |
| `X-Event-Timestamp` | Yes | Unix timestamp when event occurred |
| `Content-Type` | Yes | Must be `application/json` |

### Request Body

```json
{
  "event": "sale.created",
  "event_id": "evt_7f8g9h0i1j2k3l4m",
  "timestamp": "2026-03-17T14:25:30Z",
  "platform": {
    "name": "jordyn",
    "version": "1.0.0"
  },
  "seller": {
    "user_id": "ext_user_7a9b3c4d5e6f",
    "apex_distributor_id": "550e8400-e29b-41d4-a716-446655440000",
    "apex_member_id": "M123456",
    "email": "john.doe@example.com",
    "name": "John Doe"
  },
  "order": {
    "order_id": "ord_8k9l0m1n2o3p",
    "order_number": "ORD-2026-03-1234",
    "status": "completed"
  },
  "product": {
    "product_id": "prod_5e6f7g8h9i0j",
    "product_name": "Business Starter Pack",
    "product_sku": "BSP-001",
    "product_category": "digital_products"
  },
  "transaction": {
    "amount": 99.00,
    "currency": "USD",
    "payment_method": "credit_card",
    "transaction_id": "txn_1a2b3c4d5e6f"
  },
  "customer": {
    "customer_id": "cust_9j8k7l6m5n4o",
    "email": "customer@example.com",
    "name": "Jane Smith",
    "phone": "+1-555-987-6543"
  },
  "metadata": {
    "commission_eligible": true,
    "sale_type": "direct",
    "channel": "web"
  }
}
```

### Request Body Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event` | string | Yes | Event type (see Event Types below) |
| `event_id` | string | Yes | Unique event identifier (for idempotency) |
| `timestamp` | string (ISO 8601) | Yes | When the event occurred |
| `platform.name` | string | Yes | Platform identifier |
| `platform.version` | string | No | Platform API version |
| `seller.apex_distributor_id` | string (UUID) | Yes | Apex distributor ID |
| `seller.user_id` | string | No | Platform's user ID |
| `seller.email` | string | Yes | Seller's email address |
| `order.order_id` | string | Yes | Platform's order ID |
| `order.order_number` | string | No | Human-readable order number |
| `product.product_id` | string | Yes | Platform's product ID |
| `product.product_name` | string | Yes | Product name |
| `product.product_sku` | string | No | Product SKU |
| `transaction.amount` | number | Yes | Sale amount (decimal) |
| `transaction.currency` | string | Yes | ISO 4217 currency code |
| `transaction.transaction_id` | string | Yes | Payment transaction ID |
| `customer.email` | string | Yes | Customer's email |
| `customer.name` | string | No | Customer's name |
| `metadata` | object | No | Additional context |

### Event Types

| Event | Description | When to Send |
|-------|-------------|--------------|
| `sale.created` | New sale completed | Immediately after payment success |
| `sale.refunded` | Sale was refunded | When refund is processed |
| `sale.cancelled` | Sale was cancelled | When order is cancelled |
| `subscription.created` | New subscription started | After first payment success |
| `subscription.renewed` | Subscription renewal payment | After each renewal payment |
| `subscription.cancelled` | Subscription cancelled | When subscription ends |
| `commission.adjusted` | Manual commission adjustment | When admin adjusts commission |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "event_id": "evt_7f8g9h0i1j2k3l4m",
  "processed_at": "2026-03-17T14:25:35Z",
  "apex_order_id": "ord_apex_5a6b7c8d9e0f"
}
```

### Error Responses

#### 400 Bad Request - Invalid Payload
```json
{
  "success": false,
  "error": "INVALID_PAYLOAD",
  "message": "Missing required field: seller.apex_distributor_id"
}
```

#### 401 Unauthorized - Invalid Signature
```json
{
  "success": false,
  "error": "INVALID_SIGNATURE",
  "message": "HMAC signature verification failed"
}
```

#### 409 Conflict - Duplicate Event
```json
{
  "success": false,
  "error": "DUPLICATE_EVENT",
  "message": "Event with this event_id has already been processed",
  "original_processed_at": "2026-03-17T14:25:35Z"
}
```

#### 422 Unprocessable Entity - Invalid Distributor
```json
{
  "success": false,
  "error": "INVALID_DISTRIBUTOR",
  "message": "Distributor not found or inactive",
  "distributor_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### HMAC Signature Generation

To generate the `X-Platform-Signature` header:

#### Node.js Example
```javascript
const crypto = require('crypto');

function generateSignature(payload, webhookSecret) {
  const payloadString = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payloadString)
    .digest('hex');
  return signature;
}

// Usage
const payload = { event: 'sale.created', /* ... */ };
const signature = generateSignature(payload, 'your_webhook_secret');

// Send request
await fetch('https://theapexway.net/api/webhooks/jordyn', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Platform-Signature': signature,
    'X-Event-ID': 'evt_unique_123',
    'X-Event-Timestamp': Math.floor(Date.now() / 1000).toString()
  },
  body: JSON.stringify(payload)
});
```

#### Python Example
```python
import hmac
import hashlib
import json
import time
import requests

def generate_signature(payload, webhook_secret):
    payload_string = json.dumps(payload, separators=(',', ':'))
    signature = hmac.new(
        webhook_secret.encode('utf-8'),
        payload_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return signature

# Usage
payload = {'event': 'sale.created', # ...
}
signature = generate_signature(payload, 'your_webhook_secret')

response = requests.post(
    'https://theapexway.net/api/webhooks/jordyn',
    headers={
        'Content-Type': 'application/json',
        'X-Platform-Signature': signature,
        'X-Event-ID': 'evt_unique_123',
        'X-Event-Timestamp': str(int(time.time()))
    },
    json=payload
)
```

#### PHP Example
```php
<?php
function generateSignature($payload, $webhookSecret) {
    $payloadString = json_encode($payload, JSON_UNESCAPED_SLASHES);
    $signature = hash_hmac('sha256', $payloadString, $webhookSecret);
    return $signature;
}

// Usage
$payload = ['event' => 'sale.created', /* ... */];
$signature = generateSignature($payload, 'your_webhook_secret');

$ch = curl_init('https://theapexway.net/api/webhooks/jordyn');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-Platform-Signature: ' . $signature,
    'X-Event-ID: evt_unique_123',
    'X-Event-Timestamp: ' . time()
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
?>
```

### Signature Verification (Apex Side)

```javascript
// Apex's webhook handler
function verifySignature(payload, signature, secret) {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}
```

### Webhook Retry Logic

If Apex's webhook endpoint is unavailable:

1. **Immediate Retry**: Retry after 1 minute
2. **Exponential Backoff**: 1m, 5m, 15m, 1h, 6h, 24h
3. **Maximum Retries**: 7 attempts over 31 hours
4. **Timeout**: Each request times out after 30 seconds
5. **Dead Letter Queue**: After max retries, event goes to dead letter queue for manual review

**Retry Response Headers:**
```http
X-Retry-Attempt: 3
X-Retry-Max: 7
X-Next-Retry: 2026-03-17T15:25:35Z
```

---

## Error Handling

### Standard Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error description",
  "details": {
    "field": "field_name",
    "reason": "Specific reason for the error"
  },
  "request_id": "req_abc123xyz789",
  "timestamp": "2026-03-17T14:25:35Z"
}
```

### Error Codes Reference

| Error Code | HTTP Status | Description | Resolution |
|------------|-------------|-------------|------------|
| `INVALID_REQUEST` | 400 | Request body validation failed | Check request format and required fields |
| `UNAUTHORIZED` | 401 | Invalid or missing API key | Verify API key is correct and not expired |
| `FORBIDDEN` | 403 | API key lacks required permissions | Contact support to upgrade permissions |
| `NOT_FOUND` | 404 | Resource does not exist | Verify resource ID is correct |
| `CONFLICT` | 409 | Resource already exists | Use existing resource or different identifier |
| `DUPLICATE_EVENT` | 409 | Webhook event already processed | This is expected for retries, ignore |
| `INVALID_SIGNATURE` | 401 | HMAC signature verification failed | Check webhook secret and signature generation |
| `RATE_LIMITED` | 429 | Too many requests | Wait and retry after `retry_after` seconds |
| `INTERNAL_ERROR` | 500 | Unexpected server error | Contact support with `request_id` |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable | Retry with exponential backoff |

### Handling Transient Errors

For errors with HTTP status 429, 500, 502, 503, 504:

1. Implement exponential backoff retry logic
2. Start with 1 second delay
3. Double the delay on each retry (1s, 2s, 4s, 8s, 16s, 32s)
4. Maximum retry delay: 60 seconds
5. Maximum total retries: 5 attempts

```javascript
async function retryWithBackoff(fn, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isRetryable = [429, 500, 502, 503, 504].includes(error.status);
      const isLastAttempt = i === maxRetries - 1;

      if (!isRetryable || isLastAttempt) {
        throw error;
      }

      const delay = Math.min(1000 * Math.pow(2, i), 60000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

## Rate Limiting

### User Creation API Limits

- **Rate Limit**: 100 requests per minute per API key
- **Burst Limit**: 10 requests per second
- **Daily Limit**: 10,000 requests per day

### Webhook API Limits

- **Rate Limit**: 500 requests per minute per platform
- **Burst Limit**: 50 requests per second
- **Daily Limit**: 50,000 requests per day

### Rate Limit Headers

Every API response includes rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1710682535
```

### Handling Rate Limits

When you receive a `429 Too Many Requests` response:

```json
{
  "success": false,
  "error": "RATE_LIMITED",
  "message": "Rate limit exceeded",
  "retry_after": 60,
  "limit": 100,
  "window": 60
}
```

**Best Practices:**
1. Respect the `Retry-After` header
2. Implement request queuing
3. Use batch operations when available
4. Cache responses when possible

---

## Testing & Sandbox

### Sandbox Environment

Use the sandbox environment for testing before production:

```
Sandbox Base URL: https://sandbox.theapexway.net/api
Production Base URL: https://theapexway.net/api
```

### Test Credentials

Sandbox API keys for testing:

```
Platform API Key: sk_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Webhook Secret: whsec_test_q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Test Distributor IDs

Use these test distributor IDs in sandbox:

```
Test Distributor 1: 00000000-0000-0000-0000-000000000001
Test Distributor 2: 00000000-0000-0000-0000-000000000002
Test Distributor 3: 00000000-0000-0000-0000-000000000003
```

### Testing Webhooks Locally

Use ngrok or similar tools to test webhooks locally:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use ngrok URL for webhook testing
# Example: https://abc123.ngrok.io/api/webhooks/jordyn
```

### Test Webhook Events

Send test events using curl:

```bash
curl -X POST https://theapexway.net/api/webhooks/jordyn \
  -H "Content-Type: application/json" \
  -H "X-Platform-Signature: abc123..." \
  -H "X-Event-ID: test_evt_001" \
  -H "X-Event-Timestamp: 1710682535" \
  -d '{
    "event": "sale.created",
    "seller": {
      "apex_distributor_id": "00000000-0000-0000-0000-000000000001",
      "email": "test@example.com"
    },
    "transaction": {
      "amount": 99.00,
      "currency": "USD"
    }
  }'
```

---

## Security Best Practices

### 1. API Key Security

- **Never expose API keys** in client-side code or public repositories
- Store keys in environment variables
- Use different keys for sandbox and production
- Rotate keys every 90 days
- Immediately revoke compromised keys

### 2. HTTPS Only

- **All API requests must use HTTPS**
- HTTP requests will be rejected with `403 Forbidden`
- Use TLS 1.2 or higher

### 3. Signature Verification

- **Always verify HMAC signatures** on incoming webhooks
- Use constant-time comparison to prevent timing attacks
- Reject requests with invalid signatures

```javascript
// ❌ BAD - Vulnerable to timing attacks
if (signature === computedSignature) { /* ... */ }

// ✅ GOOD - Constant-time comparison
if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature))) {
  /* ... */
}
```

### 4. Idempotency

- Use `apex_distributor_id` as idempotency key for user creation
- Use `event_id` as idempotency key for webhooks
- Store processed event IDs for at least 30 days

### 5. Request Validation

- Validate all input data
- Sanitize user-provided strings
- Check data types and formats
- Reject requests with unexpected fields

### 6. Error Messages

- **Don't expose sensitive information** in error messages
- Don't reveal whether a user exists
- Don't include stack traces in production

### 7. IP Allowlisting (Optional)

Apex webhook requests originate from these IPs:

```
Production: 52.203.45.67, 52.203.45.68, 52.203.45.69
Sandbox: 54.187.123.45
```

Consider allowlisting these IPs at your firewall level.

### 8. Timestamp Validation

Reject webhook requests with timestamps older than 5 minutes:

```javascript
const eventTimestamp = parseInt(req.headers['x-event-timestamp']);
const now = Math.floor(Date.now() / 1000);
const maxAge = 300; // 5 minutes

if (Math.abs(now - eventTimestamp) > maxAge) {
  return res.status(400).json({
    success: false,
    error: 'INVALID_TIMESTAMP',
    message: 'Request timestamp is too old or too far in the future'
  });
}
```

---

## Troubleshooting

### Common Issues

#### 1. User Creation Returns 409 Conflict

**Problem**: Attempting to create a user that already exists

**Solution**:
- Check if `apex_distributor_id` already exists in your system
- Return the existing user instead of creating a duplicate
- Implement proper idempotency handling

#### 2. Webhook Signature Verification Fails

**Problem**: `INVALID_SIGNATURE` error on webhook delivery

**Checklist**:
- [ ] Using correct webhook secret
- [ ] JSON payload is exactly as received (no formatting changes)
- [ ] Using HMAC SHA-256 algorithm
- [ ] Signature is lowercase hex string
- [ ] No extra whitespace in payload

**Debug Code**:
```javascript
console.log('Received signature:', req.headers['x-platform-signature']);
console.log('Computed signature:', computedSignature);
console.log('Payload:', JSON.stringify(req.body));
console.log('Secret:', webhookSecret.substring(0, 8) + '...');
```

#### 3. Rate Limiting Issues

**Problem**: Receiving 429 errors frequently

**Solutions**:
- Implement request queuing
- Add delays between requests
- Use batch operations
- Request rate limit increase from Apex support

#### 4. Webhook Timeouts

**Problem**: Webhooks timing out before processing completes

**Solutions**:
- Return 200 OK immediately, process asynchronously
- Use background jobs for heavy processing
- Optimize database queries
- Increase server resources

**Pattern**:
```javascript
app.post('/api/webhooks/apex', async (req, res) => {
  // 1. Verify signature
  if (!verifySignature(req.body, req.headers['x-platform-signature'])) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Return success immediately
  res.status(200).json({ success: true });

  // 3. Process webhook asynchronously
  backgroundQueue.add('process-apex-webhook', req.body);
});
```

#### 5. Missing Distributor ID

**Problem**: Webhook rejected with `INVALID_DISTRIBUTOR`

**Solutions**:
- Verify `apex_distributor_id` is correct UUID format
- Check distributor exists in Apex system
- Ensure distributor is active (not suspended/deleted)
- Contact Apex support if issue persists

---

## Support

### Getting Help

**Email**: integrations@theapexway.net
**Phone**: +1 (555) 123-4567
**Hours**: Monday-Friday, 9 AM - 5 PM EST

### Support Request Format

When contacting support, include:

1. **Platform Name**: Which platform you're integrating
2. **Environment**: Sandbox or Production
3. **Issue Description**: What you're trying to do and what's failing
4. **Request ID**: From error response (if applicable)
5. **Sample Request/Response**: Sanitized examples
6. **Timestamp**: When the issue occurred

**Example**:
```
Platform: jordyn.app
Environment: Production
Issue: User creation failing with 409 Conflict
Request ID: req_7a8b9c0d1e2f
Timestamp: 2026-03-17 14:30:00 UTC

Request:
POST /api/v1/apex/users
{
  "apex_distributor_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  ...
}

Response:
{
  "success": false,
  "error": "USER_EXISTS",
  ...
}
```

### API Status Page

Monitor API uptime and incidents:

🔗 https://status.theapexway.net

### Developer Community

Join our developer Slack channel for community support:

🔗 https://apex-developers.slack.com

### Changelog & Updates

Subscribe to API updates:

🔗 https://developers.theapexway.net/changelog

---

## Appendix

### Complete User Creation Example (Full Flow)

```javascript
const axios = require('axios');

async function createApexUser(distributorData) {
  try {
    const response = await axios.post(
      'https://platform.example.com/api/v1/apex/users',
      {
        email: distributorData.email,
        first_name: distributorData.firstName,
        last_name: distributorData.lastName,
        username: distributorData.username,
        apex_distributor_id: distributorData.id,
        apex_member_id: distributorData.memberNumber,
        apex_affiliate_code: distributorData.affiliateCode,
        phone: distributorData.phone,
        company_name: distributorData.companyName,
        metadata: {
          licensing_status: distributorData.licensingStatus,
          onboarding_complete: distributorData.onboardingComplete
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PLATFORM_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('User created successfully:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Handle specific error codes
      switch (error.response.data.error) {
        case 'USER_EXISTS':
          console.log('User already exists, using existing account');
          return error.response.data.existing_user;
        case 'RATE_LIMITED':
          console.log('Rate limited, retrying after delay...');
          await sleep(error.response.data.retry_after * 1000);
          return createApexUser(distributorData); // Retry
        default:
          console.error('User creation failed:', error.response.data);
          throw error;
      }
    } else {
      console.error('Network error:', error.message);
      throw error;
    }
  }
}
```

### Complete Webhook Sender Example (Full Flow)

```javascript
const crypto = require('crypto');
const axios = require('axios');

class ApexWebhookSender {
  constructor(webhookSecret, platformName) {
    this.webhookSecret = webhookSecret;
    this.platformName = platformName;
    this.baseUrl = 'https://theapexway.net/api/webhooks';
  }

  generateSignature(payload) {
    return crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  async sendWebhook(eventData, maxRetries = 3) {
    const payload = {
      event: eventData.event,
      event_id: eventData.eventId,
      timestamp: new Date().toISOString(),
      platform: {
        name: this.platformName,
        version: '1.0.0'
      },
      seller: eventData.seller,
      order: eventData.order,
      product: eventData.product,
      transaction: eventData.transaction,
      customer: eventData.customer,
      metadata: eventData.metadata
    };

    const signature = this.generateSignature(payload);
    const eventTimestamp = Math.floor(Date.now() / 1000);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(
          `${this.baseUrl}/${this.platformName}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Platform-Signature': signature,
              'X-Event-ID': payload.event_id,
              'X-Event-Timestamp': eventTimestamp.toString()
            },
            timeout: 30000 // 30 second timeout
          }
        );

        console.log('Webhook sent successfully:', response.data);
        return response.data;
      } catch (error) {
        if (error.response) {
          const { status, data } = error.response;

          // Don't retry these errors
          if ([400, 401, 409, 422].includes(status)) {
            console.error('Webhook failed (non-retryable):', data);
            throw error;
          }

          // Retry transient errors
          if ([429, 500, 502, 503, 504].includes(status) && attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 60000);
            console.log(`Retrying after ${delay}ms (attempt ${attempt}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        // Max retries exceeded
        if (attempt === maxRetries) {
          console.error('Webhook failed after max retries');
          throw error;
        }
      }
    }
  }
}

// Usage
const webhookSender = new ApexWebhookSender(
  process.env.APEX_WEBHOOK_SECRET,
  'jordyn'
);

async function handleNewSale(sale) {
  await webhookSender.sendWebhook({
    event: 'sale.created',
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    seller: {
      apex_distributor_id: sale.sellerApexId,
      user_id: sale.sellerId,
      email: sale.sellerEmail,
      name: sale.sellerName
    },
    order: {
      order_id: sale.orderId,
      order_number: sale.orderNumber,
      status: 'completed'
    },
    product: {
      product_id: sale.productId,
      product_name: sale.productName,
      product_sku: sale.productSku
    },
    transaction: {
      amount: sale.amount,
      currency: 'USD',
      payment_method: sale.paymentMethod,
      transaction_id: sale.transactionId
    },
    customer: {
      customer_id: sale.customerId,
      email: sale.customerEmail,
      name: sale.customerName
    },
    metadata: {
      commission_eligible: true,
      sale_type: 'direct'
    }
  });
}
```

---

**Document Version**: 1.0.0
**Last Updated**: March 17, 2026
**API Version**: v1

For the latest version of this documentation, visit: https://developers.theapexway.net
