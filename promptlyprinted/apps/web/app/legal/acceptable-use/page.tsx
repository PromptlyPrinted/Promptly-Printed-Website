import { createMetadata } from '@repo/seo/metadata';
import { AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Acceptable Use Policy | Promptly Printed',
  description:
    'Guidelines for acceptable use of Promptly Printed services and content restrictions in accordance with UK law.',
});

export default function AcceptableUsePage() {
  return (
    <div className="container mx-auto py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <AlertCircle className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h1 className="mb-4 font-bold text-4xl tracking-tight">
            Acceptable Use Policy
          </h1>
          <p className="text-muted-foreground text-xl">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <h2>1. Purpose</h2>
          <p>
            This Acceptable Use Policy ("Policy") outlines the guidelines for using Promptly Printed's services 
            and the types of content that may not be printed or distributed through our platform. 
            This Policy is designed to comply with UK law and protect both our customers and our business.
          </p>
          <p>
            By using our services, you agree to comply with this Policy. Violations may result in order rejection, 
            account suspension, or legal action.
          </p>

          <h2>2. Prohibited Content</h2>
          <p>
            The following types of content are strictly prohibited and will result in immediate order rejection:
          </p>

          <h3>2.1 Illegal Content</h3>
          <ul>
            <li>Content that promotes or incites illegal activities</li>
            <li>Content that violates UK criminal law (e.g., terrorism, drug dealing, fraud)</li>
            <li>Content that violates intellectual property rights (copyright, trademark, patent infringement)</li>
            <li>Counterfeit goods or content that mimics official products without authorisation</li>
          </ul>

          <h3>2.2 Harmful or Offensive Content</h3>
          <ul>
            <li>Hate speech, discrimination, or content targeting protected characteristics under the Equality Act 2010</li>
            <li>Content that promotes violence, self-harm, or harm to others</li>
            <li>Explicit sexual content, pornography, or sexually explicit material</li>
            <li>Graphic violence or disturbing imagery</li>
            <li>Content that harasses, bullies, or threatens individuals</li>
          </ul>

          <h3>2.3 Misleading or Fraudulent Content</h3>
          <ul>
            <li>False or misleading information</li>
            <li>Content that impersonates individuals, companies, or organisations</li>
            <li>Content designed to deceive or defraud</li>
            <li>Misleading health or medical claims</li>
          </ul>

          <h3>2.4 Intellectual Property Violations</h3>
          <ul>
            <li>Copyrighted material without proper authorisation or licensing</li>
            <li>Trademarked logos, names, or designs without permission</li>
            <li>Patented designs or processes without authorisation</li>
            <li>Content that infringes on celebrity rights of publicity</li>
          </ul>

          <h3>2.5 Restricted Content</h3>
          <ul>
            <li>Content related to regulated products (e.g., tobacco, alcohol, pharmaceuticals) without proper authorisation</li>
            <li>Content that violates advertising standards (e.g., ASA guidelines)</li>
            <li>Political content that may violate electoral law</li>
            <li>Content that may violate data protection laws (e.g., displaying personal data without consent)</li>
          </ul>

          <h2>3. Design Guidelines</h2>
          <p>All designs submitted for printing must comply with the following requirements:</p>

          <h3>3.1 Ownership and Licensing</h3>
          <ul>
            <li>You must own the intellectual property rights to the design, or</li>
            <li>You must have obtained all necessary permissions, licences, and authorisations to use the design</li>
            <li>You must be able to provide proof of licensing upon request</li>
            <li>You accept full responsibility for any intellectual property disputes</li>
          </ul>

          <h3>3.2 Quality Standards</h3>
          <ul>
            <li>Designs must meet our minimum resolution and quality requirements for printing</li>
            <li>Text must be legible and appropriately sized</li>
            <li>Images must be clear and suitable for the intended product</li>
            <li>Designs must be appropriate for the product type and intended use</li>
          </ul>

          <h3>3.3 Legal Compliance</h3>
          <ul>
            <li>Designs must comply with all applicable UK laws and regulations</li>
            <li>Designs must not violate advertising standards (ASA, CAP Code)</li>
            <li>Designs must respect consumer protection laws</li>
            <li>Designs must not contain false or misleading claims</li>
          </ul>

          <h2>4. User Conduct</h2>
          <p>Users of our service must:</p>
          <ul>
            <li>Provide accurate and truthful information when placing orders</li>
            <li>Not attempt to circumvent our content review process</li>
            <li>Not use our service for spam, harassment, or abusive purposes</li>
            <li>Respect the privacy and rights of others</li>
            <li>Not engage in fraudulent activities, including chargebacks for legitimate orders</li>
            <li>Not use automated systems to place orders without authorisation</li>
            <li>Not attempt to reverse engineer or interfere with our systems</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>

          <h2>5. Content Review Process</h2>
          <p>
            We reserve the right to review all submitted designs before printing. Our review process includes:
          </p>
          <ul>
            <li>Automated screening for prohibited content</li>
            <li>Manual review by our team for questionable content</li>
            <li>Verification of intellectual property rights where necessary</li>
            <li>Compliance checks with UK law and advertising standards</li>
          </ul>
          <p>
            We may reject any order that violates this Policy, even if payment has been processed. 
            In such cases, we will provide a full refund (subject to our cancellation policy).
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            Users must respect intellectual property rights and understand that:
          </p>
          <ul>
            <li>You are solely responsible for ensuring you have the right to use any content in your designs</li>
            <li>We are not responsible for verifying intellectual property rights, but we may refuse orders if infringement is suspected</li>
            <li>If you use third-party content, you must have proper licensing or permission</li>
            <li>We may request proof of licensing or ownership at any time</li>
            <li>You will indemnify us against any claims arising from intellectual property infringement</li>
          </ul>
          <p>
            <strong>Fair Use:</strong> Fair use or fair dealing exceptions under UK copyright law may apply in limited circumstances, 
            but you are responsible for ensuring your use qualifies. When in doubt, obtain proper licensing.
          </p>

          <h2>7. Enforcement</h2>
          <p>Violations of this Policy may result in:</p>
          <ul>
            <li><strong>Immediate Rejection:</strong> Orders containing prohibited content will be rejected immediately</li>
            <li><strong>Account Suspension:</strong> Repeated violations may result in temporary or permanent account suspension</li>
            <li><strong>Refund Policy:</strong> Orders rejected for policy violations will be refunded (subject to our cancellation policy)</li>
            <li><strong>Legal Action:</strong> Serious violations may result in reporting to law enforcement or legal action</li>
            <li><strong>Blacklisting:</strong> Users who repeatedly violate this Policy may be permanently banned from our services</li>
          </ul>
          <p>
            We reserve the right to take any action we deem necessary to protect our business, customers, and comply with the law.
          </p>

          <h2>8. Reporting Violations</h2>
          <p>
            If you encounter content that violates this Policy, please report it immediately to{' '}
            <a href="mailto:abuse@promptlyprinted.com">abuse@promptlyprinted.com</a>. 
            Please include:
          </p>
          <ul>
            <li>Description of the violation</li>
            <li>Order number or account information (if applicable)</li>
            <li>Relevant screenshots or evidence</li>
            <li>Your contact information (for follow-up if needed)</li>
          </ul>
          <p>
            We take all reports seriously and will investigate promptly. We may not be able to provide updates 
            on investigations due to privacy and legal considerations.
          </p>

          <h2>9. Age Restrictions</h2>
          <p>
            Our services are intended for users aged 18 and over. Users under 18 must have parental or guardian consent. 
            We reserve the right to verify age and refuse service to minors without proper consent.
          </p>
          <p>
            Content that may be inappropriate for minors will be rejected, regardless of the user's age.
          </p>

          <h2>10. Commercial Use</h2>
          <p>
            If you plan to resell products printed through our service, you must:
          </p>
          <ul>
            <li>Ensure all designs comply with this Policy</li>
            <li>Obtain all necessary business licences and registrations</li>
            <li>Comply with consumer protection laws and trading standards</li>
            <li>Ensure products meet safety and labelling requirements</li>
            <li>Not make false claims about products or services</li>
          </ul>
          <p>
            We are not responsible for your compliance with business regulations or consumer protection laws 
            when you resell our products.
          </p>

          <h2>11. UK-Specific Legal Considerations</h2>
          <p>This Policy is designed to comply with UK law, including:</p>
          <ul>
            <li><strong>Equality Act 2010:</strong> Prohibits discrimination and hate speech</li>
            <li><strong>Copyright, Designs and Patents Act 1988:</strong> Protects intellectual property</li>
            <li><strong>Trade Marks Act 1994:</strong> Protects registered trademarks</li>
            <li><strong>Consumer Protection from Unfair Trading Regulations 2008:</strong> Prohibits misleading practices</li>
            <li><strong>Advertising Standards Authority (ASA) Codes:</strong> Regulates advertising content</li>
            <li><strong>Data Protection Act 2018:</strong> Protects personal data</li>
            <li><strong>Malicious Communications Act 1988:</strong> Prohibits harmful communications</li>
          </ul>

          <h2>12. Policy Updates</h2>
          <p>
            We may update this Policy at any time to reflect changes in law, our services, or business practices. 
            We will notify users of material changes by:
          </p>
          <ul>
            <li>Posting the updated Policy on this page</li>
            <li>Updating the "Last updated" date</li>
            <li>Sending email notifications to registered users (for significant changes)</li>
          </ul>
          <p>
            Your continued use of our services after changes constitutes acceptance of the updated Policy.
          </p>

          <h2>13. Questions and Contact</h2>
          <p>
            If you have questions about this Acceptable Use Policy or need clarification on whether specific content is allowed, 
            please contact us before placing your order:
          </p>
          <ul>
            <li><strong>General Inquiries:</strong> <a href="mailto:support@promptlyprinted.com">support@promptlyprinted.com</a></li>
            <li><strong>Content Questions:</strong> <a href="mailto:content@promptlyprinted.com">content@promptlyprinted.com</a></li>
            <li><strong>Legal/Policy:</strong> <a href="mailto:legal@promptlyprinted.com">legal@promptlyprinted.com</a></li>
            <li><strong>Report Violations:</strong> <a href="mailto:abuse@promptlyprinted.com">abuse@promptlyprinted.com</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
