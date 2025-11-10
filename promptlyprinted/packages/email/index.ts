import { env } from '@repo/env';
import { Resend } from 'resend';

// Use a dummy key for build time when RESEND_TOKEN is not available
// The actual token will be required at runtime for email sending
export const resend = new Resend(env.RESEND_TOKEN || 're_dummy_build_key_12345678901234567890');
