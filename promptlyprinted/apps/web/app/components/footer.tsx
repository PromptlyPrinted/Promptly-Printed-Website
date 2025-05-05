import { env } from '@repo/env';
import { Status } from '@repo/observability/status';
import Link from 'next/link';
import PromptlyLogoUrl from "./PromptlyLogo.svg";

export const Footer = () => {
  const navigationItems = [
    {
      title: 'Home',
      href: '/',
      description: '',
    },
    {
      title: 'Pages',
      description: 'Managing a small business today is already tough.',
      items: [
        {
          title: 'Blog',
          href: '/blog',
        },
      ],
    },
    {
      title: 'Legal',
      description: 'We stay on top of the latest legal requirements.',
      items: [
        {
          title: 'Terms of Service',
          href: '/legal/terms',
        },
        {
          title: 'Privacy Policy',
          href: '/legal/privacy',
        },
        {
          title: 'Acceptable Use',
          href: '/legal/acceptable-use',
        },
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
    <section className="border-foreground/10 border-t">
      <div
        className="w-full bg-cover bg-center py-20 text-foreground lg:py-40"
        style={{ backgroundImage: "url('/footer.png')" }}
      >
        <div className="container mx-auto">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="flex flex-col items-start gap-8">
              <div className="flex flex-col gap-2">
                <img src={PromptlyLogoUrl} className="h-12 w-auto" alt="Promptly Printed logo" />
                <p className="max-w-lg text-left text-foreground/75 text-lg leading-relaxed tracking-tight">
                  Creativity Promptly Delivered.
                </p>
              </div>
              <Status />
            </div>
            <div className="grid items-start gap-10 lg:grid-cols-3">
              {navigationItems.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col items-start gap-1 text-base"
                >
                  <div className="flex flex-col gap-2">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="flex items-center justify-between text-purple-600"
                        target={
                          item.href.includes('http') ? '_blank' : undefined
                        }
                        rel={
                          item.href.includes('http')
                            ? 'noopener noreferrer'
                            : undefined
                        }
                      >
                        <span className="text-xl">{item.title}</span>
                      </Link>
                    ) : (
                      <p className="text-xl text-purple-600">{item.title}</p>
                    )}
                    {item.items?.map((subItem) => (
                      <Link
                        key={subItem.title}
                        href={subItem.href}
                        className="flex items-center justify-between"
                        target={
                          subItem.href.includes('http') ? '_blank' : undefined
                        }
                        rel={
                          subItem.href.includes('http')
                            ? 'noopener noreferrer'
                            : undefined
                        }
                      >
                        <span className="text-foreground/75">
                          {subItem.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
