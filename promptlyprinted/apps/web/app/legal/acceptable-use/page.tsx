import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { AlertCircle } from 'lucide-react';

export const metadata: Metadata = createMetadata({
  title: 'Acceptable Use Policy | Promptly Printed',
  description: 'Guidelines for acceptable use of Promptly Printed services and content restrictions.',
});

export default function AcceptableUsePage() {
  return (
    <div className="container mx-auto py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight mb-4">Acceptable Use Policy</h1>
          <p className="text-xl text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <h2>1. Purpose</h2>
          <p>
            This Acceptable Use Policy outlines the guidelines for using Promptly Printed's
            services and the types of content that may not be printed or distributed through
            our platform.
          </p>

          <h2>2. Prohibited Content</h2>
          <p>
            The following types of content are prohibited:
          </p>
          <ul>
            <li>Hate speech or discriminatory content</li>
            <li>Explicit adult content or nudity</li>
            <li>Violence or graphic content</li>
            <li>Content that promotes illegal activities</li>
            <li>Copyrighted material without proper authorization</li>
            <li>Trademarked content without permission</li>
            <li>Malicious or harmful content</li>
            <li>False or misleading information</li>
          </ul>

          <h2>3. Design Guidelines</h2>
          <p>
            All designs submitted for printing must:
          </p>
          <ul>
            <li>Be original or properly licensed</li>
            <li>Meet our quality standards for printing</li>
            <li>Not infringe on intellectual property rights</li>
            <li>Be appropriate for public display</li>
            <li>Comply with local and international laws</li>
          </ul>

          <h2>4. User Conduct</h2>
          <p>
            Users of our service must:
          </p>
          <ul>
            <li>Provide accurate information when placing orders</li>
            <li>Not attempt to circumvent our content review process</li>
            <li>Not use our service for spam or harassment</li>
            <li>Respect the privacy and rights of others</li>
            <li>Not engage in fraudulent activities</li>
          </ul>

          <h2>5. Content Review</h2>
          <p>
            We reserve the right to:
          </p>
          <ul>
            <li>Review all submitted designs before printing</li>
            <li>Reject any order that violates this policy</li>
            <li>Report illegal content to appropriate authorities</li>
            <li>Suspend or terminate accounts for policy violations</li>
          </ul>

          <h2>6. Intellectual Property</h2>
          <p>
            Users must respect intellectual property rights and:
          </p>
          <ul>
            <li>Only upload content they own or have permission to use</li>
            <li>Not infringe on copyrights, trademarks, or patents</li>
            <li>Provide proof of licensing when requested</li>
            <li>Accept responsibility for intellectual property disputes</li>
          </ul>

          <h2>7. Enforcement</h2>
          <p>
            Violations of this policy may result in:
          </p>
          <ul>
            <li>Immediate rejection of orders</li>
            <li>Account suspension or termination</li>
            <li>Forfeiture of payments for violating orders</li>
            <li>Legal action when necessary</li>
          </ul>

          <h2>8. Reporting Violations</h2>
          <p>
            If you encounter content that violates this policy, please report it to{' '}
            <a href="mailto:abuse@promptlyprinted.com">abuse@promptlyprinted.com</a>.
            Include relevant details and order numbers if applicable.
          </p>

          <h2>9. Policy Updates</h2>
          <p>
            We may update this policy at any time. Continued use of our services
            after changes constitutes acceptance of the updated policy.
          </p>

          <h2>10. Questions</h2>
          <p>
            For questions about this policy, contact us at{' '}
            <a href="mailto:legal@promptlyprinted.com">legal@promptlyprinted.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
} 