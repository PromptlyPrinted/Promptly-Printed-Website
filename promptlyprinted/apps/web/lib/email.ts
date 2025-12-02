import { Resend } from 'resend';

if (!process.env.RESEND_TOKEN) {
  console.warn('RESEND_TOKEN not configured. Emails will not be sent.');
}

const resend = process.env.RESEND_TOKEN ? new Resend(process.env.RESEND_TOKEN) : null;

const FROM_EMAIL = process.env.RESEND_FROM || 'noreply@promptlyprinted.com';
const SITE_URL = process.env.NEXT_PUBLIC_WEB_URL || 'https://promptlyprinted.com';

/**
 * Send Welcome Email when user signs up
 */
export async function sendWelcomeEmail({
  to,
  firstName,
}: {
  to: string;
  firstName?: string;
}) {
  if (!resend) {
    console.warn('Resend not configured, skipping welcome email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Promptly Printed <${FROM_EMAIL}>`,
      to: [to],
      subject: 'Welcome to Promptly Printed! 🎨',
      html: getWelcomeEmailHTML(firstName),
      text: getWelcomeEmailText(firstName),
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error };
    }

    console.log('Welcome email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

/**
 * Send Order Confirmation Email
 */
export async function sendOrderConfirmation({
  to,
  orderNumber,
  items,
  total,
  trackingUrl,
}: {
  to: string;
  orderNumber: string;
  items: Array<{ name: string; price: number; copies: number }>;
  total: number;
  trackingUrl?: string | null;
}) {
  if (!resend) {
    console.warn('Resend not configured, skipping order confirmation');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Promptly Printed Orders <${FROM_EMAIL}>`,
      to: [to],
      subject: `Order Confirmation #${orderNumber} - Promptly Printed`,
      html: getOrderConfirmationHTML(orderNumber, items, total, trackingUrl),
      text: getOrderConfirmationText(orderNumber, items, total, trackingUrl),
    });

    if (error) {
      console.error('Failed to send order confirmation:', error);
      return { success: false, error };
    }

    console.log('Order confirmation sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return { success: false, error };
  }
}

/**
 * Send Competition Entry Confirmation
 */
export async function sendCompetitionEntryEmail({
  to,
  referralCode,
  competitionName,
  prize,
  endDate,
}: {
  to: string;
  referralCode: string;
  competitionName: string;
  prize: string;
  endDate: Date;
}) {
  if (!resend) {
    console.warn('Resend not configured, skipping competition entry email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Promptly Printed Competitions <${FROM_EMAIL}>`,
      to: [to],
      subject: `You're in the ${competitionName} Competition! 🎉`,
      html: getCompetitionEntryHTML(referralCode, competitionName, prize, endDate),
      text: getCompetitionEntryText(referralCode, competitionName, prize, endDate),
    });

    if (error) {
      console.error('Failed to send competition entry email:', error);
      return { success: false, error };
    }

    console.log('Competition entry email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending competition entry email:', error);
    return { success: false, error };
  }
}

/**
 * Send Design Saved Notification
 */
export async function sendDesignSavedEmail({
  to,
  designUrl,
  productName,
}: {
  to: string;
  designUrl: string;
  productName: string;
}) {
  if (!resend) {
    console.warn('Resend not configured, skipping design saved email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Promptly Printed <${FROM_EMAIL}>`,
      to: [to],
      subject: 'Your Design is Ready! 🎨',
      html: getDesignSavedHTML(designUrl, productName),
      text: getDesignSavedText(designUrl, productName),
    });

    if (error) {
      console.error('Failed to send design saved email:', error);
      return { success: false, error };
    }

    console.log('Design saved email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending design saved email:', error);
    return { success: false, error };
  }
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

