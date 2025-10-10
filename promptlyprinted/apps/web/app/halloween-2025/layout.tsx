import type { ReactNode } from 'react';

interface HalloweenLayoutProps {
  children: ReactNode;
}

const HalloweenLayout = ({ children }: HalloweenLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#16213e] to-[#0f1419] text-white">
      {children}
    </div>
  );
};

export default HalloweenLayout;