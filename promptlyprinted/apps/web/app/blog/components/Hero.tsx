'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HeroProps {
  title?: string;
  highlight?: string;
  subhead?: string;
  tagline?: string;
  imgSrc?: string;
  imgAlt?: string;
}

const ThreeBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Create gradient material for particles
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x14B8A6, // teal
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create geometric shapes
    const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    const torusMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFF8A26, // orange
      transparent: true, 
      opacity: 0.1,
      wireframe: true 
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-3, 2, -5);
    scene.add(torus);

    const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x10B981, // emerald
      transparent: true, 
      opacity: 0.15,
      wireframe: true 
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(4, -1, -3);
    scene.add(sphere);

    // Position camera
    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate particles
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.001;

      // Rotate shapes
      torus.rotation.x += 0.01;
      torus.rotation.y += 0.005;
      sphere.rotation.x += 0.008;
      sphere.rotation.y += 0.012;

      // Float effect
      torus.position.y += Math.sin(Date.now() * 0.001) * 0.002;
      sphere.position.x += Math.sin(Date.now() * 0.0008) * 0.002;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      torusGeometry.dispose();
      torusMaterial.dispose();
      sphereGeometry.dispose();
      sphereMaterial.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />;
};

export default function Hero({
  title = "The",
  highlight = "Promptly Printed",
  subhead = "Discover the latest in AI-powered design, custom apparel trends, and innovative printing techniques.",
  tagline = "Creativity Promptly Delivered.",
  imgSrc = "/images/hero-placeholder.png",
  imgAlt = "Custom AI-generated apparel mockup"
}: HeroProps) {
  const [imageError, setImageError] = useState(false);
  return (
    <section 
      aria-label="Blog hero" 
      className="relative w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 overflow-hidden"
    >
      {/* Three.js Background */}
      <ThreeBackground />
      
      {/* Subtle radial overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-slate-800/20 via-transparent to-transparent opacity-50" />
      
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col space-y-6 lg:pr-8"
          >
            {/* H1 Title */}
            <motion.h1 
              className="text-5xl md:text-6xl font-bold leading-tight text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {title}{' '}
              <motion.span 
                className="bg-gradient-to-r from-teal-400 via-emerald-400 to-orange-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {highlight}
              </motion.span>
              {' '}Blog
            </motion.h1>
            
            {/* Subhead */}
            <motion.p 
              className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {subhead}
            </motion.p>
            
            {/* Tagline */}
            <motion.p 
              className="text-lg font-semibold text-teal-400"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {tagline}
            </motion.p>
            
            {/* Optional CTA Button - Easy to remove */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="pt-4"
            >
              <motion.button
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-400/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                type="button"
                aria-label="Explore blog posts"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{
                  backgroundPosition: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <span>Explore Posts</span>
                <motion.svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </motion.svg>
              </motion.button>
            </motion.div>
          </motion.div>
          
          {/* Right Column - Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="relative order-first lg:order-last"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="relative w-full max-w-md mx-auto lg:max-w-none"
              animate={{ y: [0, -10, 0] }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {!imageError ? (
                <motion.div
                  whileHover={{ 
                    rotateY: 5,
                    rotateX: 5,
                    boxShadow: "0 25px 50px -12px rgba(20, 184, 166, 0.25)"
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ perspective: 1000 }}
                >
                  <Image
                    src={imgSrc}
                    alt={imgAlt}
                    width={600}
                    height={400}
                    className="w-full h-auto object-contain rounded-2xl shadow-2xl shadow-slate-900/50 border border-slate-700/50"
                    loading="eager"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    onError={() => setImageError(true)}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  className="w-full h-96 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/50 border border-slate-600/50"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 25px 50px -12px rgba(255, 138, 38, 0.25)"
                  }}
                >
                  <div className="text-slate-400 text-center">
                    <motion.svg 
                      className="w-16 h-16 mx-auto mb-4 opacity-50" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                      animate={{ rotate: [0, 360] }}
                      transition={{ 
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </motion.svg>
                    <motion.p 
                      className="text-sm"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      Hero Image Placeholder
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}