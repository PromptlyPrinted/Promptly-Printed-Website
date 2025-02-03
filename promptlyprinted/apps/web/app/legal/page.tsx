import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { FileCheck, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = createMetadata({
  title: 'Legal Information | Promptly Printed',
  description: 'View our terms of service, privacy policy, and other legal documents.',
});

const legalDocuments = [
  {
    title: 'Terms of Service',
    description: 'Our terms and conditions for using Promptly Printed services, including your rights and responsibilities.',
    href: '/legal/terms',
    icon: FileCheck,
    updatedAt: new Date().toLocaleDateString(),
  },
  {
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information when you use our services.',
    href: '/legal/privacy',
    icon: Shield,
    updatedAt: new Date().toLocaleDateString(),
  },
  {
    title: 'Acceptable Use Policy',
    description: 'Guidelines for acceptable use of our services and content restrictions.',
    href: '/legal/acceptable-use',
    icon: AlertCircle,
    updatedAt: new Date().toLocaleDateString(),
  },
];

export default function LegalPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <FileCheck className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight mb-4">Legal Information</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Review our legal documents to understand your rights, our policies,
            and how we protect your information.
          </p>
        </div>

        <div className="grid gap-8">
          {legalDocuments.map((doc) => {
            const Icon = doc.icon;
            return (
              <Link
                key={doc.href}
                href={doc.href}
                className="group block bg-card hover:shadow-lg transition-shadow rounded-lg p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {doc.title}
                      </h2>
                      <span className="text-sm text-muted-foreground">
                        • Updated {doc.updatedAt}
                      </span>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      {doc.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 bg-muted rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Need Legal Assistance?</h2>
          <p className="text-muted-foreground mb-4">
            If you have any questions about our legal documents or need clarification,
            please contact our legal team.
          </p>
          <a
            href="mailto:legal@promptlyprinted.com"
            className="text-primary hover:underline"
          >
            legal@promptlyprinted.com
          </a>
        </div>
      </div>
    </div>
  );
} 