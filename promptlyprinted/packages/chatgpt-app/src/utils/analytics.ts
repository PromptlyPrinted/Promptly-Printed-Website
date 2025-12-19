/**
 * ChatGPT App Analytics
 * 
 * Track events for ChatGPT app conversions and user behavior.
 * These events should be sent to PromptlyPrinted's analytics backend.
 */

const ANALYTICS_ENDPOINT = process.env.PROMPTLY_PRINTED_URL || 'https://promptlyprinted.com';

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: number;
  sessionId?: string;
  userId?: string;
}

/**
 * Recommended analytics events to track for ChatGPT app
 */
export const CHATGPT_ANALYTICS_EVENTS = {
  // Engagement events
  APP_LOADED: 'chatgpt_app_loaded',
  DESIGN_REQUESTED: 'chatgpt_design_requested',
  DESIGN_FROM_DALLE: 'chatgpt_design_from_dalle',
  DESIGN_REDIRECT_WEBSITE: 'chatgpt_design_redirect',
  
  // Product events
  PRODUCTS_VIEWED: 'chatgpt_products_viewed',
  PRODUCT_CONFIGURED: 'chatgpt_product_configured',
  
  // Conversion events
  PROMO_CODE_APPLIED: 'chatgpt_promo_applied',
  PROMO_CODE_INVALID: 'chatgpt_promo_invalid',
  CHECKOUT_INITIATED: 'chatgpt_checkout_initiated',
  CHECKOUT_COMPLETED: 'chatgpt_checkout_completed', // Tracked on website
  
  // Lead generation
  EMAIL_CAPTURED: 'chatgpt_email_captured',
  ACCOUNT_CREATED: 'chatgpt_account_created',
} as const;

/**
 * Track an analytics event
 */
export async function trackEvent(
  event: string,
  properties: Record<string, unknown> = {},
  sessionId?: string
): Promise<void> {
  const analyticsEvent: AnalyticsEvent = {
    event,
    properties: {
      ...properties,
      source: 'chatgpt_app',
      timestamp: new Date().toISOString(),
    },
    timestamp: Date.now(),
    sessionId,
  };

  try {
    // Send to analytics endpoint (fire and forget)
    fetch(`${ANALYTICS_ENDPOINT}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analyticsEvent),
    }).catch(() => {
      // Silently fail - analytics should never block the user flow
    });
  } catch {
    // Silently fail
  }
}

/**
 * Track app engagement with context
 */
export function trackDesignRequest(
  type: 'user_image' | 'prompt' | 'redirect',
  prompt?: string,
  style?: string,
  sessionId?: string
): void {
  const event = type === 'user_image' 
    ? CHATGPT_ANALYTICS_EVENTS.DESIGN_FROM_DALLE
    : type === 'redirect'
    ? CHATGPT_ANALYTICS_EVENTS.DESIGN_REDIRECT_WEBSITE
    : CHATGPT_ANALYTICS_EVENTS.DESIGN_REQUESTED;

  trackEvent(event, { prompt, style, type }, sessionId);
}

/**
 * Track product configuration
 */
export function trackProductConfig(
  productSku: string,
  productName: string,
  color: string,
  size: string,
  price: number,
  sessionId?: string
): void {
  trackEvent(
    CHATGPT_ANALYTICS_EVENTS.PRODUCT_CONFIGURED,
    { productSku, productName, color, size, price },
    sessionId
  );
}

/**
 * Track checkout initiation
 */
export function trackCheckoutInitiated(
  productSku: string,
  price: number,
  promoCode: string | undefined,
  discount: number,
  finalPrice: number,
  sessionId?: string
): void {
  trackEvent(
    CHATGPT_ANALYTICS_EVENTS.CHECKOUT_INITIATED,
    { productSku, price, promoCode, discount, finalPrice },
    sessionId
  );
}

/**
 * Track promo code usage
 */
export function trackPromoCode(
  code: string,
  valid: boolean,
  discountValue?: number,
  sessionId?: string
): void {
  const event = valid 
    ? CHATGPT_ANALYTICS_EVENTS.PROMO_CODE_APPLIED
    : CHATGPT_ANALYTICS_EVENTS.PROMO_CODE_INVALID;

  trackEvent(event, { code, valid, discountValue }, sessionId);
}
