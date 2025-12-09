/**
 * Shared Credit Constants and Types
 * Safe for use in both Client and Server components
 */

import { AIModelType } from '@repo/database';

// Credit costs per model (must match database enum and quiz config)
export const MODEL_CREDIT_COSTS: Record<string, number> = {
  'flux-dev': 1,
  'flux-2-pro': 1,
  'lora-normal': 1,
  'lora-context': 1,
  'nano-banana': 0.5,
  'nano-banana-pro': 2,
  'gemini-flash': 1, // TBD - may adjust based on actual costs
};

// Map string model names to database enum
export function mapModelNameToEnum(modelName: string): AIModelType {
  const mapping: Record<string, AIModelType> = {
    'flux-dev': 'FLUX_DEV',
    'flux-2-pro': 'FLUX_DEV', // Using FLUX_DEV enum for now
    'lora-normal': 'LORA_NORMAL',
    'lora-context': 'LORA_CONTEXT',
    'nano-banana': 'NANO_BANANA',
    'nano-banana-pro': 'NANO_BANANA_PRO',
    'gemini-flash': 'GEMINI_FLASH',
  };

  return mapping[modelName] || 'FLUX_DEV';
}

// Configuration
export const GUEST_STARTING_CREDITS = 0; // Users must sign up - quiz flow captures them at StyleResult
export const WELCOME_CREDITS = 50; // Credits given when user creates account
export const MONTHLY_CREDITS = 50; // Credits allocated at the start of each month
export const TSHIRT_PURCHASE_BONUS = 10; // Bonus credits for each T-shirt purchase

