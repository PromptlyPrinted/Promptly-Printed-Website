import { createMetadata } from '@repo/seo/metadata';
import { Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Privacy Policy | Promptly Printed',
  description:
    'Learn how Promptly Printed collects, uses, and protects your personal information in accordance with UK GDPR and Data Protection Act 2018.',
});

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <Shield className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h1 className="mb-4 font-bold text-4xl tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-xl">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Promptly Printed ("we", "us", "our") is committed to protecting your privacy and personal data. 
            This Privacy Policy explains how we collect, use, store, and protect your personal information in 
            accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
          </p>
          <p>
            By using our website and services, you consent to the collection and use of your personal information 
            as described in this Privacy Policy.
          </p>

          <h2>2. Data Controller</h2>
          <p>
            Promptly Printed is the data controller responsible for your personal data. 
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:privacy@promptlyprinted.com">privacy@promptlyprinted.com</a></li>
            <li><strong>Data Protection Officer:</strong> <a href="mailto:dpo@promptlyprinted.com">dpo@promptlyprinted.com</a></li>
          </ul>

          <h2>3. Information We Collect</h2>
          <p>We collect the following categories of personal information:</p>
          
          <h3>3.1 Information You Provide Directly</h3>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, password, phone number</li>
            <li><strong>Order Information:</strong> Billing and shipping addresses, payment details, order history</li>
            <li><strong>Design Content:</strong> Images, designs, and text you upload for custom products</li>
            <li><strong>Communication:</strong> Messages, feedback, and correspondence with our support team</li>
            <li><strong>Marketing Preferences:</strong> Your preferences for receiving marketing communications</li>
          </ul>

          <h3>3.2 Information We Collect Automatically</h3>
          <ul>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent on pages, click patterns, search queries</li>
            <li><strong>Location Data:</strong> Country and region (derived from IP address) for currency and shipping purposes</li>
            <li><strong>Cookies and Tracking:</strong> See Section 7 for details</li>
          </ul>

          <h3>3.3 Information from Third Parties</h3>
          <ul>
            <li><strong>Payment Processors:</strong> Transaction details and payment confirmation</li>
            <li><strong>Shipping Partners:</strong> Delivery status and tracking information</li>
            <li><strong>Social Media:</strong> If you connect your social media accounts (with your permission)</li>
          </ul>

          <h2>4. How We Use Your Information</h2>
          <p>We use your personal information for the following purposes:</p>
          
          <h3>4.1 Contract Performance (Legal Basis: Contract)</h3>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Create and print your custom designs</li>
            <li>Arrange shipping and delivery</li>
            <li>Process payments and manage your account</li>
            <li>Communicate with you about your orders</li>
          </ul>

          <h3>4.2 Legal Obligations (Legal Basis: Legal Obligation)</h3>
          <ul>
            <li>Comply with tax and accounting requirements</li>
            <li>Comply with consumer protection laws</li>
            <li>Respond to legal requests and court orders</li>
            <li>Prevent fraud and money laundering</li>
          </ul>

          <h3>4.3 Legitimate Interests (Legal Basis: Legitimate Interest)</h3>
          <ul>
            <li>Improve our products and services</li>
            <li>Analyse website usage and user behaviour</li>
            <li>Detect and prevent fraud and security threats</li>
            <li>Provide customer support</li>
            <li>Conduct business analytics and research</li>
          </ul>

          <h3>4.4 Consent (Legal Basis: Consent)</h3>
          <ul>
            <li>Send marketing communications (where you have opted in)</li>
            <li>Use cookies for analytics and advertising (where consent is required)</li>
            <li>Share data with third parties for marketing (where you have consented)</li>
          </ul>

          <h2>5. Information Sharing</h2>
          <p>
            We do not sell your personal information. We share your information only in the following circumstances:
          </p>

          <h3>5.1 Service Providers</h3>
          <p>We share information with trusted service providers who assist in our operations:</p>
          <ul>
            <li><strong>Payment Processors:</strong> To process payments securely (e.g., Square, Stripe)</li>
            <li><strong>Printing Partners:</strong> To manufacture and fulfill your orders (e.g., Prodigi)</li>
            <li><strong>Shipping Companies:</strong> To deliver your orders (e.g., Royal Mail, DHL, FedEx)</li>
            <li><strong>Cloud Storage Providers:</strong> To store your data securely</li>
            <li><strong>Email Service Providers:</strong> To send order confirmations and communications</li>
            <li><strong>Analytics Providers:</strong> To understand how our website is used</li>
          </ul>
          <p>
            All service providers are contractually obligated to protect your data and use it only for the purposes we specify.
          </p>

          <h3>5.2 Legal Requirements</h3>
          <p>We may disclose your information if required by law or to:</p>
          <ul>
            <li>Comply with legal obligations or court orders</li>
            <li>Respond to government requests</li>
            <li>Protect our rights, property, or safety</li>
            <li>Prevent fraud or security threats</li>
          </ul>

          <h3>5.3 Business Transfers</h3>
          <p>
            If we merge, are acquired, or sell assets, your information may be transferred to the new entity, 
            subject to the same privacy protections.
          </p>

          <h2>6. Data Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect your personal information 
            against unauthorised access, alteration, disclosure, or destruction, including:
          </p>
          <ul>
            <li>Encryption of data in transit (SSL/TLS) and at rest</li>
            <li>Secure payment processing through PCI-DSS compliant providers</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication</li>
            <li>Staff training on data protection</li>
            <li>Regular backups and disaster recovery procedures</li>
          </ul>
          <p>
            However, no method of transmission over the internet or electronic storage is 100% secure. 
            While we strive to protect your data, we cannot guarantee absolute security.
          </p>

          <h2>7. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar technologies to enhance your browsing experience, analyse site traffic, 
            and personalise content. For detailed information about our cookie practices, please see our{' '}
            <a href="/legal/acceptable-use">Cookie Policy</a>.
          </p>
          <p>
            You can control cookie preferences through your browser settings. Note that disabling cookies 
            may affect the functionality of our website.
          </p>

          <h2>8. Your Rights Under UK GDPR</h2>
          <p>Under UK GDPR and the Data Protection Act 2018, you have the following rights:</p>

          <h3>8.1 Right of Access</h3>
          <p>
            You have the right to request a copy of the personal information we hold about you. 
            This is commonly known as a "data subject access request".
          </p>

          <h3>8.2 Right to Rectification</h3>
          <p>
            You have the right to request correction of inaccurate or incomplete personal information.
          </p>

          <h3>8.3 Right to Erasure ("Right to be Forgotten")</h3>
          <p>
            You have the right to request deletion of your personal information in certain circumstances, 
            such as when it is no longer necessary for the original purpose or you withdraw consent.
          </p>
          <p>
            <strong>Note:</strong> We may retain certain information for legal or legitimate business purposes, 
            such as order records for tax and accounting compliance.
          </p>

          <h3>8.4 Right to Restrict Processing</h3>
          <p>
            You have the right to request that we limit how we use your personal information in certain circumstances.
          </p>

          <h3>8.5 Right to Data Portability</h3>
          <p>
            You have the right to receive your personal information in a structured, commonly used, 
            and machine-readable format and to transmit it to another controller.
          </p>

          <h3>8.6 Right to Object</h3>
          <p>
            You have the right to object to processing of your personal information for direct marketing purposes 
            or based on legitimate interests.
          </p>

          <h3>8.7 Rights Related to Automated Decision-Making</h3>
          <p>
            You have the right not to be subject to decisions based solely on automated processing, 
            including profiling, that produces legal or similarly significant effects.
          </p>

          <h3>8.8 How to Exercise Your Rights</h3>
          <p>
            To exercise any of these rights, please contact us at{' '}
            <a href="mailto:privacy@promptlyprinted.com">privacy@promptlyprinted.com</a> with:
          </p>
          <ul>
            <li>Your name and email address</li>
            <li>Details of your request</li>
            <li>Proof of identity (to verify your request)</li>
          </ul>
          <p>
            We will respond to your request within one month. If your request is complex, we may extend 
            this period by up to two additional months, and we will inform you of the extension.
          </p>

          <h2>9. Data Retention</h2>
          <p>We retain your personal information for as long as necessary to:</p>
          <ul>
            <li>Fulfill the purposes for which it was collected</li>
            <li>Comply with legal obligations (e.g., tax records must be kept for 7 years)</li>
            <li>Resolve disputes and enforce agreements</li>
            <li>Protect our legitimate business interests</li>
          </ul>
          <p>
            When personal information is no longer needed, we will securely delete or anonymise it.
          </p>

          <h2>10. International Data Transfers</h2>
          <p>
            Some of our service providers are located outside the UK and European Economic Area (EEA). 
            When we transfer your personal information to these countries, we ensure appropriate safeguards 
            are in place, such as:
          </p>
          <ul>
            <li>Standard Contractual Clauses approved by the UK Information Commissioner's Office (ICO)</li>
            <li>Adequacy decisions recognising equivalent data protection standards</li>
            <li>Other legally recognised transfer mechanisms</li>
          </ul>

          <h2>11. Children's Privacy</h2>
          <p>
            Our services are not directed to children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If you are a parent or guardian and believe your 
            child has provided us with personal information, please contact us immediately, and we will 
            delete such information.
          </p>
          <p>
            If you are between 13 and 18 years old, you must have your parent's or guardian's permission 
            to use our services.
          </p>

          <h2>12. Marketing Communications</h2>
          <p>
            We may send you marketing communications if you have opted in to receive them. 
            You can opt out at any time by:
          </p>
          <ul>
            <li>Clicking the "unsubscribe" link in any marketing email</li>
            <li>Updating your preferences in your account settings</li>
            <li>Contacting us at <a href="mailto:support@promptlyprinted.com">support@promptlyprinted.com</a></li>
          </ul>
          <p>
            Even if you opt out of marketing, we may still send you transactional emails related to your orders 
            and account (e.g., order confirmations, shipping updates).
          </p>

          <h2>13. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. 
            We will notify you of any material changes by:
          </p>
          <ul>
            <li>Posting the new Privacy Policy on this page</li>
            <li>Updating the "Last updated" date</li>
            <li>Sending an email notification to registered users (for significant changes)</li>
          </ul>
          <p>
            Your continued use of our services after changes constitutes acceptance of the updated Privacy Policy.
          </p>

          <h2>14. Complaints</h2>
          <p>
            If you have concerns about how we handle your personal information, please contact us first at{' '}
            <a href="mailto:privacy@promptlyprinted.com">privacy@promptlyprinted.com</a>. 
            We will work to resolve any issues promptly.
          </p>
          <p>
            You also have the right to lodge a complaint with the UK Information Commissioner's Office (ICO) 
            if you believe we have not addressed your concerns adequately:
          </p>
          <ul>
            <li><strong>Website:</strong> <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a></li>
            <li><strong>Phone:</strong> 0303 123 1113</li>
            <li><strong>Address:</strong> Information Commissioner's Office, Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF</li>
          </ul>

          <h2>15. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul>
            <li><strong>Data Protection Officer:</strong> <a href="mailto:dpo@promptlyprinted.com">dpo@promptlyprinted.com</a></li>
            <li><strong>Privacy Inquiries:</strong> <a href="mailto:privacy@promptlyprinted.com">privacy@promptlyprinted.com</a></li>
            <li><strong>General Support:</strong> <a href="mailto:support@promptlyprinted.com">support@promptlyprinted.com</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
