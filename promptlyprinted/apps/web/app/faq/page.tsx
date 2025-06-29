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
          'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay for secure and convenient payment processing.',
      },
      {
        question: 'Can I modify or cancel my order?',
        answer:
          'Orders can be modified or cancelled within 1 hour of placement. Contact our customer support team immediately if you need to make changes to your order.',
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
        question: 'What is your return policy?',
        answer:
          'We accept returns within 30 days of delivery for unused items in original packaging. Custom-designed items can only be returned if defective or damaged during shipping.',
      },
      {
        question: 'How do I initiate a return?',
        answer:
          "Contact our customer support team with your order number to initiate a return. We'll provide a return shipping label and process your refund once we receive the item.",
      },
      {
        question: 'When will I receive my refund?',
        answer:
          'Refunds are processed within 3-5 business days after we receive your return. The funds may take additional time to appear in your account depending on your payment method.',
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
