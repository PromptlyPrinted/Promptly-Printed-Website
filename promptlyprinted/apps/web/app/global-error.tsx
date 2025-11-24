'use client';

import { fonts } from '@repo/design-system/lib/fonts';
import { cn } from '@repo/design-system/lib/utils';
import { captureException } from '@sentry/nextjs';
import type NextError from 'next/error';
import { useEffect } from 'react';

type GlobalErrorProperties = {
  readonly error: NextError & { digest?: string };
  readonly reset: () => void;
};

const GlobalError = ({ error, reset }: GlobalErrorProperties) => {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <html lang="en" className={cn(fonts, 'scroll-smooth')}>
      <head>
        <title>Something went wrong | Promptly Printed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: system-ui, -apple-system, sans-serif;
                background: linear-gradient(135deg, #0D2C45 0%, #1a4d6f 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
              }
              .container {
                text-align: center;
                max-width: 500px;
              }
              .icon-wrapper {
                position: relative;
                width: 96px;
                height: 96px;
                margin: 0 auto 1.5rem;
              }
              .icon-bg {
                position: absolute;
                inset: 0;
                border-radius: 50%;
                background: linear-gradient(to right, #16C1A8, #FF8A26);
                opacity: 0.3;
              }
              .icon {
                position: relative;
                width: 48px;
                height: 48px;
                margin: 24px auto;
                color: #FF8A26;
              }
              h1 {
                color: white;
                font-size: 2rem;
                font-weight: 700;
                margin-bottom: 1rem;
              }
              p {
                color: rgba(255, 255, 255, 0.8);
                font-size: 1.125rem;
                margin-bottom: 2rem;
                line-height: 1.6;
              }
              .buttons {
                display: flex;
                flex-direction: column;
                gap: 1rem;
              }
              @media (min-width: 640px) {
                .buttons {
                  flex-direction: row;
                  justify-content: center;
                }
              }
              .btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0.75rem 2rem;
                border-radius: 9999px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                border: none;
                font-size: 1rem;
              }
              .btn-primary {
                background: #16C1A8;
                color: white;
              }
              .btn-primary:hover {
                background: #14a896;
                box-shadow: 0 10px 25px rgba(22, 193, 168, 0.3);
              }
              .btn-secondary {
                background: transparent;
                color: white;
                border: 2px solid white;
              }
              .btn-secondary:hover {
                background: white;
                color: #0D2C45;
              }
              .dots {
                display: flex;
                justify-content: center;
                gap: 0.5rem;
                margin-top: 3rem;
              }
              .dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
              }
              .dot-1 { background: #16C1A8; }
              .dot-2 { background: #FF8A26; }
              .dot-3 { background: white; }
              .error-id {
                margin-top: 2rem;
                font-size: 0.875rem;
                color: rgba(255, 255, 255, 0.5);
              }
            `,
          }}
        />
      </head>
      <body>
        <div className="container">
          <div className="icon-wrapper">
            <div className="icon-bg" />
            <svg
              className="icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1>Something went wrong</h1>
          <p>
            We encountered an unexpected error. Don&apos;t worry, our team has been
            notified and we&apos;re working on it.
          </p>

          <div className="buttons">
            <button type="button" className="btn btn-primary" onClick={() => reset()}>
              Try Again
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => (window.location.href = '/')}
            >
              Go Home
            </button>
          </div>

          {error.digest && <p className="error-id">Error ID: {error.digest}</p>}

          <div className="dots">
            <span className="dot dot-1" />
            <span className="dot dot-2" />
            <span className="dot dot-3" />
          </div>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