function getWelcomeEmailHTML(firstName?: string): string {
  const name = firstName || 'there';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Promptly Printed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Welcome to Promptly Printed!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 18px; color: #333333; margin: 0 0 20px 0;">Hi ${name}! 👋</p>

              <p style="font-size: 16px; color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                Thanks for joining Promptly Printed! We're excited to help you create amazing custom apparel with AI-powered designs.
              </p>

              <h2 style="font-size: 20px; color: #333333; margin: 30px 0 15px 0;">🎨 What You Can Do:</h2>

              <ul style="font-size: 16px; color: #666666; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                <li>Create unlimited AI-designed apparel</li>
                <li>Enter our £500 Christmas Competition</li>
                <li>Get 10% off your first order with code <strong style="color: #667eea;">WELCOME10</strong></li>
                <li>Earn points for referrals and engagement</li>
              </ul>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${SITE_URL}/christmas-2025/quiz?utm_source=email&utm_medium=welcome&utm_campaign=onboarding"
                       style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                      Create Your First Design →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; color: #999999; line-height: 1.6; margin: 30px 0 0 0; border-top: 1px solid #eeeeee; padding-top: 20px;">
                Need help? Reply to this email or visit our <a href="${SITE_URL}/help" style="color: #667eea;">Help Center</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="font-size: 14px; color: #999999; margin: 0 0 10px 0;">
                © ${new Date().getFullYear()} Promptly Printed. All rights reserved.
              </p>
              <p style="font-size: 12px; color: #bbbbbb; margin: 0;">
                <a href="${SITE_URL}/unsubscribe" style="color: #bbbbbb; text-decoration: underline;">Unsubscribe</a>
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

function getWelcomeEmailText(firstName?: string): string {
  const name = firstName || 'there';

  return `
Hi ${name}!

Thanks for joining Promptly Printed! We're excited to help you create amazing custom apparel with AI-powered designs.

What You Can Do:
- Create unlimited AI-designed apparel
- Enter our £500 Christmas Competition
- Get 10% off your first order with code WELCOME10
- Earn points for referrals and engagement

Create Your First Design:
${SITE_URL}/christmas-2025/quiz?utm_source=email&utm_medium=welcome&utm_campaign=onboarding

Need help? Reply to this email or visit ${SITE_URL}/help

© ${new Date().getFullYear()} Promptly Printed
Unsubscribe: ${SITE_URL}/unsubscribe
  `;
}

function getOrderConfirmationHTML(
  orderNumber: string,
  items: Array<{ name: string; price: number; copies: number }>,
  total: number,
  trackingUrl?: string | null
): string {
  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #eeeeee;">
        <strong style="color: #333333; font-size: 16px;">${item.name}</strong><br>
        <span style="color: #666666; font-size: 14px;">Quantity: ${item.copies}</span>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #eeeeee; text-align: right;">
        <span style="color: #333333; font-size: 16px;">£${(item.price * item.copies).toFixed(2)}</span>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #10b981; padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Order Confirmed!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Order #${orderNumber}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 16px; color: #666666; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for your order! We're preparing your custom apparel and will send you tracking information soon.
              </p>

              <h2 style="font-size: 20px; color: #333333; margin: 0 0 20px 0;">Order Summary</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eeeeee; border-radius: 8px; overflow: hidden;">
                ${itemsHTML}
                <tr>
                  <td style="padding: 20px; background-color: #f9f9f9; text-align: right;" colspan="2">
                    <strong style="color: #333333; font-size: 20px;">Total: £${total.toFixed(2)}</strong>
                  </td>
                </tr>
              </table>

              ${trackingUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 30px 0 20px 0;">
                    <a href="${trackingUrl}"
                       style="display: inline-block; padding: 16px 40px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                      Track Your Order →
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="font-size: 14px; color: #999999; line-height: 1.6; margin: 30px 0 0 0; border-top: 1px solid #eeeeee; padding-top: 20px;">
                Questions about your order? Reply to this email or contact our support team.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="font-size: 14px; color: #999999; margin: 0;">
                © ${new Date().getFullYear()} Promptly Printed. All rights reserved.
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

function getOrderConfirmationText(
  orderNumber: string,
  items: Array<{ name: string; price: number; copies: number }>,
  total: number,
  trackingUrl?: string | null
): string {
  const itemsText = items.map(item =>
    `${item.name} (x${item.copies}) - £${(item.price * item.copies).toFixed(2)}`
  ).join('\n');

  return `
Order Confirmed! ✅
Order #${orderNumber}

Thank you for your order! We're preparing your custom apparel and will send you tracking information soon.

ORDER SUMMARY:
${itemsText}

Total: £${total.toFixed(2)}

${trackingUrl ? `Track Your Order: ${trackingUrl}` : 'Tracking information will be sent soon.'}

Questions about your order? Reply to this email.

© ${new Date().getFullYear()} Promptly Printed
  `;
}

function getCompetitionEntryHTML(
  referralCode: string,
  competitionName: string,
  prize: string,
  endDate: Date
): string {
  const formattedDate = endDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Competition Entry Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #16a34a 100%); padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">You're In the Competition!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">${prize} Prize</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 18px; color: #333333; margin: 0 0 20px 0;">
                Congratulations! Your design has been entered into the ${competitionName} competition.
              </p>

              <div style="background-color: #f0fdf4; border: 2px dashed #10b981; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">Your Referral Code</p>
                <p style="margin: 0; font-size: 32px; font-weight: bold; color: #059669; font-family: monospace; letter-spacing: 2px;">${referralCode}</p>
              </div>

              <h2 style="font-size: 20px; color: #333333; margin: 30px 0 15px 0;">💰 How to Earn More Points:</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 15px; border: 1px solid #eeeeee; border-radius: 8px; margin-bottom: 10px;">
                    <strong style="color: #333333; font-size: 16px;">📸 Upload Photo Wearing It</strong><br>
                    <span style="color: #666666; font-size: 14px;">+100 points</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; border: 1px solid #eeeeee; border-radius: 8px; margin-bottom: 10px;">
                    <strong style="color: #333333; font-size: 16px;">👥 Refer a Friend</strong><br>
                    <span style="color: #666666; font-size: 14px;">+150 points per referral</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; border: 1px solid #eeeeee; border-radius: 8px; margin-bottom: 10px;">
                    <strong style="color: #333333; font-size: 16px;">❤️ Get Likes on Your Design</strong><br>
                    <span style="color: #666666; font-size: 14px;">+5 points per like</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; border: 1px solid #eeeeee; border-radius: 8px;">
                    <strong style="color: #333333; font-size: 16px;">📱 Follow on Social Media</strong><br>
                    <span style="color: #666666; font-size: 14px;">+50 points</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 30px 0 20px 0;">
                    <a href="${SITE_URL}/competition/dashboard?utm_source=email&utm_medium=competition&utm_campaign=entry"
                       style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #dc2626 0%, #16a34a 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                      View Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; color: #999999; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                Competition ends ${formattedDate}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="font-size: 14px; color: #999999; margin: 0;">
                © ${new Date().getFullYear()} Promptly Printed. All rights reserved.
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

function getCompetitionEntryText(
  referralCode: string,
  competitionName: string,
  prize: string,
  endDate: Date
): string {
  const formattedDate = endDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
🎉 You're In the Competition!

Congratulations! Your design has been entered into the ${competitionName} competition for a ${prize} prize.

Your Referral Code: ${referralCode}

How to Earn More Points:
- Upload Photo Wearing It: +100 points
- Refer a Friend: +150 points per referral
- Get Likes on Your Design: +5 points per like
- Follow on Social Media: +50 points

View Your Dashboard:
${SITE_URL}/competition/dashboard?utm_source=email&utm_medium=competition&utm_campaign=entry

Competition ends ${formattedDate}

Good luck!

© ${new Date().getFullYear()} Promptly Printed
  `;
}

function getDesignSavedHTML(designUrl: string, productName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Design is Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">🎨</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Your Design is Ready!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 18px; color: #333333; margin: 0 0 30px 0;">
                Your custom AI-designed ${productName} is ready to order!
              </p>

              <!-- Design Preview -->
              <div style="text-align: center; margin: 30px 0;">
                <img src="${designUrl}" alt="Your Design" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
              </div>

              <h2 style="font-size: 20px; color: #333333; margin: 30px 0 15px 0;">Next Steps:</h2>

              <ul style="font-size: 16px; color: #666666; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                <li>Order your design and get it delivered</li>
                <li>Enter the Christmas competition (£500 prize!)</li>
                <li>Share with friends and earn points</li>
                <li>Create more designs for free</li>
              </ul>

              <!-- CTA Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0;">
                    <a href="${SITE_URL}/my-designs?utm_source=email&utm_medium=design_saved&utm_campaign=activation"
                       style="display: inline-block; padding: 16px 40px; background-color: #ea580c; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 5px;">
                      Order Now →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 10px 0;">
                    <a href="${SITE_URL}/christmas-2025/quiz?utm_source=email&utm_medium=design_saved&utm_campaign=activation"
                       style="display: inline-block; padding: 16px 40px; background-color: #ffffff; color: #ea580c; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; border: 2px solid #ea580c; margin: 5px;">
                      Create Another Design
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="font-size: 14px; color: #999999; margin: 0;">
                © ${new Date().getFullYear()} Promptly Printed. All rights reserved.
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

function getDesignSavedText(designUrl: string, productName: string): string {
  return `
🎨 Your Design is Ready!

Your custom AI-designed ${productName} is ready to order!

View your design: ${designUrl}

Next Steps:
- Order your design and get it delivered
- Enter the Christmas competition (£500 prize!)
- Share with friends and earn points
- Create more designs for free

Order Now:
${SITE_URL}/my-designs?utm_source=email&utm_medium=design_saved&utm_campaign=activation

Create Another Design:
${SITE_URL}/christmas-2025/quiz?utm_source=email&utm_medium=design_saved&utm_campaign=activation

© ${new Date().getFullYear()} Promptly Printed
  `;
}
