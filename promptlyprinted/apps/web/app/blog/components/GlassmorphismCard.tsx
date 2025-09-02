'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@repo/design-system/lib/utils';

interface GlassmorphismCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  borderGradient?: boolean;
}

export default function GlassmorphismCard({ 
  children, 
  className, 
  hover = true,
  gradient = false,
  borderGradient = false 
}: GlassmorphismCardProps) {
  const baseClasses = cn(
    'relative backdrop-blur-xl bg-white/10 rounded-2xl',
    'border border-white/20',
    'shadow-xl shadow-black/10',
    'before:absolute before:inset-0 before:rounded-2xl',
    'before:bg-gradient-to-br before:from-white/20 before:via-white/10 before:to-white/5',
    'before:opacity-50 before:pointer-events-none',
    gradient && 'bg-gradient-to-br from-teal-500/20 via-purple-500/10 to-orange-500/20',
    borderGradient && 'border-transparent bg-gradient-to-br from-teal-500/30 via-purple-500/20 to-orange-500/30',
    borderGradient && 'before:bg-gradient-to-br before:from-teal-400/30 before:via-purple-400/20 before:to-orange-400/30',
    className
  );

  return (
    <motion.div
      className={baseClasses}
      initial={hover ? { scale: 1 } : undefined}
      whileHover={hover ? { 
        scale: 1.02,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="relative z-10 p-6">
        {children}
      </div>
      
      {/* Animated gradient overlay on hover */}
      {hover && (
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 pointer-events-none"
          whileHover={{ opacity: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, #16C1A8 0%, #9333EA 50%, #FF8A26 100%)',
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}