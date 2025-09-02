'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { Palette, Zap, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import GlassmorphismCard from './GlassmorphismCard';

const COLORS = {
  navy: '#0D2C45',
  teal: '#16C1A8', 
  orange: '#FF8A26',
  white: '#FFFFFF',
  purple: '#9333EA',
  cyan: '#00FFF0',
};

export default function StartDesigningCTA() {
  const [isHovered, setIsHovered] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.1]);

  return (
    <motion.section
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${COLORS.navy} 0%, #1a4055 30%, ${COLORS.purple} 70%, ${COLORS.navy} 100%)`,
      }}
    >
      {/* Animated Background Elements */}
      <motion.div
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        {/* Floating Shapes */}
        <motion.div
          className="absolute top-1/4 left-1/6 w-32 h-32 rounded-full opacity-20"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: `radial-gradient(circle, ${COLORS.teal} 0%, transparent 70%)`
          }}
        />
        
        <motion.div
          className="absolute top-1/2 right-1/6 w-24 h-24 rounded-lg opacity-15"
          animate={{
            rotate: [45, 405],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          style={{
            background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.cyan} 100%)`
          }}
        />

        <motion.div
          className="absolute bottom-1/4 left-1/3 w-20 h-20 rounded-full opacity-25"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          style={{
            background: `radial-gradient(circle, ${COLORS.purple} 0%, transparent 70%)`
          }}
        />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          style={{ scale }}
        >
          <GlassmorphismCard 
            className="p-12"
            borderGradient
          >
            {/* Animated Icon Group */}
            <motion.div
              className="flex justify-center items-center gap-4 mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {[Palette, Zap, Sparkles].map((Icon, index) => (
                <motion.div
                  key={index}
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)`
                  }}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 3 + index,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                  }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
              ))}
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-4xl md:text-6xl font-black mb-6 text-white leading-tight"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to{' '}
              <motion.span
                className="bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)`
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Create
              </motion.span>
              {' '}Magic?
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Transform your wildest ideas into stunning designs with our AI-powered platform. 
              From concept to creation in seconds.
            </motion.p>

            {/* Features Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {[
                { title: "AI-Powered", desc: "Smart design generation" },
                { title: "Instant Results", desc: "See your vision come to life" },
                { title: "Premium Quality", desc: "Professional-grade prints" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)`
                      }}
                    />
                  </div>
                  <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-300">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <Link href="/design">
                <motion.button
                  className="group relative px-12 py-6 text-xl font-bold text-white rounded-2xl overflow-hidden transition-all duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)`
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                >
                  {/* Animated Background */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.purple} 50%, ${COLORS.teal} 100%)`
                    }}
                    initial={{ x: "-100%" }}
                    animate={{ x: isHovered ? "0%" : "-100%" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />

                  {/* Button Content */}
                  <span className="relative flex items-center justify-center gap-3">
                    Start Designing Now
                    <motion.div
                      animate={{ x: isHovered ? 5 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowRight className="w-6 h-6" />
                    </motion.div>
                  </span>

                  {/* Sparkle Effects */}
                  <motion.div
                    className="absolute top-2 right-4"
                    animate={{
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-white/60" />
                  </motion.div>

                  <motion.div
                    className="absolute bottom-2 left-4"
                    animate={{
                      scale: [0, 1, 0],
                      rotate: [360, 180, 0]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-white/40" />
                  </motion.div>
                </motion.button>
              </Link>

              <motion.p
                className="text-sm text-gray-400 mt-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                viewport={{ once: true }}
              >
                No sign-up required • Start creating immediately
              </motion.p>
            </motion.div>
          </GlassmorphismCard>
        </motion.div>
      </div>
    </motion.section>
  );
}