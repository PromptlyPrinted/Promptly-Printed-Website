import { createMetadata } from '@repo/seo/metadata';
import { FileCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Terms of Service | Promptly Printed',
  description:
    'Read our terms of service and legal agreements for using Promptly Printed.',
});

export default function TermsPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <FileCheck className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h1 className="mb-4 font-bold text-4xl tracking-tight">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-xl">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Promptly Printed's services, you agree to be
            bound by these Terms of Service and all applicable laws and
            regulations. If you do not agree with any of these terms, you are
            prohibited from using our services.
          </p>

          <h2>2. Use of Service</h2>
          <p>
            Our services allow you to design and order custom-printed apparel
            and accessories. You agree to use these services only for lawful
            purposes and in accordance with these Terms of Service.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate and
            complete information. You are responsible for maintaining the
            security of your account and password. Promptly Printed cannot and
            will not be liable for any loss or damage from your failure to
            comply with this security obligation.
          </p>

          <h2>4. Intellectual Property</h2>
          <p>
            By uploading designs or content to our platform, you retain your
            intellectual property rights but grant us a license to use,
            reproduce, and print your designs for the purpose of fulfilling your
            orders.
          </p>

          <h2>5. Product Orders</h2>
          <p>
            All orders are subject to acceptance and availability. We reserve
            the right to refuse service to anyone for any reason at any time.
            Prices for products are subject to change without notice.
          </p>

          <h2>6. Shipping and Delivery</h2>
          <p>
            We will make every effort to deliver products within the estimated
            timeframes. However, we are not responsible for delays beyond our
            control, such as shipping carrier delays or customs processing for
            international orders.
          </p>

          <h2>7. Returns and Refunds</h2>
          <p>
            Our return policy allows returns within 30 days of delivery for
            unused items in original packaging. Custom-designed items can only
            be returned if defective or damaged during shipping.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            Promptly Printed shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages resulting from your use
            of our services.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will
            notify users of any material changes by posting the new Terms of
            Service on this page.
          </p>

          <h2>10. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please
            contact us at{' '}
            <a href="mailto:legal@promptlyprinted.com">
              legal@promptlyprinted.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
