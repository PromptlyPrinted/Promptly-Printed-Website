import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database';
import {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendCompetitionEntryEmail,
  sendDesignSavedEmail,
} from '@/lib/email';

/**
 * Admin Test Email API
 *
 * Allows admin users to send test emails to verify email configuration.
 * Supports testing all email templates.
 *
 * Access: Admin users only
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check admin authorization
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { emailType, to } = await request.json();

    if (!to) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    let result;

    switch (emailType) {
      case 'welcome':
        result = await sendWelcomeEmail({
          to,
          firstName: 'Test User',
        });
        break;

      case 'order':
        result = await sendOrderConfirmation({
          to,
          orderNumber: 'TEST-12345',
          items: [
            {
              name: 'Custom Christmas T-Shirt',
              sku: 'TEE-SS-STTU755',
              size: 'M',
              color: 'White',
              copies: 1,
              price: 29.99,
            },
            {
              name: 'Custom Holiday Hoodie',
              sku: 'HOOD-SS-STTU755',
              size: 'L',
              color: 'Black',
              copies: 2,
              price: 49.99,
            },
          ],
          total: 129.97,
          discountAmount: 13.0,
          shippingAddress: {
            name: 'Test User',
            line1: '123 Test Street',
            line2: 'Apt 4B',
            city: 'London',
            state: undefined,
            postalCode: 'SW1A 1AA',
            country: 'GB',
          },
        });
        break;

      case 'competition':
        result = await sendCompetitionEntryEmail({
          to,
          referralCode: 'XMAS-TEST-123ABC',
          competitionName: 'Christmas Design Competition 2025',
          prize: '£500 Cash + £1000 in Store Credit',
          endDate: new Date('2025-12-25'),
        });
        break;

      case 'design':
        result = await sendDesignSavedEmail({
          to,
          designUrl: 'https://promptlyprinted.com/saved-designs/test-design-123.png',
          productName: 'Custom T-Shirt',
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type. Use: welcome, order, competition, or design' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test ${emailType} email sent successfully to ${to}`,
      data: result.data,
    });
  } catch (error: any) {
    console.error('[Test Email] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET - Show available email types
 */
export async function GET() {
  return NextResponse.json({
    availableTypes: [
      {
        type: 'welcome',
        description: 'Welcome email sent when user signs up',
        example: {
          emailType: 'welcome',
          to: 'your@email.com',
        },
      },
      {
        type: 'order',
        description: 'Order confirmation email with receipt',
        example: {
          emailType: 'order',
          to: 'your@email.com',
        },
      },
      {
        type: 'competition',
        description: 'Competition entry confirmation with referral code',
        example: {
          emailType: 'competition',
          to: 'your@email.com',
        },
      },
      {
        type: 'design',
        description: 'Design saved notification',
        example: {
          emailType: 'design',
          to: 'your@email.com',
        },
      },
    ],
    usage: 'POST to this endpoint with emailType and to fields',
  });
}
