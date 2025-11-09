import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import type { ReactNode } from 'react';

type AuthPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

const AuthPage = ({ title, description, children }: AuthPageProps) => {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {children}
    </>
  );
};

test('Sign In copy renders', () => {
  const title = 'Welcome back';
  const description = 'Enter your details to sign in.';

  render(
    <AuthPage
      title={title}
      description={description}
    />
  );

  expect(
    screen.getByRole('heading', {
      level: 1,
      name: title,
    })
  ).toBeDefined();
});
