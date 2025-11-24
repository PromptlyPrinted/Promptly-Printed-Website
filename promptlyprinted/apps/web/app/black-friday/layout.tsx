import type { ReactNode } from 'react';

interface BlackFridayLayoutProps {
  children: ReactNode;
}

const BlackFridayLayout = ({ children }: BlackFridayLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] text-white">
      {children}
    </div>
  );
};

export default BlackFridayLayout;
