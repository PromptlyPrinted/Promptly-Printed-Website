'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Sparkles, Zap, Heart } from 'lucide-react';

const COLORS = {
  navy: '#0D2C45',
  teal: '#16C1A8', 
  orange: '#FF8A26',
  white: '#FFFFFF',
  purple: '#9333EA',
  cyan: '#00FFF0',
};

export default function CompanyEthosSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <motion.section
      ref={sectionRef}
      className="relative py-32 overflow-hidden bg-gray-50"
      style={{ opacity }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, ${COLORS.teal} 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${COLORS.orange} 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, ${COLORS.purple} 0%, transparent 50%)
            `
          }}
          animate={{
            backgroundPosition: [
              "20% 50%, 80% 20%, 40% 80%",
              "25% 55%, 85% 25%, 45% 85%",
              "20% 50%, 80% 20%, 40% 80%"
            ]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          style={{ y }}
        >
          {/* Floating Icons */}
          <div className="relative mb-12">
            <motion.div
              className="absolute left-1/4 top-0"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-8 h-8 text-teal-500" />
            </motion.div>

            <motion.div
              className="absolute right-1/4 top-0"
              animate={{
                y: [0, 20, 0],
                rotate: [0, -360],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <Zap className="w-10 h-10 text-orange-500" />
            </motion.div>

            <motion.div
              className="absolute left-1/2 top-8 transform -translate-x-1/2"
              animate={{
                scale: [1, 1.2, 1],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <Heart className="w-6 h-6 text-purple-500" />
            </motion.div>
          </div>

          {/* Main Quote */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <motion.h2 
              className="text-5xl md:text-7xl font-black leading-tight mb-8"
              style={{ color: COLORS.navy }}
            >
              At{' '}
              <motion.span
                className="relative inline-block"
                whileHover={{ scale: 1.05 }}
              >
                <motion.span
                  className="bg-gradient-to-r bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)`
                  }}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Promptly Printed
                </motion.span>
                
                {/* Animated underline */}
                <motion.div
                  className="absolute -bottom-2 left-0 h-1 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)`
                  }}
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.8 }}
                  viewport={{ once: true }}
                />
              </motion.span>
            </motion.h2>

            <motion.div
              className="text-2xl md:text-3xl text-gray-700 leading-relaxed max-w-4xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                viewport={{ once: true }}
              >
                ideas become{' '}
              </motion.span>
              
              <motion.span
                className="inline-block font-bold"
                style={{ color: COLORS.teal }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                viewport={{ once: true }}
              >
                designs
              </motion.span>
              
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                viewport={{ once: true }}
              >
                , designs become{' '}
              </motion.span>
              
              <motion.span
                className="inline-block font-bold"
                style={{ color: COLORS.orange }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.3 }}
                viewport={{ once: true }}
              >
                style
              </motion.span>
              
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.5 }}
                viewport={{ once: true }}
              >
                , and style gets delivered—
              </motion.span>
              
              <motion.span
                className="inline-block font-black text-4xl md:text-5xl"
                style={{ color: COLORS.navy }}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.7 }}
                viewport={{ once: true }}
              >
                Promptly.
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Supporting Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <p className="text-lg text-gray-600 leading-relaxed">
              We believe creativity shouldn't be limited by technical barriers. 
              Our AI-powered platform transforms your imagination into wearable art, 
              bridging the gap between inspiration and expression.
            </p>
          </motion.div>

          {/* Animated Accent Line */}
          <motion.div
            className="mt-16 mx-auto h-1 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.purple} 50%, ${COLORS.orange} 100%)`
            }}
            initial={{ width: 0 }}
            whileInView={{ width: "200px" }}
            transition={{ duration: 1.5, delay: 2.2 }}
            viewport={{ once: true }}
          />
        </motion.div>
      </div>
    </motion.section>
  );
}