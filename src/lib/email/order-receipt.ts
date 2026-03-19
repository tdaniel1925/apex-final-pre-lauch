// =============================================
// Order Receipt Email Template
// Sent after successful product purchase
// =============================================

interface OrderReceiptParams {
  distributorName: string;
  distributorEmail: string;
  productName: string;
  productDescription?: string;
  quantityPurchased: number;
  amountPaid: number; // in dollars
  bvEarned: number;
  orderNumber: string;
  orderDate: string;
  isSubscription: boolean;
  subscriptionInterval?: string;
}

export function generateOrderReceiptHTML(params: OrderReceiptParams): string {
  const {
    distributorName,
    productName,
    productDescription,
    quantityPurchased,
    amountPaid,
    bvEarned,
    orderNumber,
    orderDate,
    isSubscription,
    subscriptionInterval,
  } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Apex Affinity Group</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">

  <!-- Email Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1B3A7D 0%, #274693 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Order Confirmed!</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Thank you for your purchase</p>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 40px;">

              <!-- Greeting -->
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #333333;">
                Hi ${distributorName},
              </p>

              <p style="margin: 0 0 24px 0; font-size: 16px; color: #333333;">
                Your order has been successfully processed! ${isSubscription ? 'Your subscription is now active.' : 'Your product is ready.'}
              </p>

              <!-- Order Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <span style="font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</span>
                          <div style="font-size: 16px; font-weight: 600; color: #1B3A7D; margin-top: 4px;">${orderNumber}</div>
                        </td>
                        <td style="padding-bottom: 12px; text-align: right;">
                          <span style="font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</span>
                          <div style="font-size: 16px; font-weight: 600; color: #333333; margin-top: 4px;">${orderDate}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Product Details -->
              <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #0F2045; font-weight: 700;">Product Details</h3>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <div style="font-size: 16px; font-weight: 600; color: #333333;">${productName}</div>
                      ${productDescription ? `<div style="font-size: 14px; color: #6c757d; margin-top: 4px;">${productDescription}</div>` : ''}
                      ${isSubscription ? `<div style="margin-top: 8px; display: inline-block; background-color: #E8F5E9; color: #2E7D32; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">Recurring ${subscriptionInterval || 'Monthly'}</div>` : ''}
                    </td>
                    <td style="text-align: right; padding-bottom: 12px;">
                      <div style="font-size: 14px; color: #6c757d;">Qty: ${quantityPurchased}</div>
                    </td>
                  </tr>
                </table>

                <!-- Pricing Breakdown -->
                <div style="border-top: 1px solid #e0e0e0; margin-top: 16px; padding-top: 16px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 8px 0;">
                        <span style="font-size: 14px; color: #6c757d;">Amount Paid:</span>
                      </td>
                      <td style="text-align: right; padding: 8px 0;">
                        <span style="font-size: 16px; font-weight: 700; color: #333333;">$${amountPaid.toFixed(2)}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-top: 2px solid #1B3A7D;">
                        <span style="font-size: 14px; font-weight: 700; color: #1B3A7D;">Business Volume (BV) Earned:</span>
                      </td>
                      <td style="text-align: right; padding: 8px 0; border-top: 2px solid #1B3A7D;">
                        <span style="font-size: 18px; font-weight: 700; color: #0F2045;">${bvEarned} BV</span>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- BV Info Box -->
              <div style="background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); border-left: 4px solid #2E7D32; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center;">
                  <div style="font-size: 32px; margin-right: 12px;">🎉</div>
                  <div>
                    <div style="font-size: 14px; font-weight: 700; color: #1B5E20; margin-bottom: 4px;">Commission Qualified!</div>
                    <div style="font-size: 13px; color: #2E7D32;">This purchase counts toward your monthly BV requirements and qualifies for commission earnings.</div>
                  </div>
                </div>
              </div>

              <!-- Payment Info -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <div style="font-size: 12px; color: #6c757d; margin-bottom: 8px;">PAYMENT PROCESSED BY</div>
                <div style="font-size: 14px; color: #333333;">
                  <strong>Stripe</strong> - Your payment has been securely processed. A separate receipt from Stripe has also been sent to your email.
                </div>
              </div>

              <!-- Next Steps -->
              ${isSubscription ? `
              <div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #0F2045; font-weight: 700;">Subscription Details</h3>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #333333;">
                  Your subscription will automatically renew ${subscriptionInterval || 'monthly'}. You'll receive BV credit with each renewal.
                </p>
                <p style="margin: 0; font-size: 14px; color: #6c757d;">
                  You can manage your subscription anytime from your account dashboard.
                </p>
              </div>
              ` : ''}

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050'}/dashboard"
                   style="display: inline-block; background: linear-gradient(135deg, #1B3A7D 0%, #274693 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  View Dashboard
                </a>
              </div>

              <!-- Footer Message -->
              <div style="border-top: 1px solid #e0e0e0; padding-top: 24px; margin-top: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #333333;">
                  Questions about your order?
                </p>
                <p style="margin: 0; font-size: 14px; color: #6c757d;">
                  Contact our support team at <a href="mailto:support@theapexway.net" style="color: #1B3A7D; text-decoration: none;">support@theapexway.net</a>
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0F2045; padding: 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: rgba(255,255,255,0.8);">
                Apex Affinity Group
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.6);">
                Building success together, one member at a time.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

export function generateOrderReceiptSubject(isSubscription: boolean, productName: string): string {
  if (isSubscription) {
    return `Subscription Activated: ${productName} 🎉`;
  }
  return `Order Confirmed: ${productName} ✅`;
}
