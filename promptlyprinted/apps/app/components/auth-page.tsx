import type { ReactNode } from 'react';

type AuthPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export const AuthPage = ({ title, description, children }: AuthPageProps) => {
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
