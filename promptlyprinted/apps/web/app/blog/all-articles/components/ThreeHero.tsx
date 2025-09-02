'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamically import Three.js component with SSR disabled
const FloatingShapes = dynamic(() => import('./FloatingShapes'), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
});

interface ThreeHeroProps {
  title: string;
  subtitle: string;
}

export default function ThreeHero({ title, subtitle }: ThreeHeroProps) {
  const [shouldShowAnimation, setShouldShowAnimation] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check if mobile
    const isMobileDevice = window.matchMedia('(max-width: 768px)').matches;
    
    // Only show animation if not mobile and user doesn't prefer reduced motion
    setShouldShowAnimation(!prefersReducedMotion && !isMobileDevice);
    setIsMobile(isMobileDevice);
  }, []);

  return (
    <section className="relative h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Three.js Background - Only render if conditions are met */}
      {shouldShowAnimation && (
        <FloatingShapes />
      )}
      
      {/* Static fallback background for mobile/reduced motion */}
      {!shouldShowAnimation && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-emerald-500/20 rounded-full blur-3xl" />
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {title}
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        </div>
      </div>
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/40 pointer-events-none" />
    </section>
  );
}