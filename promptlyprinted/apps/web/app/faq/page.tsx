import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/design-system/components/ui/accordion';
import { createMetadata } from '@repo/seo/metadata';
import { HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'FAQ & Help Center | Promptly Printed',
  description:
    'Find answers to frequently asked questions about Promptly Printed products, orders, shipping, and more.',
});

type FAQCategory = {
  title: string;
  questions: Array<{
    question: string;
    answer: string;
  }>;
};

const faqCategories: FAQCategory[] = [
  {
    title: 'Products & Customization',
    questions: [
      {
        question: 'What types of products can I customize?',
        answer:
          "We offer a wide range of customizable products including t-shirts, hoodies, sweatshirts, kids' clothing, phone cases, and more. Each product can be personalized with your own designs or using our AI-powered design tools.",
      },
      {
        question: 'What is the quality of your products?',
        answer:
          'We use high-quality materials and premium printing techniques to ensure your custom designs look great and last long. Our garments are pre-shrunk and made from durable fabrics suitable for regular wear and washing.',
      },
      {
        question: 'Can I use my own designs?',
        answer:
          'Yes! You can upload your own designs or use our AI-powered design tools to create unique artwork. We accept most common image formats (PNG, JPG, SVG) and recommend high-resolution files for best results.',
      },
    ],
  },
  {
    title: 'Ordering & Payment',
    questions: [
      {
        question: 'How do I place an order?',
        answer:
          'Select your desired product, customize it using our design tools, choose your size and quantity, and add to cart. Proceed to checkout where you can review your order, enter shipping details, and complete payment.',
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay for secure and convenient payment processing. All prices are displayed in British Pounds (GBP) and include VAT where applicable.',
      },
      {
        question: 'Can I cancel or modify my order?',
        answer:
          'Yes, but only within 2 hours of placing your order. After 2 hours, your order enters production and cannot be cancelled or refunded. To cancel within the 2-hour window, contact our customer support team immediately or use the cancellation feature in your order confirmation email. Once production begins, we cannot stop the manufacturing process as custom products are made specifically for you and cannot be resold.',
      },
      {
        question: 'Why can\'t I cancel after 2 hours?',
        answer:
          'Custom products require immediate production scheduling to ensure timely delivery. After 2 hours, your order enters our production queue and materials are committed to your specific design. Since these items are personalised and cannot be resold, we cannot offer cancellations or refunds once production has begun. This policy is clearly stated in our Terms of Service and allows us to provide you with high-quality custom products at competitive prices.',
      },
    ],
  },
  {
    title: 'Shipping & Delivery',
    questions: [
      {
        question: 'How long does shipping take?',
        answer:
          'Standard shipping typically takes 5-7 business days within the US. Express shipping options are available for faster delivery. International shipping times vary by location.',
      },
      {
        question: 'Do you ship internationally?',
        answer:
          'Yes, we ship to most countries worldwide. International shipping times and costs vary by location. You can view specific shipping options during checkout.',
      },
      {
        question: 'How can I track my order?',
        answer:
          "Once your order ships, you'll receive a tracking number via email. You can also track your order anytime using our Order Tracking page with your order number and email.",
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    questions: [
      {
        question: 'What is your return and refund policy?',
        answer:
          'You can cancel your order and receive a full refund within 2 hours of placing it. After 2 hours, your order enters production and cannot be cancelled or refunded. Once you receive your order, custom-designed items can only be returned if they are defective, damaged during shipping, or if we made an error (wrong product, size, or design). Standard return policies do not apply to custom products as they are made specifically for you and cannot be resold.',
      },
      {
        question: 'What happens if my order is defective or incorrect?',
        answer:
          'If you receive a product that is defective, damaged, or not as described, contact us within 14 days of delivery. We will provide a replacement at no cost or a full refund if replacement is not possible. If we made an error (wrong product, size, or design), we will also cover the return shipping costs.',
      },
      {
        question: 'How do I request a refund for a defective item?',
        answer:
          "Contact our customer support team at support@promptlyprinted.com with your order number, photos of the defect or error, and a description of the issue. We'll review your request and process a replacement or refund as appropriate. Refunds are processed to your original payment method within 14 business days.",
      },
      {
        question: 'When will I receive my refund?',
        answer:
          'Refunds are processed within 14 business days of our approval. The time it takes for the refund to appear in your account depends on your payment provider, but typically takes 3-5 additional business days after processing.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <HelpCircle className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h1 className="mb-4 font-bold text-4xl tracking-tight">
            FAQ & Help Center
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
            Find answers to common questions about our products, ordering
            process, shipping, and more. Can't find what you're looking for?{' '}
            <a
              href="mailto:support@promptlyprinted.com"
              className="text-primary hover:underline"
            >
              Contact our support team
            </a>
            .
          </p>
        </div>

        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="mb-4 font-semibold text-2xl">{category.title}</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((item, itemIndex) => (
                  <AccordionItem
                    key={itemIndex}
                    value={`${categoryIndex}-${itemIndex}`}
                    className="rounded-lg bg-card px-6"
                  >
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
