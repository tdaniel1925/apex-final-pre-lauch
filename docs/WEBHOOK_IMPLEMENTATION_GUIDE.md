# Apex Webhook Implementation Guide

A comprehensive guide to implementing production-ready webhook integrations with Apex.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Security](#security)
4. [Reliability](#reliability)
5. [Monitoring](#monitoring)
6. [Testing](#testing)
7. [Production Checklist](#production-checklist)

---

## Overview

Webhooks enable real-time communication between Apex and external platforms. This guide covers best practices for building secure, reliable webhook systems.

### Key Principles

1. **Security First**: Always verify signatures
2. **Idempotency**: Handle duplicate events gracefully
3. **Resilience**: Implement retry logic with exponential backoff
4. **Async Processing**: Return 200 OK quickly, process asynchronously
5. **Monitoring**: Track webhook health and failures

---

## Architecture

### Recommended Architecture

```
┌─────────────────┐
│  Apex Platform  │
└────────┬────────┘
         │ Webhook POST
         ▼
┌─────────────────┐
│ Load Balancer   │  ← HTTPS only, rate limiting
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ API Gateway     │  ← Authentication, validation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Webhook Handler │  ← Verify signature, validate payload
└────────┬────────┘
         │ 200 OK (fast response)
         │
         ▼
┌─────────────────┐
│ Message Queue   │  ← Decouple processing
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Worker Process  │  ← Async processing
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │  ← Store results
└─────────────────┘
```

### Why This Architecture?

1. **Fast Response**: API Gateway returns 200 OK immediately
2. **Scalability**: Workers can scale independently
3. **Reliability**: Queue ensures no lost events
4. **Retry Logic**: Failed jobs automatically retry
5. **Monitoring**: Each layer can be monitored separately

---

## Security

### 1. Signature Verification

**CRITICAL**: Always verify the HMAC signature before processing.

#### Verification Steps

```javascript
// 1. Extract signature from header
const receivedSignature = req.headers['x-platform-signature'];

// 2. Get the raw request body (BEFORE parsing JSON)
const rawBody = req.body; // Must be raw string, not parsed object

// 3. Compute expected signature
const expectedSignature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex');

// 4. Compare using constant-time comparison (prevent timing attacks)
const isValid = crypto.timingSafeEqual(
  Buffer.from(receivedSignature),
  Buffer.from(expectedSignature)
);

if (!isValid) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

#### Common Mistakes

❌ **Don't do this**:
```javascript
// BAD: Using parsed JSON
const signature = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(req.body)) // ❌ JSON formatting may differ
  .digest('hex');
```

✅ **Do this**:
```javascript
// GOOD: Using raw body
app.post('/webhook',
  express.raw({ type: 'application/json' }), // Get raw body
  (req, res) => {
    const signature = crypto
      .createHmac('sha256', secret)
      .update(req.body) // ✅ Raw buffer
      .digest('hex');
  }
);
```

### 2. Timestamp Validation

Reject old requests to prevent replay attacks:

```javascript
const eventTimestamp = parseInt(req.headers['x-event-timestamp']);
const now = Math.floor(Date.now() / 1000);
const maxAge = 300; // 5 minutes

if (Math.abs(now - eventTimestamp) > maxAge) {
  return res.status(400).json({
    error: 'Request timestamp is too old or too far in the future'
  });
}
```

### 3. IP Allowlisting (Optional)

For additional security, allow only Apex IPs:

```javascript
const APEX_IPS = [
  '52.203.45.67',
  '52.203.45.68',
  '52.203.45.69'
];

const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

if (!APEX_IPS.includes(clientIP)) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

### 4. Rate Limiting

Protect against abuse:

```javascript
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: 'Too many webhook requests' }
});

app.post('/webhook', webhookLimiter, handleWebhook);
```

---

## Reliability

### 1. Idempotency

Store processed event IDs to prevent duplicate processing:

```javascript
async function handleWebhook(req, res) {
  const eventId = req.headers['x-event-id'];

  // Check if already processed
  const exists = await db.processedEvents.findOne({ event_id: eventId });

  if (exists) {
    return res.status(200).json({
      success: true,
      message: 'Event already processed',
      processed_at: exists.processed_at
    });
  }

  // Process event
  try {
    await processEvent(req.body);

    // Store event ID
    await db.processedEvents.create({
      event_id: eventId,
      processed_at: new Date(),
      event_type: req.body.event
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    // Don't store event ID if processing failed
    throw error;
  }
}
```

**Event ID Storage**:
- Store for at least 30 days
- Use indexed database field for fast lookups
- Clean up old entries periodically

```sql
CREATE TABLE processed_events (
  event_id VARCHAR(255) PRIMARY KEY,
  event_type VARCHAR(50),
  processed_at TIMESTAMP,
  INDEX idx_processed_at (processed_at)
);

-- Cleanup query (run daily)
DELETE FROM processed_events WHERE processed_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### 2. Async Processing Pattern

Return 200 OK quickly, process in background:

```javascript
const Queue = require('bull');
const webhookQueue = new Queue('apex-webhooks', REDIS_URL);

// Webhook handler - returns immediately
app.post('/webhooks/apex', async (req, res) => {
  // 1. Verify signature
  if (!verifySignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Check idempotency
  const eventId = req.headers['x-event-id'];
  if (await isProcessed(eventId)) {
    return res.status(200).json({ success: true });
  }

  // 3. Add to queue
  await webhookQueue.add('process-webhook', {
    event_id: eventId,
    payload: req.body,
    received_at: Date.now()
  });

  // 4. Return success immediately
  return res.status(200).json({
    success: true,
    event_id: eventId,
    queued_at: new Date().toISOString()
  });
});

// Worker process - handles actual processing
webhookQueue.process('process-webhook', async (job) => {
  const { event_id, payload } = job.data;

  try {
    // Process the webhook
    await processWebhookEvent(payload);

    // Mark as processed
    await markAsProcessed(event_id);

    console.log(`Webhook ${event_id} processed successfully`);
  } catch (error) {
    console.error(`Webhook ${event_id} processing failed:`, error);
    throw error; // Bull will retry automatically
  }
});
```

### 3. Retry Logic

Implement exponential backoff for sending webhooks:

```javascript
async function sendWebhookWithRetry(payload, maxRetries = 5) {
  const delays = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.post(WEBHOOK_URL, payload, {
        timeout: 30000,
        headers: {
          'X-Platform-Signature': generateSignature(payload),
          'X-Event-ID': payload.event_id,
          'X-Event-Timestamp': Math.floor(Date.now() / 1000).toString()
        }
      });

      console.log('Webhook sent successfully');
      return { success: true, data: response.data };

    } catch (error) {
      const status = error.response?.status;
      const isRetryable = !status || [429, 500, 502, 503, 504].includes(status);
      const isLastAttempt = attempt === maxRetries - 1;

      if (!isRetryable || isLastAttempt) {
        console.error('Webhook failed (no more retries)');
        return { success: false, error: error.message };
      }

      const delay = delays[attempt];
      console.log(`Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await sleep(delay);
    }
  }
}
```

### 4. Dead Letter Queue

Store failed webhooks for manual review:

```javascript
async function processWebhook(job) {
  try {
    await processWebhookEvent(job.data);
  } catch (error) {
    // After all retries exhausted
    if (job.attemptsMade >= job.opts.attempts) {
      await db.deadLetterQueue.create({
        event_id: job.data.event_id,
        payload: job.data.payload,
        error: error.message,
        failed_at: new Date(),
        attempts: job.attemptsMade
      });

      // Alert team
      await sendAlert('Webhook moved to DLQ', {
        event_id: job.data.event_id,
        error: error.message
      });
    }
    throw error;
  }
}
```

---

## Monitoring

### 1. Metrics to Track

**Webhook Receiver Metrics**:
- Request rate (requests/sec)
- Success rate (%)
- Error rate by status code
- Processing time (p50, p95, p99)
- Queue depth
- Event types distribution

**Webhook Sender Metrics**:
- Delivery success rate (%)
- Retry rate (%)
- Average delivery time
- Failures by error type
- DLQ size

### 2. Implementation with Prometheus

```javascript
const prometheus = require('prom-client');

// Define metrics
const webhookReceived = new prometheus.Counter({
  name: 'apex_webhook_received_total',
  help: 'Total webhooks received from Apex',
  labelNames: ['event_type', 'status']
});

const webhookProcessingTime = new prometheus.Histogram({
  name: 'apex_webhook_processing_seconds',
  help: 'Webhook processing time',
  labelNames: ['event_type'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const webhookQueueDepth = new prometheus.Gauge({
  name: 'apex_webhook_queue_depth',
  help: 'Number of webhooks in processing queue'
});

// Use in handler
app.post('/webhooks/apex', async (req, res) => {
  const startTime = Date.now();
  const eventType = req.body.event;

  try {
    // Process webhook
    await handleWebhook(req, res);

    // Record success
    webhookReceived.labels(eventType, 'success').inc();
  } catch (error) {
    // Record failure
    webhookReceived.labels(eventType, 'error').inc();
    throw error;
  } finally {
    // Record processing time
    const duration = (Date.now() - startTime) / 1000;
    webhookProcessingTime.labels(eventType).observe(duration);
  }
});

// Update queue depth periodically
setInterval(async () => {
  const queueSize = await webhookQueue.count();
  webhookQueueDepth.set(queueSize);
}, 10000);
```

### 3. Alerting Rules

```yaml
# alerts.yml
groups:
  - name: apex_webhooks
    interval: 30s
    rules:
      - alert: HighWebhookErrorRate
        expr: |
          rate(apex_webhook_received_total{status="error"}[5m]) /
          rate(apex_webhook_received_total[5m]) > 0.1
        for: 5m
        annotations:
          summary: "High webhook error rate (>10%)"

      - alert: WebhookQueueBacklog
        expr: apex_webhook_queue_depth > 1000
        for: 10m
        annotations:
          summary: "Webhook queue has >1000 pending items"

      - alert: SlowWebhookProcessing
        expr: |
          histogram_quantile(0.95,
            rate(apex_webhook_processing_seconds_bucket[5m])
          ) > 5
        for: 5m
        annotations:
          summary: "P95 webhook processing time >5s"
```

### 4. Logging Best Practices

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'webhooks.log' })
  ]
});

// Log webhook received
logger.info('Webhook received', {
  event_id: req.headers['x-event-id'],
  event_type: req.body.event,
  seller_id: req.body.seller.apex_distributor_id,
  transaction_amount: req.body.transaction.amount
});

// Log webhook processed
logger.info('Webhook processed', {
  event_id: eventId,
  processing_time_ms: Date.now() - startTime,
  result: 'success'
});

// Log webhook failed
logger.error('Webhook processing failed', {
  event_id: eventId,
  error: error.message,
  stack: error.stack,
  attempt: attemptNumber
});
```

---

## Testing

### 1. Unit Tests

Test signature verification:

```javascript
const { verifySignature } = require('../webhooks/apex');
const crypto = require('crypto');

describe('Webhook Signature Verification', () => {
  const webhookSecret = 'test_secret_key';

  it('should verify valid signature', () => {
    const payload = { event: 'sale.created', amount: 99.00 };
    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadString)
      .digest('hex');

    const isValid = verifySignature(payloadString, signature, webhookSecret);
    expect(isValid).toBe(true);
  });

  it('should reject invalid signature', () => {
    const payload = { event: 'sale.created', amount: 99.00 };
    const payloadString = JSON.stringify(payload);
    const invalidSignature = 'invalid_signature';

    const isValid = verifySignature(payloadString, invalidSignature, webhookSecret);
    expect(isValid).toBe(false);
  });

  it('should reject tampered payload', () => {
    const payload = { event: 'sale.created', amount: 99.00 };
    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadString)
      .digest('hex');

    // Tamper with payload
    const tamperedPayload = JSON.stringify({ ...payload, amount: 199.00 });

    const isValid = verifySignature(tamperedPayload, signature, webhookSecret);
    expect(isValid).toBe(false);
  });
});
```

### 2. Integration Tests

Test webhook handler end-to-end:

```javascript
const request = require('supertest');
const app = require('../app');
const crypto = require('crypto');

