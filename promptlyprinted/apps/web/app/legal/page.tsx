import { createMetadata } from '@repo/seo/metadata';
import { AlertCircle, FileCheck, Shield } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = createMetadata({
  title: 'Legal Information | Promptly Printed',
  description:
    'View our terms of service, privacy policy, and other legal documents.',
});

const legalDocuments = [
  {
    title: 'Terms of Service',
    description:
      'Our terms and conditions for using Promptly Printed services, including your rights and responsibilities.',
    href: '/legal/terms',
    icon: FileCheck,
    updatedAt: new Date().toLocaleDateString(),
  },
  {
    title: 'Privacy Policy',
    description:
      'How we collect, use, and protect your personal information when you use our services.',
    href: '/legal/privacy',
    icon: Shield,
    updatedAt: new Date().toLocaleDateString(),
  },
  {
    title: 'Acceptable Use Policy',
    description:
      'Guidelines for acceptable use of our services and content restrictions.',
    href: '/legal/acceptable-use',
    icon: AlertCircle,
    updatedAt: new Date().toLocaleDateString(),
  },
];

export default function LegalPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <FileCheck className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h1 className="mb-4 font-bold text-4xl tracking-tight">
            Legal Information
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
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
                className="group block rounded-lg bg-card p-6 transition-shadow hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-xl transition-colors group-hover:text-primary">
                        {doc.title}
                      </h2>
                      <span className="text-muted-foreground text-sm">
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

        <div className="mt-12 rounded-lg bg-muted p-6">
          <h2 className="mb-2 font-semibold text-lg">Need Legal Assistance?</h2>
          <p className="mb-4 text-muted-foreground">
            If you have any questions about our legal documents or need
            clarification, please contact our legal team.
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
