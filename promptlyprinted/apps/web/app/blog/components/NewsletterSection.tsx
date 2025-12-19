'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useRef } from 'react';
import { Mail, CheckCircle, Sparkles, Zap } from 'lucide-react';
import GlassmorphismCard from './GlassmorphismCard';

const COLORS = {
  navy: '#0D2C45',
  teal: '#16C1A8', 
  orange: '#FF8A26',
  white: '#FFFFFF',
  purple: '#9333EA',
  cyan: '#00FFF0',
};

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 1]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, campaignId: 'blog' }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Newsletter subscription failed:', data.error);
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${COLORS.navy} 0%, #1a4055 50%, ${COLORS.navy} 100%)`,
      }}
    >
      {/* Animated Background Elements */}
      <motion.div
        className="absolute inset-0"
        style={{
          y: backgroundY,
          scale: backgroundScale,
        }}
      >
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            background: `radial-gradient(circle, ${COLORS.teal} 0%, transparent 70%)`
          }}
        />
        
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15"
          animate={{
            scale: [1, 0.8, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            background: `radial-gradient(circle, ${COLORS.orange} 0%, transparent 70%)`
          }}
        />

        <motion.div
          className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-10"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            background: `radial-gradient(circle, ${COLORS.purple} 0%, transparent 70%)`
          }}
        />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Glassmorphism Card Container */}
          <GlassmorphismCard className="p-12" borderGradient>
            <div className="text-center">
              {/* Icon with Animation */}
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 mb-8 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)`
                }}
                whileHover={{ 
                  rotate: 360,
                  scale: 1.1
                }}
                transition={{ duration: 0.6 }}
              >
                <Mail className="w-8 h-8 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-4xl md:text-5xl font-black mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Subscribe &{' '}
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
                  Stay Prompt
                </motion.span>
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                Get exclusive access to design trends, AI tools, and creative inspiration. 
                Plus early access to new features and special offers.
              </motion.p>

              {/* Benefits */}
              <motion.div
                className="flex flex-wrap justify-center gap-6 mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                {[
                  { icon: Sparkles, text: "AI Design Tips" },
                  { icon: Zap, text: "Trend Alerts" },
                  { icon: CheckCircle, text: "Early Access" }
                ].map(({ icon: Icon, text }, index) => (
                  <motion.div
                    key={text}
                    className="flex items-center gap-2 text-teal-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Form */}
              {!isSubmitted ? (
                <motion.form
                  onSubmit={handleSubmit}
                  className="max-w-md mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300"
                      whileFocus={{ scale: 1.02 }}
                    />
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)`
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isLoading ? (
                        <motion.div
                          className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        "Subscribe"
                      )}
                    </motion.button>
                  </div>
                  
                  <p className="text-gray-400 text-sm mt-4">
                    No spam, ever. Unsubscribe anytime with one click.
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="text-center py-8"
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6 }}
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Welcome to the Club! 🎉
                  </h3>
                  <p className="text-gray-300">
                    Check your inbox for a confirmation email.
                  </p>
                </motion.div>
              )}
            </div>
          </GlassmorphismCard>
        </motion.div>
      </div>
    </motion.section>
  );
}