describe('POST /webhooks/apex', () => {
  const webhookSecret = process.env.APEX_WEBHOOK_SECRET;

  function signPayload(payload) {
    return crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  it('should accept valid webhook', async () => {
    const payload = {
      event: 'sale.created',
      event_id: 'evt_test_001',
      timestamp: new Date().toISOString(),
      seller: {
        apex_distributor_id: '550e8400-e29b-41d4-a716-446655440000'
      },
      transaction: {
        amount: 99.00,
        currency: 'USD'
      }
    };

    const signature = signPayload(payload);
    const eventTimestamp = Math.floor(Date.now() / 1000);

    const response = await request(app)
      .post('/webhooks/apex')
      .set('Content-Type', 'application/json')
      .set('X-Platform-Signature', signature)
      .set('X-Event-ID', payload.event_id)
      .set('X-Event-Timestamp', eventTimestamp.toString())
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should reject webhook with invalid signature', async () => {
    const payload = { event: 'sale.created' };

    const response = await request(app)
      .post('/webhooks/apex')
      .set('Content-Type', 'application/json')
      .set('X-Platform-Signature', 'invalid_signature')
      .set('X-Event-ID', 'evt_test_002')
      .set('X-Event-Timestamp', Math.floor(Date.now() / 1000).toString())
      .send(payload);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('INVALID_SIGNATURE');
  });

  it('should handle duplicate webhooks idempotently', async () => {
    const payload = {
      event: 'sale.created',
      event_id: 'evt_duplicate_test',
      seller: { apex_distributor_id: '550e8400-e29b-41d4-a716-446655440000' },
      transaction: { amount: 99.00 }
    };

    const signature = signPayload(payload);
    const eventTimestamp = Math.floor(Date.now() / 1000);

    // Send first time
    await request(app)
      .post('/webhooks/apex')
      .set('X-Platform-Signature', signature)
      .set('X-Event-ID', payload.event_id)
      .set('X-Event-Timestamp', eventTimestamp.toString())
      .send(payload);

    // Send second time (duplicate)
    const response = await request(app)
      .post('/webhooks/apex')
      .set('X-Platform-Signature', signature)
      .set('X-Event-ID', payload.event_id)
      .set('X-Event-Timestamp', eventTimestamp.toString())
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('already processed');
  });
});
```

### 3. Load Testing

Test webhook endpoint under load:

```javascript
// k6 load test script
import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 RPS
    { duration: '3m', target: 50 },   // Ramp up to 50 RPS
    { duration: '2m', target: 100 },  // Ramp up to 100 RPS
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    errors: ['rate<0.01'],             // Error rate under 1%
  },
};

