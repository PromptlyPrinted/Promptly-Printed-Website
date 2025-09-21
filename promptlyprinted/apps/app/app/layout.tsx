import '@repo/design-system/styles/globals.css';
import { AuthProvider } from '@repo/auth/provider';
import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import type { ReactNode } from 'react';

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html lang="en" className={fonts} suppressHydrationWarning>
    <head>
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
        <DesignSystemProvider>{children}</DesignSystemProvider>
      </AuthProvider>
    </body>
  </html>
);

export default RootLayout;
