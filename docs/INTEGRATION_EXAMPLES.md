# Apex Integration - Code Examples

Complete implementation examples in multiple programming languages.

---

## Table of Contents

1. [Node.js/Express](#nodejs--express)
2. [Python/Flask](#python--flask)
3. [PHP/Laravel](#php--laravel)
4. [Ruby/Rails](#ruby--rails)
5. [Go](#go)
6. [C#/.NET](#c--net)

---

## Node.js / Express

### Full Integration Implementation

```javascript
// apex-integration.js
const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// ============================================
// Configuration
// ============================================
const config = {
  platformApiKey: process.env.YOUR_PLATFORM_API_KEY,
  apexWebhookSecret: process.env.APEX_WEBHOOK_SECRET,
  apexBaseUrl: process.env.APEX_BASE_URL || 'https://sandbox.theapexway.net/api',
  platformName: 'yourplatform'
};

// ============================================
// Middleware: Verify API Key
// ============================================
function verifyApiKey(req, res, next) {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');

  if (apiKey !== config.platformApiKey) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Invalid API key'
    });
  }

  next();
}

// ============================================
// USER CREATION ENDPOINT
// ============================================
router.post('/api/v1/apex/users', verifyApiKey, async (req, res) => {
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
      company_name,
      metadata
    } = req.body;

    // Validate required fields
    const requiredFields = ['email', 'first_name', 'last_name', 'apex_distributor_id'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: `Missing required fields: ${missingFields.join(', ')}`,
        details: { missing_fields: missingFields }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'Invalid email address format',
        details: { field: 'email' }
      });
    }

    // Check if user already exists (idempotency)
    const existingUser = await db.users.findOne({ apex_distributor_id });

    if (existingUser) {
      // User already exists - return existing user (idempotent)
      return res.status(200).json({
        success: true,
        user_id: existingUser.id,
        username: existingUser.username,
        site_url: `https://yourplatform.com/${existingUser.username}`,
        dashboard_url: `https://yourplatform.com/dashboard/${existingUser.username}`,
        created_at: existingUser.created_at.toISOString(),
        message: 'User already exists'
      });
    }

    // Generate unique username if not provided
    const finalUsername = username || generateUniqueUsername(first_name, last_name);

    // Create user account
    const user = await db.users.create({
      email,
      first_name,
      last_name,
      username: finalUsername,
      phone,
      company_name,
      apex_distributor_id,
      apex_member_id,
      apex_affiliate_code,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Generate onboarding token
    const onboardingToken = generateOnboardingToken(user.id);

    // Send welcome email (async, don't wait)
    sendWelcomeEmail(user).catch(err =>
      console.error('Welcome email failed:', err)
    );

    // Return success response
    return res.status(201).json({
      success: true,
      user_id: user.id,
      username: user.username,
      site_url: `https://yourplatform.com/${user.username}`,
      dashboard_url: `https://yourplatform.com/dashboard/${user.username}`,
      onboarding_url: `https://yourplatform.com/onboard?token=${onboardingToken}`,
      created_at: user.created_at.toISOString(),
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('User creation error:', error);

    // Handle duplicate email error
    if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'USER_EXISTS',
        message: 'User with this email already exists'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to create user account',
      request_id: req.id || generateRequestId()
    });
  }
});

// ============================================
// WEBHOOK SENDER CLASS
// ============================================
class ApexWebhookSender {
  constructor() {
    this.webhookSecret = config.apexWebhookSecret;
    this.baseUrl = config.apexBaseUrl;
    this.platformName = config.platformName;
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

  async sendWebhook(eventType, data, maxRetries = 3) {
    const payload = this.buildPayload(eventType, data);
    const signature = this.generateSignature(payload);
    const eventTimestamp = Math.floor(Date.now() / 1000);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
        const status = error.response?.status;
        const isRetryable = [429, 500, 502, 503, 504].includes(status);
        const isLastAttempt = attempt === maxRetries;

        // Don't retry client errors
        if (status && status < 500 && status !== 429) {
          console.error('Webhook failed (non-retryable):', error.response?.data);
          return { success: false, error: error.response?.data };
        }

        // Retry with exponential backoff
        if (isRetryable && !isLastAttempt) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 60000);
          console.log(`Retrying webhook after ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Max retries exceeded
        console.error('Webhook failed after max retries:', error.message);
        return { success: false, error: error.message };
      }
    }
  }

  buildPayload(eventType, data) {
    return {
      event: eventType,
      event_id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      platform: {
        name: this.platformName,
        version: '1.0.0'
      },
      seller: {
        user_id: data.sellerId,
        apex_distributor_id: data.apexDistributorId,
        apex_member_id: data.apexMemberId,
        email: data.sellerEmail,
        name: data.sellerName
      },
      order: {
        order_id: data.orderId,
        order_number: data.orderNumber,
        status: data.orderStatus || 'completed'
      },
      product: {
        product_id: data.productId,
        product_name: data.productName,
        product_sku: data.productSku,
        product_category: data.productCategory
      },
      transaction: {
        amount: parseFloat(data.amount),
        currency: data.currency || 'USD',
        payment_method: data.paymentMethod,
        transaction_id: data.transactionId
      },
      customer: {
        customer_id: data.customerId,
        email: data.customerEmail,
        name: data.customerName,
        phone: data.customerPhone
      },
      metadata: data.metadata || {}
    };
  }

  async sendSaleCreated(saleData) {
    return this.sendWebhook('sale.created', saleData);
  }

  async sendSaleRefunded(refundData) {
    return this.sendWebhook('sale.refunded', refundData);
  }

  async sendSubscriptionCreated(subscriptionData) {
    return this.sendWebhook('subscription.created', subscriptionData);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function generateUniqueUsername(firstName, lastName) {
  const base = `${firstName}${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const random = Math.random().toString(36).substring(2, 6);
  return `${base}${random}`;
}

function generateOnboardingToken(userId) {
  return crypto
    .createHash('sha256')
    .update(`${userId}-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`)
    .digest('hex')
    .substring(0, 32);
}

function generateRequestId() {
  return `req_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

async function sendWelcomeEmail(user) {
  // Implement your email sending logic here
  console.log(`Sending welcome email to ${user.email}`);
}

// ============================================
// USAGE IN ORDER PROCESSING
// ============================================
const webhookSender = new ApexWebhookSender();

async function handleOrderCompletion(order) {
  // Get seller information
  const seller = await db.users.findById(order.seller_id);

  if (!seller.apex_distributor_id) {
    console.log('Seller is not an Apex distributor, skipping webhook');
    return;
  }

  // Send webhook to Apex
  const result = await webhookSender.sendSaleCreated({
    sellerId: seller.id,
    apexDistributorId: seller.apex_distributor_id,
    apexMemberId: seller.apex_member_id,
    sellerEmail: seller.email,
    sellerName: `${seller.first_name} ${seller.last_name}`,
    orderId: order.id,
    orderNumber: order.order_number,
    productId: order.product_id,
    productName: order.product_name,
    productSku: order.product_sku,
    productCategory: order.product_category || 'general',
    amount: order.amount,
    currency: 'USD',
    paymentMethod: order.payment_method,
    transactionId: order.transaction_id,
    customerId: order.customer_id,
    customerEmail: order.customer_email,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    metadata: {
      commission_eligible: true,
      sale_type: 'direct',
      channel: 'web'
    }
  });

  if (result.success) {
    // Store Apex order ID for reference
    await db.orders.update(order.id, {
      apex_order_id: result.data.apex_order_id,
      apex_notified_at: new Date()
    });
    console.log('Apex notified successfully');
  } else {
    // Log error and queue for retry
    console.error('Failed to notify Apex:', result.error);
    await db.webhookFailures.create({
      order_id: order.id,
      error: result.error,
      retry_count: 0
    });
  }
}

module.exports = router;
```

---

## Python / Flask

### Full Integration Implementation

```python
# apex_integration.py
from flask import Flask, request, jsonify
import hmac
import hashlib
import json
import time
import os
import requests
from datetime import datetime
import secrets

app = Flask(__name__)

# ============================================
# Configuration
# ============================================
class Config:
    PLATFORM_API_KEY = os.getenv('YOUR_PLATFORM_API_KEY')
    APEX_WEBHOOK_SECRET = os.getenv('APEX_WEBHOOK_SECRET')
    APEX_BASE_URL = os.getenv('APEX_BASE_URL', 'https://sandbox.theapexway.net/api')
    PLATFORM_NAME = 'yourplatform'

# ============================================
# Middleware: Verify API Key
# ============================================
def verify_api_key():
    auth_header = request.headers.get('Authorization', '')
    api_key = auth_header.replace('Bearer ', '')

    if api_key != Config.PLATFORM_API_KEY:
        return jsonify({
            'success': False,
            'error': 'UNAUTHORIZED',
            'message': 'Invalid API key'
        }), 401

    return None

# ============================================
# USER CREATION ENDPOINT
# ============================================
@app.route('/api/v1/apex/users', methods=['POST'])
def create_apex_user():
    # Verify API key
    auth_error = verify_api_key()
    if auth_error:
        return auth_error

    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['email', 'first_name', 'last_name', 'apex_distributor_id']
        missing_fields = [field for field in required_fields if not data.get(field)]

        if missing_fields:
            return jsonify({
                'success': False,
                'error': 'INVALID_REQUEST',
                'message': f'Missing required fields: {", ".join(missing_fields)}',
                'details': {'missing_fields': missing_fields}
            }), 400

        # Check if user already exists (idempotency)
        existing_user = db.users.find_one({
            'apex_distributor_id': data['apex_distributor_id']
        })

        if existing_user:
            return jsonify({
                'success': True,
                'user_id': str(existing_user['_id']),
                'username': existing_user['username'],
                'site_url': f"https://yourplatform.com/{existing_user['username']}",
                'dashboard_url': f"https://yourplatform.com/dashboard/{existing_user['username']}",
                'created_at': existing_user['created_at'].isoformat(),
                'message': 'User already exists'
            }), 200

        # Generate username
        username = data.get('username') or generate_unique_username(
            data['first_name'],
            data['last_name']
        )

        # Create user
        user = {
            'email': data['email'],
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'username': username,
            'phone': data.get('phone'),
            'company_name': data.get('company_name'),
            'apex_distributor_id': data['apex_distributor_id'],
            'apex_member_id': data.get('apex_member_id'),
            'apex_affiliate_code': data.get('apex_affiliate_code'),
            'status': 'active',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        user_id = db.users.insert_one(user).inserted_id
        user['_id'] = user_id

        # Generate onboarding token
        onboarding_token = generate_onboarding_token(str(user_id))

        # Send welcome email (async)
        send_welcome_email_async(user)

        return jsonify({
            'success': True,
            'user_id': str(user_id),
            'username': username,
            'site_url': f'https://yourplatform.com/{username}',
            'dashboard_url': f'https://yourplatform.com/dashboard/{username}',
            'onboarding_url': f'https://yourplatform.com/onboard?token={onboarding_token}',
            'created_at': user['created_at'].isoformat(),
            'message': 'User created successfully'
        }), 201

    except Exception as e:
        print(f'User creation error: {e}')
        return jsonify({
            'success': False,
            'error': 'INTERNAL_ERROR',
            'message': 'Failed to create user account',
            'request_id': generate_request_id()
        }), 500

# ============================================
# WEBHOOK SENDER CLASS
# ============================================
class ApexWebhookSender:
    def __init__(self):
        self.webhook_secret = Config.APEX_WEBHOOK_SECRET
        self.base_url = Config.APEX_BASE_URL
        self.platform_name = Config.PLATFORM_NAME

    def generate_signature(self, payload):
        payload_string = json.dumps(payload, separators=(',', ':'))
        signature = hmac.new(
            self.webhook_secret.encode('utf-8'),
            payload_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return signature

    def generate_event_id(self):
        return f"evt_{int(time.time())}_{secrets.token_hex(8)}"

    def send_webhook(self, event_type, data, max_retries=3):
        payload = self.build_payload(event_type, data)
        signature = self.generate_signature(payload)
        event_timestamp = int(time.time())

        for attempt in range(1, max_retries + 1):
            try:
                response = requests.post(
                    f"{self.base_url}/webhooks/{self.platform_name}",
                    json=payload,
                    headers={
                        'Content-Type': 'application/json',
                        'X-Platform-Signature': signature,
                        'X-Event-ID': payload['event_id'],
                        'X-Event-Timestamp': str(event_timestamp)
                    },
                    timeout=30
                )

                response.raise_for_status()
                print(f'Webhook sent successfully: {response.json()}')
                return {'success': True, 'data': response.json()}

            except requests.exceptions.RequestException as e:
                status = e.response.status_code if e.response else None
                is_retryable = status in [429, 500, 502, 503, 504]
                is_last_attempt = attempt == max_retries

                # Don't retry client errors
                if status and status < 500 and status != 429:
                    print(f'Webhook failed (non-retryable): {e.response.json()}')
                    return {'success': False, 'error': e.response.json()}

                # Retry with exponential backoff
                if is_retryable and not is_last_attempt:
                    delay = min(1 * (2 ** (attempt - 1)), 60)
                    print(f'Retrying webhook after {delay}s (attempt {attempt}/{max_retries})')
                    time.sleep(delay)
                    continue

                # Max retries exceeded
                print(f'Webhook failed after max retries: {str(e)}')
                return {'success': False, 'error': str(e)}

        return {'success': False, 'error': 'Max retries exceeded'}

    def build_payload(self, event_type, data):
        return {
            'event': event_type,
            'event_id': self.generate_event_id(),
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'platform': {
                'name': self.platform_name,
                'version': '1.0.0'
            },
            'seller': {
                'user_id': data['seller_id'],
                'apex_distributor_id': data['apex_distributor_id'],
                'apex_member_id': data.get('apex_member_id'),
                'email': data['seller_email'],
                'name': data['seller_name']
            },
            'order': {
                'order_id': data['order_id'],
                'order_number': data['order_number'],
                'status': data.get('order_status', 'completed')
            },
            'product': {
                'product_id': data['product_id'],
                'product_name': data['product_name'],
                'product_sku': data.get('product_sku'),
                'product_category': data.get('product_category')
            },
            'transaction': {
                'amount': float(data['amount']),
                'currency': data.get('currency', 'USD'),
                'payment_method': data['payment_method'],
                'transaction_id': data['transaction_id']
            },
            'customer': {
                'customer_id': data['customer_id'],
                'email': data['customer_email'],
                'name': data.get('customer_name'),
                'phone': data.get('customer_phone')
            },
            'metadata': data.get('metadata', {})
        }

    def send_sale_created(self, sale_data):
        return self.send_webhook('sale.created', sale_data)

    def send_sale_refunded(self, refund_data):
        return self.send_webhook('sale.refunded', refund_data)

    def send_subscription_created(self, subscription_data):
        return self.send_webhook('subscription.created', subscription_data)

# ============================================
# HELPER FUNCTIONS
# ============================================
def generate_unique_username(first_name, last_name):
    import re
    base = re.sub(r'[^a-z0-9]', '', f'{first_name}{last_name}'.lower())
    random = secrets.token_hex(2)
    return f'{base}{random}'

def generate_onboarding_token(user_id):
    token_data = f'{user_id}-{int(time.time())}-{secrets.token_hex(16)}'
    return hashlib.sha256(token_data.encode()).hexdigest()[:32]

def generate_request_id():
    return f"req_{int(time.time())}_{secrets.token_hex(8)}"

def send_welcome_email_async(user):
    # Implement async email sending
    print(f"Sending welcome email to {user['email']}")

# ============================================
# USAGE IN ORDER PROCESSING
# ============================================
webhook_sender = ApexWebhookSender()

def handle_order_completion(order):
    # Get seller information
    seller = db.users.find_one({'_id': order['seller_id']})

    if not seller.get('apex_distributor_id'):
        print('Seller is not an Apex distributor, skipping webhook')
        return

    # Send webhook to Apex
    result = webhook_sender.send_sale_created({
        'seller_id': str(seller['_id']),
        'apex_distributor_id': seller['apex_distributor_id'],
        'apex_member_id': seller.get('apex_member_id'),
        'seller_email': seller['email'],
        'seller_name': f"{seller['first_name']} {seller['last_name']}",
        'order_id': str(order['_id']),
        'order_number': order['order_number'],
        'product_id': order['product_id'],
        'product_name': order['product_name'],
        'product_sku': order.get('product_sku'),
        'product_category': order.get('product_category', 'general'),
        'amount': order['amount'],
        'currency': 'USD',
        'payment_method': order['payment_method'],
        'transaction_id': order['transaction_id'],
        'customer_id': order['customer_id'],
        'customer_email': order['customer_email'],
        'customer_name': order.get('customer_name'),
        'customer_phone': order.get('customer_phone'),
        'metadata': {
            'commission_eligible': True,
            'sale_type': 'direct',
            'channel': 'web'
        }
    })

    if result['success']:
        # Store Apex order ID
        db.orders.update_one(
            {'_id': order['_id']},
            {'$set': {
                'apex_order_id': result['data'].get('apex_order_id'),
                'apex_notified_at': datetime.utcnow()
            }}
        )
        print('Apex notified successfully')
    else:
        # Log error
        print(f"Failed to notify Apex: {result['error']}")
        db.webhook_failures.insert_one({
            'order_id': str(order['_id']),
            'error': result['error'],
            'retry_count': 0,
            'created_at': datetime.utcnow()
        })

if __name__ == '__main__':
    app.run(debug=True, port=3000)
```

---

## PHP / Laravel

### Full Integration Implementation

```php
<?php
// app/Http/Controllers/ApexIntegrationController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class ApexIntegrationController extends Controller
{
    private $platformApiKey;
    private $apexWebhookSecret;
    private $apexBaseUrl;
    private $platformName;

    public function __construct()
    {
        $this->platformApiKey = env('YOUR_PLATFORM_API_KEY');
        $this->apexWebhookSecret = env('APEX_WEBHOOK_SECRET');
        $this->apexBaseUrl = env('APEX_BASE_URL', 'https://sandbox.theapexway.net/api');
        $this->platformName = 'yourplatform';
    }

    // ============================================
    // USER CREATION ENDPOINT
    // ============================================
    public function createUser(Request $request)
    {
        // Verify API key
        $apiKey = str_replace('Bearer ', '', $request->header('Authorization'));

        if ($apiKey !== $this->platformApiKey) {
            return response()->json([
                'success' => false,
                'error' => 'UNAUTHORIZED',
                'message' => 'Invalid API key'
            ], 401);
        }

        // Validate request
        $validated = $request->validate([
            'email' => 'required|email',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'apex_distributor_id' => 'required|uuid',
            'username' => 'nullable|string',
            'phone' => 'nullable|string',
            'company_name' => 'nullable|string',
            'apex_member_id' => 'nullable|string',
            'apex_affiliate_code' => 'nullable|string'
        ]);

        try {
            // Check if user already exists (idempotency)
            $existingUser = User::where('apex_distributor_id', $validated['apex_distributor_id'])->first();

            if ($existingUser) {
                return response()->json([
                    'success' => true,
                    'user_id' => $existingUser->id,
                    'username' => $existingUser->username,
                    'site_url' => "https://yourplatform.com/{$existingUser->username}",
                    'dashboard_url' => "https://yourplatform.com/dashboard/{$existingUser->username}",
                    'created_at' => $existingUser->created_at->toIso8601String(),
                    'message' => 'User already exists'
                ], 200);
            }

            // Generate username
            $username = $validated['username'] ?? $this->generateUniqueUsername(
                $validated['first_name'],
                $validated['last_name']
            );

            // Create user
            $user = User::create([
                'email' => $validated['email'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'username' => $username,
                'phone' => $validated['phone'] ?? null,
                'company_name' => $validated['company_name'] ?? null,
                'apex_distributor_id' => $validated['apex_distributor_id'],
                'apex_member_id' => $validated['apex_member_id'] ?? null,
                'apex_affiliate_code' => $validated['apex_affiliate_code'] ?? null,
                'status' => 'active',
                'password' => Hash::make(Str::random(32)) // Random password, user will set via email
            ]);

            // Generate onboarding token
            $onboardingToken = $this->generateOnboardingToken($user->id);

            // Send welcome email (queued)
            // dispatch(new SendWelcomeEmail($user));

            return response()->json([
                'success' => true,
                'user_id' => $user->id,
                'username' => $user->username,
                'site_url' => "https://yourplatform.com/{$user->username}",
                'dashboard_url' => "https://yourplatform.com/dashboard/{$user->username}",
                'onboarding_url' => "https://yourplatform.com/onboard?token={$onboardingToken}",
                'created_at' => $user->created_at->toIso8601String(),
                'message' => 'User created successfully'
            ], 201);

        } catch (\Exception $e) {
            \Log::error('User creation error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_ERROR',
                'message' => 'Failed to create user account',
                'request_id' => Str::uuid()
            ], 500);
        }
    }

    // ============================================
    // WEBHOOK SENDER METHODS
    // ============================================
    public function sendSaleWebhook($saleData)
    {
        $payload = [
            'event' => 'sale.created',
            'event_id' => $this->generateEventId(),
            'timestamp' => now()->toIso8601String(),
            'platform' => [
                'name' => $this->platformName,
                'version' => '1.0.0'
            ],
            'seller' => [
                'user_id' => $saleData['seller_id'],
                'apex_distributor_id' => $saleData['apex_distributor_id'],
                'apex_member_id' => $saleData['apex_member_id'] ?? null,
                'email' => $saleData['seller_email'],
                'name' => $saleData['seller_name']
            ],
            'order' => [
                'order_id' => $saleData['order_id'],
                'order_number' => $saleData['order_number'],
                'status' => 'completed'
            ],
            'product' => [
                'product_id' => $saleData['product_id'],
                'product_name' => $saleData['product_name'],
                'product_sku' => $saleData['product_sku'] ?? null,
                'product_category' => $saleData['product_category'] ?? 'general'
            ],
            'transaction' => [
                'amount' => (float) $saleData['amount'],
                'currency' => 'USD',
                'payment_method' => $saleData['payment_method'],
                'transaction_id' => $saleData['transaction_id']
            ],
            'customer' => [
                'customer_id' => $saleData['customer_id'],
                'email' => $saleData['customer_email'],
                'name' => $saleData['customer_name'] ?? null,
                'phone' => $saleData['customer_phone'] ?? null
            ],
            'metadata' => $saleData['metadata'] ?? []
        ];

        $signature = $this->generateSignature($payload);
        $eventTimestamp = time();

        $client = new Client();
        $maxRetries = 3;

        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                $response = $client->post(
                    "{$this->apexBaseUrl}/webhooks/{$this->platformName}",
                    [
                        'json' => $payload,
                        'headers' => [
                            'Content-Type' => 'application/json',
                            'X-Platform-Signature' => $signature,
                            'X-Event-ID' => $payload['event_id'],
                            'X-Event-Timestamp' => (string) $eventTimestamp
                        ],
                        'timeout' => 30
                    ]
                );

                $result = json_decode($response->getBody(), true);
                \Log::info('Webhook sent successfully: ' . json_encode($result));
                return ['success' => true, 'data' => $result];

            } catch (RequestException $e) {
                $status = $e->hasResponse() ? $e->getResponse()->getStatusCode() : null;
                $isRetryable = in_array($status, [429, 500, 502, 503, 504]);
                $isLastAttempt = $attempt === $maxRetries;

                // Don't retry client errors
                if ($status && $status < 500 && $status !== 429) {
                    \Log::error('Webhook failed (non-retryable): ' . $e->getMessage());
                    return ['success' => false, 'error' => $e->getMessage()];
                }

                // Retry with exponential backoff
                if ($isRetryable && !$isLastAttempt) {
                    $delay = min(1 * pow(2, $attempt - 1), 60);
                    \Log::info("Retrying webhook after {$delay}s (attempt {$attempt}/{$maxRetries})");
                    sleep($delay);
                    continue;
                }

                \Log::error('Webhook failed after max retries: ' . $e->getMessage());
                return ['success' => false, 'error' => $e->getMessage()];
            }
        }

        return ['success' => false, 'error' => 'Max retries exceeded'];
    }

    // ============================================
    // HELPER METHODS
    // ============================================
    private function generateSignature($payload)
    {
        $payloadString = json_encode($payload, JSON_UNESCAPED_SLASHES);
        return hash_hmac('sha256', $payloadString, $this->apexWebhookSecret);
    }

    private function generateEventId()
    {
        return 'evt_' . time() . '_' . bin2hex(random_bytes(8));
    }

    private function generateUniqueUsername($firstName, $lastName)
    {
        $base = strtolower(preg_replace('/[^a-z0-9]/', '', $firstName . $lastName));
        $random = substr(md5(uniqid()), 0, 4);
        return $base . $random;
    }

    private function generateOnboardingToken($userId)
    {
        return substr(hash('sha256', $userId . time() . bin2hex(random_bytes(16))), 0, 32);
    }
}
```

---

## Additional Language Examples

Due to length constraints, I've provided the three most common languages. Would you like me to add:
- Ruby/Rails
- Go
- C#/.NET

Let me know and I'll create a separate file for those!

---

**Document Version**: 1.0.0
**Last Updated**: March 17, 2026