export default function() {
  const payload = JSON.stringify({
    event: 'sale.created',
    event_id: `evt_${Date.now()}_${Math.random()}`,
    seller: { apex_distributor_id: '550e8400-e29b-41d4-a716-446655440000' },
    transaction: { amount: 99.00 }
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Platform-Signature': signPayload(payload),
      'X-Event-ID': `evt_${Date.now()}`,
      'X-Event-Timestamp': Math.floor(Date.now() / 1000).toString()
    },
  };

  const response = http.post('http://localhost:3000/webhooks/apex', payload, params);

  check(response, {
    'status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);
}
```

---

## Production Checklist

Before going live, verify:

### Security
- [ ] HMAC signature verification implemented
- [ ] Timestamp validation implemented
- [ ] Using constant-time comparison for signatures
- [ ] HTTPS only (no HTTP endpoints)
- [ ] API keys stored in environment variables
- [ ] Rate limiting configured
- [ ] IP allowlisting configured (optional)

### Reliability
- [ ] Idempotency implemented (event ID storage)
- [ ] Async processing with message queue
- [ ] Retry logic with exponential backoff
- [ ] Dead letter queue for failed events
- [ ] Database indexes on event_id and timestamp fields
- [ ] Automated cleanup of old processed events

### Monitoring
- [ ] Metrics collection (Prometheus/DataDog/CloudWatch)
- [ ] Alerting configured
- [ ] Structured logging implemented
- [ ] Error tracking (Sentry/Rollbar)
- [ ] Dashboard created for webhook health
- [ ] On-call rotation configured

### Testing
- [ ] Unit tests for signature verification
- [ ] Integration tests for webhook handler
- [ ] Load tests performed
- [ ] Failure scenario tests (network errors, timeouts)
- [ ] Idempotency tests
- [ ] End-to-end tests in sandbox environment

### Documentation
- [ ] Internal runbook created
- [ ] Error scenarios documented
- [ ] Monitoring dashboards documented
- [ ] Escalation procedures defined
- [ ] API keys rotation process documented

### Performance
- [ ] Response time <200ms for webhook handler
- [ ] Queue processing time acceptable
- [ ] Database query performance optimized
- [ ] Auto-scaling configured
- [ ] Resource limits tested

### Operational
- [ ] Sandbox testing completed
- [ ] Production credentials obtained
- [ ] Product mappings configured in Apex Admin
- [ ] Team trained on webhook system
- [ ] Contact established with Apex support
- [ ] Maintenance windows communicated

---

## Support

For webhook implementation support:

- **Email**: integrations@theapexway.net
- **Slack**: #webhook-integrations
- **Phone**: +1 (555) 123-4567

---

**Document Version**: 1.0.0
**Last Updated**: March 17, 2026
