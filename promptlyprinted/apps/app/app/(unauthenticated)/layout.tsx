import { env } from '@repo/env';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import PromptlyLogo from '@/public/PromptlyLogo.svg';

const COLORS = {
  navy: '#0D2C45',
  teal: '#16C1A8',
  orange: '#FF8A26',
  white: '#FFFFFF',
};

type AuthLayoutProps = {
  readonly children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="container relative grid h-dvh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
    <div
      className="relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r"
      style={{
        background: `linear-gradient(135deg, ${COLORS.navy} 12%, ${COLORS.navy} 40%, ${COLORS.teal} 120%)`,
      }}
    >
      {/* Orange accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: COLORS.orange }} />

      <div className="relative z-20 flex items-center justify-center">
        <Image
          src={PromptlyLogo}
          alt="Promptly Printed logo"
          width={200}
          height={200}
          className="h-32 w-32"
        />
      </div>
      <div className="relative z-20 mt-auto">
        <blockquote className="space-y-2">
          <p className="text-lg">
            &ldquo;Promptly Printed has transformed the way we create custom apparel.
            Fast, reliable, and stunning quality every time.&rdquo;
          </p>
          <footer className="text-sm">— Happy Customer</footer>
        </blockquote>
      </div>
    </div>
    <div className="lg:p-8">
      <div className="mx-auto flex w-full max-w-[400px] flex-col justify-center space-y-6">
        {children}
        <p className="px-8 text-center text-muted-foreground text-sm">
          By clicking continue, you agree to our{' '}
          <Link
            href={new URL('/legal/terms', env.NEXT_PUBLIC_WEB_URL).toString()}
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href={new URL('/legal/privacy', env.NEXT_PUBLIC_WEB_URL).toString()}
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  </div>
);

export default AuthLayout;
