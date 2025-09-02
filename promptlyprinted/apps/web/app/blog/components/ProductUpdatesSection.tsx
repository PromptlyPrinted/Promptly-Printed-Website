'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { Rocket, Zap, Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import GlassmorphismCard from './GlassmorphismCard';

const COLORS = {
  navy: '#0D2C45',
  teal: '#16C1A8', 
  orange: '#FF8A26',
  white: '#FFFFFF',
  purple: '#9333EA',
  cyan: '#00FFF0',
};

// Mock product updates - you can replace with real data
const productUpdates = [
  {
    id: 1,
    version: "2.4.0",
    title: "AI Background Removal",
    description: "Revolutionary AI-powered background removal for perfect product placement. No more tedious editing!",
    date: "2024-01-15",
    type: "NEW",
    icon: Sparkles,
    color: COLORS.teal,
    features: ["One-click removal", "Smart edge detection", "Batch processing"]
  },
  {
    id: 2,
    version: "2.3.5",
    title: "Smart Color Matching",
    description: "Our AI now intelligently matches colors to your design style and brand palette automatically.",
    date: "2024-01-10",
    type: "IMPROVED",
    icon: Zap,
    color: COLORS.orange,
    features: ["Brand palette integration", "Auto color suggestions", "Style consistency"]
  },
  {
    id: 3,
    version: "2.3.0",
    title: "3D Preview Engine",
    description: "See your designs come to life with our new 360° 3D preview system. Every angle, every detail.",
    date: "2024-01-05",
    type: "NEW",
    icon: Rocket,
    color: COLORS.purple,
    features: ["360° rotation", "Realistic lighting", "Material textures"]
  },
  {
    id: 4,
    version: "2.2.8",
    title: "Enhanced Print Quality",
    description: "New print optimization algorithms ensure every design looks crisp and vibrant on any product.",
    date: "2024-01-01",
    type: "IMPROVED",
    icon: Star,
    color: COLORS.cyan,
    features: ["Auto DPI optimization", "Color calibration", "Texture enhancement"]
  },
  {
    id: 5,
    version: "2.2.5",
    title: "Voice Design Commands",
    description: "Create and modify designs using natural language. Just speak your ideas into reality.",
    date: "2023-12-28",
    type: "BETA",
    icon: Sparkles,
    color: COLORS.teal,
    features: ["Natural language processing", "Voice shortcuts", "Hands-free editing"]
  }
];

export default function ProductUpdatesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const cardWidth = 320;
    const gap = 24;
    const scrollDistance = cardWidth + gap;
    
    if (direction === 'left') {
      scrollContainerRef.current.scrollBy({ 
        left: -scrollDistance, 
        behavior: 'smooth' 
      });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    } else {
      scrollContainerRef.current.scrollBy({ 
        left: scrollDistance, 
        behavior: 'smooth' 
      });
      setCurrentIndex(Math.min(productUpdates.length - 1, currentIndex + 1));
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'NEW':
        return {
          bg: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.cyan} 100%)`,
          text: 'text-white'
        };
      case 'IMPROVED':
        return {
          bg: `linear-gradient(135deg, ${COLORS.orange} 0%, #ff6b35 100%)`,
          text: 'text-white'
        };
      case 'BETA':
        return {
          bg: `linear-gradient(135deg, ${COLORS.purple} 0%, #b45eff 100%)`,
          text: 'text-white'
        };
      default:
        return {
          bg: `linear-gradient(135deg, ${COLORS.navy} 0%, #1a4055 100%)`,
          text: 'text-white'
        };
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      className="py-20 bg-white overflow-hidden"
      style={{ y }}
    >
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.orange} 100%)`,
              color: COLORS.white
            }}
            whileHover={{ scale: 1.05 }}
          >
            <Rocket className="w-5 h-5" />
            <span className="font-semibold">Product Updates</span>
          </motion.div>
          
          <h2 
            className="text-4xl md:text-5xl font-black mb-4"
            style={{ color: COLORS.navy }}
          >
            Latest Releases
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Discover the newest features and improvements that make creating amazing designs even easier.
          </p>
          <div 
            className="w-24 h-1 mx-auto rounded-full"
            style={{ 
              background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.orange} 100%)` 
            }} 
          />
        </motion.div>

        {/* Scrollable Cards Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <motion.button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-xl"
            style={{ color: COLORS.navy }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <motion.button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-xl"
            style={{ color: COLORS.navy }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={currentIndex >= productUpdates.length - 1}
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>

          {/* Cards Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-16"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {productUpdates.map((update, index) => {
              const IconComponent = update.icon;
              const typeStyles = getTypeStyles(update.type);
              
              return (
                <motion.div
                  key={update.id}
                  className="flex-shrink-0 w-80"
                  style={{ scrollSnapAlign: 'start' }}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlassmorphismCard className="h-full">
                    <div className="relative">
                      {/* Type Badge */}
                      <motion.div
                        className="absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: typeStyles.bg,
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                      >
                        <span className={typeStyles.text}>{update.type}</span>
                      </motion.div>

                      {/* Icon */}
                      <motion.div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                        style={{
                          background: `linear-gradient(135deg, ${update.color}20 0%, ${update.color}10 100%)`,
                          border: `2px solid ${update.color}30`
                        }}
                        whileHover={{ 
                          scale: 1.1,
                          rotate: 5
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <IconComponent 
                          className="w-8 h-8" 
                          style={{ color: update.color }} 
                        />
                      </motion.div>

                      {/* Version */}
                      <div className="flex items-center gap-2 mb-3">
                        <span 
                          className="text-sm font-mono font-bold px-2 py-1 rounded"
                          style={{ 
                            background: `${update.color}15`, 
                            color: update.color 
                          }}
                        >
                          v{update.version}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(update.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 
                        className="text-xl font-bold mb-3"
                        style={{ color: COLORS.navy }}
                      >
                        {update.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {update.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-2">
                        {update.features.map((feature, featureIndex) => (
                          <motion.div
                            key={featureIndex}
                            className="flex items-center gap-2 text-sm"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: featureIndex * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ background: update.color }}
                            />
                            <span className="text-gray-700">{feature}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Learn More Link */}
                      <motion.div
                        className="mt-6 pt-4 border-t border-gray-200"
                        whileHover={{ x: 5 }}
                      >
                        <a
                          href="#"
                          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-300 hover:underline"
                          style={{ color: update.color }}
                        >
                          <span>Learn more</span>
                          <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.span>
                        </a>
                      </motion.div>
                    </div>
                  </GlassmorphismCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Pagination Dots */}
        <motion.div
          className="flex justify-center gap-2 mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          {productUpdates.map((_, index) => (
            <motion.button
              key={index}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: index === currentIndex ? COLORS.teal : '#e5e7eb'
              }}
              whileHover={{ scale: 1.2 }}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}