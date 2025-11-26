'use client';

import { env } from '@repo/env';
import Image from 'next/image';
import Link from 'next/link';
import PromptlyLogo from './footer/PromptlyLogo.svg';
import { Facebook, Instagram, Twitter, Youtube, Mail, ShieldCheck, Globe, CreditCard } from 'lucide-react';

const COLORS = {
  navy: '#0D2C45',
  teal: '#16C1A8',
  orange: '#FF8A26',
  white: '#FFFFFF',
};

export const Footer = () => {
  const navigationItems = [
    { title: 'Home', href: '/', description: '' },
    {
      title: 'Pages',
      description: 'Managing a small business today is already tough.',
      items: [{ title: 'Blog', href: '/blog' }],
    },
    {
      title: 'Legal',
      description: 'We stay on top of the latest legal requirements.',
      items: [
        { title: 'Terms of Service', href: '/legal/terms' },
        { title: 'Privacy Policy', href: '/legal/privacy' },
        { title: 'Acceptable Use', href: '/legal/acceptable-use' },
      ],
    },
  ];

  if (env.NEXT_PUBLIC_DOCS_URL) {
    navigationItems.at(1)?.items?.push({
      title: 'Docs',
      href: env.NEXT_PUBLIC_DOCS_URL,
    });
  }

  return (
    <section className="border-t" style={{ borderColor: 'rgba(13,44,69,0.15)' }}>
      {/* Orange separator line */}
      <div className="h-[3px] w-full" style={{ backgroundColor: COLORS.orange }} />

      {/* Footer background */}
      <div
        className="w-full bg-center bg-cover text-white"
        style={{
          background: `linear-gradient(135deg, ${COLORS.navy} 12%, ${COLORS.navy} 40%, ${COLORS.teal} 120%)`,
        }}
      >
        {/* Optional faint brand strokes */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          {/* (Add an SVG watermark here if you like) */}
        </div>

        <div className="container mx-auto px-6 py-16 lg:py-24 relative">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            {/* Brand + value + status */}
            <div className="flex flex-col items-start gap-6">
              <div className="flex flex-col gap-3">
                <Image
                  src={PromptlyLogo}
                  alt="Promptly Printed logo"
                  width={256}
                  height={256}
                  className="h-80 w-80"
                />
                <p className="max-w-lg text-left text-white/80 text-lg leading-relaxed tracking-tight">
                  Creativity Promptly Delivered.
                </p>
              </div>

              {/* Newsletter */}
              <form
                onSubmit={(e) => e.preventDefault()}
                className="w-full max-w-lg"
                aria-label="Subscribe to newsletter"
              >
                <label htmlFor="footer-email" className="sr-only">Email</label>
                <div className="flex rounded-2xl overflow-hidden ring-1 ring-white/15 shadow-lg">
                  <div className="flex items-center gap-2 px-3 bg-white/10">
                    <Mail className="w-4 h-4" aria-hidden />
                    <span className="text-white/80 text-xs">Product drops & tips</span>
                  </div>
                  <input
                    id="footer-email"
                    type="email"
                    placeholder="you@domain.com"
                    className="flex-1 bg-transparent px-4 py-3 text-sm placeholder:text-white/60 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 text-sm font-semibold bg-white text-gray-900 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ outlineColor: COLORS.teal }}
                  >
                    Subscribe
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-white/60">No spam. Unsubscribe anytime.</p>
              </form>

            </div>

            {/* Navigation columns */}
            <div className="grid items-start gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {navigationItems.map((item) => (
                <div key={item.title} className="flex flex-col items-start gap-2 text-base">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-xl font-semibold"
                      style={{ color: COLORS.orange }}
                      target={item.href.includes('http') ? '_blank' : undefined}
                      rel={item.href.includes('http') ? 'noopener noreferrer' : undefined}
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <p className="text-xl font-semibold" style={{ color: COLORS.orange }}>
                      {item.title}
                    </p>
                  )}

                  {item.items?.map((sub) => (
                    <Link
                      key={sub.title}
                      href={sub.href}
                      className="text-white/80 hover:text-white transition"
                      target={sub.href.includes('http') ? '_blank' : undefined}
                      rel={sub.href.includes('http') ? 'noopener noreferrer' : undefined}
                    >
                      {sub.title}
                    </Link>
                  ))}
                </div>
              ))}

              {/* Social column */}
              <div className="flex flex-col gap-3">
                <p className="text-xl font-semibold" style={{ color: COLORS.orange }}>
                  Follow
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <a href="https://www.tiktok.com/@promptlyprinted/" aria-label="Tiktok" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"><Youtube className="w-4 h-4" /></a>
                  <a href="https://www.instagram.com/promptlyprinted/" aria-label="Instagram" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"><Instagram className="w-4 h-4" /></a>
                  <a href="https://www.instagram.com/promptlyprinted/" aria-label="Twitter" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"><Twitter className="w-4 h-4" /></a>
                  <a href="https://www.instagram.com/promptlyprinted/" aria-label="Facebook" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"><Facebook className="w-4 h-4" /></a>
                </div>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/80">
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /><span>Secure checkout</span></div>
            <div className="flex items-center gap-2"><Globe className="w-4 h-4" /><span>Worldwide shipping</span></div>
            <div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /><span>All major payment methods</span></div>
          </div>

          {/* Divider */}
          <div className="mt-10 border-t border-white/10" />

          {/* Bottom bar */}
          <div className="py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs text-white/70">
            <p>© {new Date().getFullYear()} Promptly Printed. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/legal/terms" className="hover:text-white">Terms</Link>
              <Link href="/legal/acceptable-use" className="hover:text-white">Cookie Policy</Link>
              <Link href="/accessibility" className="hover:text-white">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};