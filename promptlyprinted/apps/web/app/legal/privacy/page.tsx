import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { Shield } from 'lucide-react';

export const metadata: Metadata = createMetadata({
  title: 'Privacy Policy | Promptly Printed',
  description: 'Learn how Promptly Printed collects, uses, and protects your personal information.',
});

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, including:
          </p>
          <ul>
            <li>Name and contact information</li>
            <li>Billing and shipping addresses</li>
            <li>Payment information</li>
            <li>Order history and preferences</li>
            <li>Account credentials</li>
            <li>Communication preferences</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about orders and services</li>
            <li>Provide customer support</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Improve our products and services</li>
            <li>Detect and prevent fraud</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We do not sell your personal information. We share your information only with:
          </p>
          <ul>
            <li>Service providers who assist in our operations</li>
            <li>Payment processors for secure transactions</li>
            <li>Shipping partners for order delivery</li>
            <li>Law enforcement when required by law</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect
            your personal information against unauthorized access, alteration, disclosure,
            or destruction.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
            <li>Export your data</li>
          </ul>

          <h2>6. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your browsing experience,
            analyze site traffic, and personalize content. You can control cookie
            preferences through your browser settings.
          </p>

          <h2>7. Children's Privacy</h2>
          <p>
            Our services are not directed to children under 13. We do not knowingly
            collect personal information from children under 13. If you believe we
            have collected information from a child under 13, please contact us.
          </p>

          <h2>8. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other
            than your own. We ensure appropriate safeguards are in place for such
            transfers.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you of
            any material changes by posting the new policy on this page and updating
            the "Last updated" date.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our privacy practices,
            please contact our Data Protection Officer at{' '}
            <a href="mailto:privacy@promptlyprinted.com">privacy@promptlyprinted.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
} 