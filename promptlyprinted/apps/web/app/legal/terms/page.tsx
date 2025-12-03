import { createMetadata } from '@repo/seo/metadata';
import { FileCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Terms of Service | Promptly Printed',
  description:
    'Read our terms and conditions for using Promptly Printed services, including your rights and responsibilities under UK law.',
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
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <h2>1. Information About Us</h2>
          <p>
            Promptly Printed is a custom printed apparel and accessories business operating in the United Kingdom. 
            These Terms of Service ("Terms") govern your use of our website, services, and products. 
            By using our services, you agree to be bound by these Terms and all applicable UK laws and regulations.
          </p>
          <p>
            If you have any questions about these Terms, please contact us at{' '}
            <a href="mailto:legal@promptlyprinted.com">legal@promptlyprinted.com</a>.
          </p>

          <h2>2. Definitions</h2>
          <ul>
            <li><strong>"We", "Us", "Our"</strong> refers to Promptly Printed</li>
            <li><strong>"You", "Your", "Customer"</strong> refers to the individual or entity using our services</li>
            <li><strong>"Order"</strong> means a request for custom-printed products placed through our website</li>
            <li><strong>"Production"</strong> means the commencement of manufacturing your custom order, which begins 2 hours after order placement</li>
            <li><strong>"Custom Products"</strong> means items personalised with your designs, text, or images</li>
          </ul>

          <h2>3. Acceptance of Terms</h2>
          <p>
            By accessing and using Promptly Printed's services, you acknowledge that you have read, understood, 
            and agree to be bound by these Terms of Service and all applicable UK laws and regulations, including 
            but not limited to the Consumer Rights Act 2015, Consumer Contracts Regulations 2013, and the Data Protection Act 2018.
          </p>
          <p>
            If you do not agree with any of these terms, you must not use our services. 
            Your continued use of our services after any changes to these Terms constitutes acceptance of those changes.
          </p>

          <h2>4. Use of Service</h2>
          <p>
            Our services allow you to design and order custom-printed apparel and accessories. 
            You agree to use these services only for lawful purposes and in accordance with these Terms of Service.
          </p>
          <p>
            You must be at least 18 years old to place an order, or have the consent of a parent or guardian if you are under 18.
          </p>

          <h2>5. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate and complete information. 
            You are responsible for maintaining the security of your account and password. 
            Promptly Printed cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
          </p>
          <p>
            You agree to notify us immediately of any unauthorised use of your account or any other breach of security.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            By uploading designs, images, or content to our platform, you warrant that:
          </p>
          <ul>
            <li>You own the intellectual property rights to the content, or</li>
            <li>You have obtained all necessary permissions and licences to use the content</li>
            <li>The content does not infringe any third-party rights</li>
          </ul>
          <p>
            You retain ownership of your designs but grant us a non-exclusive, royalty-free licence to use, 
            reproduce, and print your designs solely for the purpose of fulfilling your orders.
          </p>
          <p>
            We reserve the right to refuse to print any content that we believe may infringe intellectual property rights 
            or violate our Acceptable Use Policy.
          </p>

          <h2>7. Product Orders</h2>
          <h3>7.1 Order Process</h3>
          <p>
            All orders are subject to acceptance and product availability. We reserve the right to refuse service 
            to anyone for any reason at any time. Prices for products are subject to change without notice, 
            but changes will not affect orders already placed.
          </p>
          
          <h3>7.2 Order Confirmation</h3>
          <p>
            When you place an order, you will receive an email confirmation. This confirmation does not constitute 
            acceptance of your order. We reserve the right to accept or reject your order for any reason, 
            including product availability, errors in pricing, or issues with your payment.
          </p>

          <h3>7.3 Custom Products</h3>
          <p>
            Custom products are made to your specifications and are not suitable for return unless defective 
            (see Section 8). By placing an order for custom products, you acknowledge that these items are 
            personalised and cannot be resold by us.
          </p>

          <h2>8. Cancellation, Returns, and Refunds</h2>
          
          <h3>8.1 Right to Cancel Before Production</h3>
          <p>
            <strong>You have the right to cancel your order and receive a full refund within 2 hours of placing your order.</strong>
          </p>
          <p>
            This 2-hour cancellation window is provided because custom products require immediate production scheduling. 
            After 2 hours from the time your order is placed, your order enters production and cannot be cancelled or refunded, 
            except in cases of defective products or our error (as detailed below).
          </p>
          <p>
            To cancel within the 2-hour window, contact us immediately at{' '}
            <a href="mailto:support@promptlyprinted.com">support@promptlyprinted.com</a> or use the cancellation 
            feature in your order confirmation email or account dashboard.
          </p>

          <h3>8.2 No Cancellation After Production</h3>
          <p>
            <strong>Once your order has entered production (after 2 hours), no cancellations or refunds can be made.</strong>
          </p>
          <p>
            This policy applies because:
          </p>
          <ul>
            <li>Custom products are manufactured specifically for you and cannot be resold</li>
            <li>Production begins immediately after the 2-hour window to ensure timely delivery</li>
            <li>Materials and resources are committed to your order once production commences</li>
          </ul>

          <h3>8.3 Defective Products</h3>
          <p>
            If you receive a product that is defective, damaged, or not as described, you have the right to:
          </p>
          <ul>
            <li>Request a replacement product at no additional cost</li>
            <li>Request a full refund if a replacement is not possible</li>
          </ul>
          <p>
            To report a defective product, contact us within 14 days of delivery at{' '}
            <a href="mailto:support@promptlyprinted.com">support@promptlyprinted.com</a> with your order number, 
            photos of the defect, and a description of the issue.
          </p>

          <h3>8.4 Our Error</h3>
          <p>
            If we make an error (e.g., wrong product, wrong size, wrong design), we will:
          </p>
          <ul>
            <li>Provide a replacement product at no cost to you, or</li>
            <li>Provide a full refund if you prefer</li>
          </ul>
          <p>
            We will also cover the cost of returning the incorrect item if applicable.
          </p>

          <h3>8.5 Refund Processing</h3>
          <p>
            Refunds will be processed to the original payment method within 14 business days of our approval. 
            The time it takes for the refund to appear in your account depends on your payment provider.
          </p>

          <h2>9. Shipping and Delivery</h2>
          <p>
            We will make every effort to deliver products within the estimated timeframes provided at checkout. 
            However, we are not responsible for delays beyond our reasonable control, including but not limited to:
          </p>
          <ul>
            <li>Shipping carrier delays</li>
            <li>Customs processing for international orders</li>
            <li>Weather conditions</li>
            <li>Industrial action</li>
            <li>Force majeure events</li>
          </ul>
          <p>
            Delivery times are estimates only and do not constitute a guarantee. 
            If your order is significantly delayed, we will notify you and work to resolve the issue.
          </p>
          <p>
            Risk in the products passes to you upon delivery. You are responsible for inspecting products upon delivery 
            and reporting any damage or defects immediately.
          </p>

          <h2>10. Pricing and Payment</h2>
          <p>
            All prices are displayed in British Pounds (GBP) and include VAT where applicable. 
            Prices are correct at the time of order but may be subject to change.
          </p>
          <p>
            We accept payment by credit card, debit card, and other payment methods as displayed at checkout. 
            Payment is required in full at the time of order placement.
          </p>
          <p>
            If your payment is declined, we reserve the right to cancel your order. 
            We are not responsible for any fees charged by your payment provider.
          </p>

          <h2>11. Consumer Rights</h2>
          <p>
            Nothing in these Terms affects your statutory rights as a consumer under UK law, including:
          </p>
          <ul>
            <li>Your rights under the Consumer Rights Act 2015</li>
            <li>Your rights under the Consumer Contracts Regulations 2013</li>
            <li>Your right to receive goods that are as described, of satisfactory quality, and fit for purpose</li>
          </ul>
          <p>
            For more information about your consumer rights, visit{' '}
            <a href="https://www.gov.uk/consumer-protection-rights" target="_blank" rel="noopener noreferrer">
              www.gov.uk/consumer-protection-rights
            </a>.
          </p>

          <h2>12. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by UK law, Promptly Printed's liability is limited as follows:
          </p>
          <ul>
            <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages</li>
            <li>Our total liability for any claim shall not exceed the value of the order in question</li>
            <li>We are not liable for any loss of profits, data, or business opportunities</li>
          </ul>
          <p>
            This limitation does not affect your statutory rights as a consumer, including your right to receive 
            goods that are as described, of satisfactory quality, and fit for purpose.
          </p>
          <p>
            We do not exclude or limit our liability for:
          </p>
          <ul>
            <li>Death or personal injury caused by our negligence</li>
            <li>Fraud or fraudulent misrepresentation</li>
            <li>Any other liability that cannot be excluded by law</li>
          </ul>

          <h2>13. Dispute Resolution</h2>
          <p>
            If you have a complaint about our services, please contact us first at{' '}
            <a href="mailto:support@promptlyprinted.com">support@promptlyprinted.com</a>. 
            We will endeavour to resolve any issues promptly and fairly.
          </p>
          <p>
            If we cannot resolve a dispute, you may refer the matter to the European Online Dispute Resolution platform 
            at <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>, 
            or seek alternative dispute resolution through a certified ADR provider.
          </p>
          <p>
            These Terms are governed by English law, and any disputes will be subject to the exclusive jurisdiction 
            of the courts of England and Wales.
          </p>

          <h2>14. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of any material changes 
            by posting the new Terms of Service on this page and updating the "Last updated" date.
          </p>
          <p>
            Material changes will be communicated via email to registered users where appropriate. 
            Your continued use of our services after changes constitutes acceptance of the updated Terms.
          </p>

          <h2>15. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:legal@promptlyprinted.com">legal@promptlyprinted.com</a></li>
            <li><strong>Customer Support:</strong> <a href="mailto:support@promptlyprinted.com">support@promptlyprinted.com</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
