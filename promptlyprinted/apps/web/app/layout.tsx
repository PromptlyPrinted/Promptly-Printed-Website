import '@repo/design-system/styles/globals.css';
import './styles/web.css';
import { AuthProvider } from '@repo/auth/provider';
import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import { cn } from '@repo/design-system/lib/utils';
import { Suspense, type ReactNode } from 'react';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { TrackingCapture } from '@/components/tracking/TrackingCapture';
import { CountryProvider } from '@/components/providers/CountryProvider';
import type { Metadata, Viewport } from 'next';

// Global metadata for all pages
export const metadata: Metadata = {
  metadataBase: new URL('https://promptlyprinted.com'),
  title: {
    default: 'Promptly Printed | AI T-Shirt Design Generator',
    template: '%s | Promptly Printed',
  },
  description: 'Design custom AI-generated t-shirts, hoodies & apparel. Type your idea, watch it become wearable art. Premium 280gsm fabric. Global shipping.',
  keywords: ['AI t-shirt design', 'custom t-shirt', 'AI apparel', 'print on demand', 'custom hoodie', 'personalized clothing'],
  authors: [{ name: 'Promptly Printed', url: 'https://promptlyprinted.com' }],
  creator: 'Promptly Printed',
  publisher: 'Promptly Printed',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://promptlyprinted.com',
    siteName: 'Promptly Printed',
    title: 'Promptly Printed | AI T-Shirt Design Generator',
    description: 'Design custom AI-generated t-shirts, hoodies & apparel. Premium quality. Global shipping.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Promptly Printed - AI T-Shirt Design',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@promptlyprinted',
    creator: '@promptlyprinted',
    title: 'Promptly Printed | AI T-Shirt Design',
    description: 'Design custom AI-generated t-shirts & apparel',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  category: 'ecommerce',
};

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html
    lang="en"
    className={cn(fonts, 'scroll-smooth')}
    suppressHydrationWarning
  >
    <head>
      {/* DNS prefetch for external domains */}
      <link rel="dns-prefetch" href="https://assets.basehub.com" />
      <link rel="dns-prefetch" href="https://images.promptlyprinted.com" />

      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Force light mode and prevent dark mode
            (function() {
              // Clear any existing theme preferences
              if (typeof window !== 'undefined') {
                localStorage.removeItem('theme');
                localStorage.removeItem('next-themes');
                localStorage.removeItem('theme-disabled');
              }

              // Remove dark class from HTML element
              document.documentElement.classList.remove('dark');

              // Prevent dark class from being added
              const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                  if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (document.documentElement.classList.contains('dark')) {
                      document.documentElement.classList.remove('dark');
                    }
                  }
                });
              });

              observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class']
              });
            })();
          `,
        }}
      />
    </head>
    <body>
      <AuthProvider>
        <DesignSystemProvider>
          <CountryProvider>
            <Suspense fallback={null}>
              <TrackingCapture />
            </Suspense>
            <Header />
            {/* Your main content */}
            <main>{children}</main>
            <Footer />
          </CountryProvider>
        </DesignSystemProvider>
      </AuthProvider>
    </body>
  </html>
);

export default RootLayout;
