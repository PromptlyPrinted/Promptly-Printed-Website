'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export const Hero = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use Intersection Observer to only load video when hero is in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoadVideo) {
            setShouldLoadVideo(true);
          }
        });
      },
      { rootMargin: '100px' } // Start loading slightly before in view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [shouldLoadVideo]);

  useEffect(() => {
    if (!shouldLoadVideo) return;

    // Try to load and play video
    const video = videoRef.current;
    if (video) {
      video.load();

      // Attempt to play after a short delay to ensure readiness
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Video autoplay prevented:', error);
          // Autoplay was prevented, but that's okay - video will still load
        });
      }
    }
  }, [shouldLoadVideo]);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden bg-gradient-to-br from-[#0D2C45] via-[#0D2C45] to-[#16C1A8]/20">
      {/* Video Background with Fallback */}
      <div className="absolute inset-0 z-0 bg-[#0D2C45]">
        {!videoError && shouldLoadVideo && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className={`h-full w-full object-cover transition-opacity duration-700 ${
              videoLoaded ? 'opacity-40' : 'opacity-0'
            }`}
            onLoadedData={() => {
              console.log('Video loaded successfully');
              setVideoLoaded(true);
            }}
            onError={(e) => {
              console.error('Video load error:', e);
              setVideoError(true);
            }}
            onCanPlay={() => {
              console.log('Video can play');
              setVideoLoaded(true);
            }}
          >
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
          </video>
        )}

        {/* Fallback animated gradient background if video fails or hasn't loaded */}
        {(!videoLoaded || videoError) && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D2C45] via-[#16C1A8]/10 to-[#0D2C45] animate-gradient-slow" />
        )}

        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0D2C45]/50 to-[#0D2C45]" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4">
        <div className="flex min-h-[85vh] flex-col items-center justify-center gap-8 py-20 lg:py-32">
          {/* Badge */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#16C1A8]/30 bg-[#16C1A8]/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-[#16C1A8]" />
              <span className="text-sm font-medium text-white/90">
                AI-Powered Custom Apparel
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-6 items-center">
            <h1 className="max-w-4xl text-center font-bold text-5xl text-white tracking-tight md:text-7xl lg:text-8xl">
              Design your own premium apparel with AI
            </h1>
            <p className="max-w-2xl text-center text-xl text-white/80 leading-relaxed md:text-2xl">
              Type an idea. Watch it become wearable art.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button
              size="lg"
              className="gap-2 bg-[#16C1A8] hover:bg-[#16C1A8]/90 text-white text-lg px-8 py-6 h-auto shadow-lg shadow-[#16C1A8]/25"
              asChild
            >
              <Link href="/design/mens-classic-t-shirt">
                Start Designing <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-white/30 bg-white/10 hover:bg-white/20 text-white text-lg px-8 py-6 h-auto backdrop-blur-sm"
              asChild
            >
              <Link href="#examples">
                See Examples
              </Link>
            </Button>
          </div>

          {/* Subtext */}
          <p className="text-sm text-white/60 text-center max-w-md">
            Premium fabric up to 280gsm. Global shipping.
          </p>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
    </div>
  );
};
