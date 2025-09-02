'use client';

import dynamic from 'next/dynamic';

// Dynamically import Hero with no SSR
const Hero = dynamic(() => import('./Hero'), {
  ssr: false,
  loading: () => (
    <section 
      aria-label="Blog hero" 
      className="relative w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col space-y-6 lg:pr-8">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-white">
              The{' '}
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-orange-400 bg-clip-text text-transparent">
                Promptly Printed
              </span>
              {' '}Blog
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-2xl">
              Discover the latest in AI-powered design, custom apparel trends, and innovative printing techniques.
            </p>
            <p className="text-lg font-semibold text-teal-400">
              Creativity Promptly Delivered.
            </p>
          </div>
          
          {/* Right Column - Placeholder */}
          <div className="relative order-first lg:order-last">
            <div className="relative w-full max-w-md mx-auto lg:max-w-none">
              <div className="w-full h-96 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/50 border border-slate-600/50">
                <div className="text-slate-400 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                  <p className="text-sm">Loading...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
});

interface ClientOnlyHeroProps {
  title?: string;
  highlight?: string;
  subhead?: string;
  tagline?: string;
  imgSrc?: string;
  imgAlt?: string;
}

export default function ClientOnlyHero(props: ClientOnlyHeroProps) {
  return <Hero {...props} />;
}