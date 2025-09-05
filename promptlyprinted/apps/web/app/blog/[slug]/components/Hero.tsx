'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, Environment, Float } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import * as THREE from 'three';
import ClientOnly from './ClientOnly';

interface BlogPost {
  title: string;
  description?: string;
  author?: string;
  date?: string;
  readTime?: string;
}

interface HeroProps {
  post: BlogPost;
}

// 3D Scene Component
const Scene = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mouse tracking for interactive rotation
  useEffect(() => {
    if (!mounted) return;
    
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mounted]);

  // Frame animation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Base rotation
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
      meshRef.current.rotation.y += 0.01;
      
      // Mouse-influenced rotation
      meshRef.current.rotation.x += mousePosition.y * 0.001;
      meshRef.current.rotation.y += mousePosition.x * 0.001;
    }
  });

  return (
    <>
      <Environment preset="studio" />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <Float
        speed={2}
        rotationIntensity={1}
        floatIntensity={0.5}
        floatingRange={[1, 1.5]}
      >
        <Icosahedron
          ref={meshRef}
          args={[2, 1]}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial
            color="#00F5D4"
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.9}
          />
        </Icosahedron>
      </Float>
    </>
  );
};

// GSAP Text Animation Hook
const useTextAnimation = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const metadataRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    const tl = gsap.timeline({ delay: 0.5 });
    
    // Only animate after mount to avoid hydration issues
    if (titleRef.current) {
      // Store original text
      const originalText = titleRef.current.textContent || '';
      const words = originalText.split(' ');
      
      // Only modify DOM after hydration
      titleRef.current.innerHTML = words.map(word => `<span class="inline-block">${word}&nbsp;</span>`).join('');
      
      tl.fromTo(
        titleRef.current.children,
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8,
          stagger: 0.05,
          ease: "power2.out"
        }
      );
    }

    // Animate subtitle
    if (subtitleRef.current) {
      tl.fromTo(
        subtitleRef.current,
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8,
          ease: "power2.out"
        },
        "-=0.4"
      );
    }

    // Animate metadata
    if (metadataRef.current) {
      tl.fromTo(
        metadataRef.current.children,
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out"
        },
        "-=0.3"
      );
    }

    return () => {
      tl.kill();
    };
  }, [mounted]);

  return { titleRef, subtitleRef, metadataRef, mounted };
};

export default function Hero({ post }: HeroProps) {
  const { titleRef, subtitleRef, metadataRef, mounted } = useTextAnimation();
  
  // Create stable date string to prevent hydration issues
  const formattedDate = post.date 
    ? new Date(post.date).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    : new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white to-gray-50">
      {/* Featured Image Background */}
      {post.image?.url && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent z-10" />
          <img
            src={post.image.url}
            alt={post.image.alt || post.title}
            className="w-full h-full object-cover opacity-30"
            style={{ filter: 'blur(1px)' }}
          />
        </div>
      )}
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 z-5">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full opacity-10"
             style={{ backgroundColor: '#14B8A6' }} />
        <div className="absolute bottom-32 right-32 w-24 h-24 rounded-full opacity-10"
             style={{ backgroundColor: '#F97316' }} />
        <div className="absolute top-1/2 left-10 w-16 h-16 rounded-full opacity-5"
             style={{ backgroundColor: '#14B8A6' }} />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <h1 
            ref={titleRef}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-black mb-6 leading-tight"
            style={{ 
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              color: '#0F172A',
              opacity: mounted ? 1 : 0
            }}
          >
            {post.title}
          </h1>

          {/* Subtitle */}
          {post.description && (
            <p 
              ref={subtitleRef}
              className="text-xl md:text-2xl mb-8 leading-relaxed max-w-2xl mx-auto"
              style={{ 
                color: '#475569',
                opacity: mounted ? 1 : 0
              }}
            >
              {post.description}
            </p>
          )}

          {/* Metadata */}
          <div 
            ref={metadataRef}
            className="flex flex-wrap justify-center items-center gap-6"
            style={{ 
              color: '#475569',
              opacity: mounted ? 1 : 0
            }}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="#14B8A6" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{post.author || 'Promptly Printed Team'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="#14B8A6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formattedDate}</span>
            </div>

            {post.readTime && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="#F97316" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>{post.readTime}</span>
              </div>
            )}
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <div className="w-6 h-10 border-2 rounded-full flex justify-center" style={{ borderColor: '#14B8A6' }}>
              <div className="w-1 h-3 rounded-full mt-2" style={{ backgroundColor: '#14B8A6' }}></div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Gradient Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-blog-background/20 via-transparent to-blog-background/40 z-5"></div>
    </div>
  );
}