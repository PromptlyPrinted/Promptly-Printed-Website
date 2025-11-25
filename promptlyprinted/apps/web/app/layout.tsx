import '@repo/design-system/styles/globals.css';
import './styles/web.css';
import { AuthProvider } from '@repo/auth/provider';
import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import { cn } from '@repo/design-system/lib/utils';
import type { ReactNode } from 'react';
import { Footer } from './components/footer';
import { Header } from './components/header';

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
      {/* Preconnect to external domains for faster resource loading */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://assets.basehub.com" />

      {/* Preload critical resources */}
      <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />

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
          <Header />
          {/* Your main content */}
          <main>{children}</main>
          <Footer />
        </DesignSystemProvider>
      </AuthProvider>
    </body>
  </html>
);

export default RootLayout;
