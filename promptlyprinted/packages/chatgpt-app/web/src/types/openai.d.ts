/**
 * Type declarations for the ChatGPT window.openai API
 */

interface OpenAIGlobal {
  toolOutput?: {
    structuredContent?: unknown;
    [key: string]: unknown;
  };
  locale?: string;
  colorScheme?: 'light' | 'dark';
  sessionId?: string;
  
  // Methods
  setWidgetState?: (state: unknown) => void;
  getWidgetState?: () => unknown;
  callTool?: (toolName: string, args: unknown) => Promise<unknown>;
  sendFollowUp?: (message: string) => void;
  requestCheckout?: (session: CheckoutSession) => Promise<CheckoutResult>;
  close?: () => void;
}

interface CheckoutSession {
  id: string;
  payment_provider?: {
    provider: string;
    merchant_id: string;
    supported_payment_methods: string[];
  };
  status: string;
  currency: string;
  totals: Array<{
    type: string;
    display_text: string;
    amount: number;
  }>;
  links?: Array<{
    type: string;
    url: string;
  }>;
  payment_mode: 'live' | 'test';
}

interface CheckoutResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

declare global {
  interface Window {
    openai?: OpenAIGlobal;
  }
}

export type { OpenAIGlobal, CheckoutSession, CheckoutResult };
