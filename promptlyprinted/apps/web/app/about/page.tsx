'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Sparkles, Users, Target, Award, Heart, Zap } from 'lucide-react';
import ThreeBackground from './components/ThreeBackground';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  const videoRef = useRef(null);
  const isVideoInView = useInView(videoRef, { once: true });

  const values = [
    {
      icon: Sparkles,
      title: 'Innovation First',
      description: 'Cutting-edge AI technology meets traditional craftsmanship to create something truly unique.'
    },
    {
      icon: Users,
      title: 'Customer Obsessed',
      description: 'Every decision we make is centered around delivering exceptional experiences for our customers.'
    },
    {
      icon: Target,
      title: 'Quality Driven',
      description: 'Premium materials and meticulous attention to detail in every print, every time.'
    },
    {
      icon: Award,
      title: 'Sustainable Practice',
      description: 'Eco-friendly printing processes and responsible sourcing for a better tomorrow.'
    },
    {
      icon: Heart,
      title: 'Community Love',
      description: 'Supporting local artists and creators while building a vibrant creative community.'
    },
    {
      icon: Zap,
      title: 'Fast & Reliable',
      description: 'Prompt delivery without compromising on quality - it\'s in our name for a reason.'
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Three.js Animated Background */}
      <ThreeBackground />

      <div className="relative z-10">
        {/* Hero Section with Video */}
        <section className="container mx-auto px-4 pt-24 pb-16 md:pt-32 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center mb-12"
          >
            <motion.h1
              className="font-bold text-5xl md:text-7xl tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Where Creativity Meets <br className="hidden md:block" />
              Custom Craftsmanship
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Transforming your wildest ideas into wearable art, one print at a time
            </motion.p>
          </motion.div>

          {/* Video Section */}
          <motion.div
            ref={videoRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isVideoInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="max-w-5xl mx-auto mb-20"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-primary/20 bg-muted/50 backdrop-blur-sm">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5">
                <video
                  className="w-full h-full object-cover"
                  controls
                  poster="/videos/about/thumbnails/about-poster.jpg"
                  preload="metadata"
                >
                  <source src="/videos/about/about-video.webm" type="video/webm" />
                  <source src="/videos/about/about-video.mp4" type="video/mp4" />
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-center p-8">
                      Your browser does not support the video tag.
                      <br />
                      <a href="/videos/about/about-video.mp4" className="text-primary underline">
                        Download the video instead
                      </a>
                    </p>
                  </div>
                </video>
              </div>

              {/* Decorative gradient border effect */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/20 pointer-events-none" />
            </div>
          </motion.div>

          {/* Story Section */}
          <AnimatedSection className="max-w-4xl mx-auto mb-24">
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl ring-1 ring-primary/10">
              <h2 className="font-bold text-3xl md:text-4xl mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Our Story
              </h2>
              <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                <p>
                  Born from a passion for creativity and innovation, <strong className="text-foreground">Promptly Printed</strong> emerged
                  with a revolutionary vision: to democratize custom apparel design through the power of artificial intelligence.
                </p>
                <p>
                  We saw a world where creating unique, professional-quality custom merchandise was complex,
                  expensive, and out of reach for most people. So we set out to change that.
                </p>
                <p>
                  Today, we're proud to offer a platform where <strong className="text-foreground">anyone</strong> can bring their
                  creative visions to life - whether you're a solopreneur launching your brand, a team celebrating
                  your achievements, or an individual expressing your unique style.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-24">
            <AnimatedSection>
              <motion.div
                className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 md:p-10 h-full shadow-lg ring-1 ring-primary/20"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-2xl md:text-3xl mb-4">Our Mission</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To empower creators, entrepreneurs, and dreamers worldwide with accessible,
                  AI-powered design tools and premium-quality custom printing services that turn
                  imagination into reality.
                </p>
              </motion.div>
            </AnimatedSection>

            <AnimatedSection>
              <motion.div
                className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-3xl p-8 md:p-10 h-full shadow-lg ring-1 ring-secondary/20"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/10 mb-6">
                  <Sparkles className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="font-bold text-2xl md:text-3xl mb-4">Our Vision</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  A world where custom apparel is as easy to create as taking a photo, where every
                  individual and brand can express their unique identity through high-quality,
                  sustainably-produced merchandise.
                </p>
              </motion.div>
            </AnimatedSection>
          </div>

          {/* Values Section */}
          <AnimatedSection className="max-w-6xl mx-auto mb-24">
            <div className="text-center mb-16">
              <h2 className="font-bold text-3xl md:text-4xl mb-4">Our Values</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              {values.map((value) => (
                <motion.div
                  key={value.title}
                  variants={scaleIn}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg ring-1 ring-primary/10 hover:ring-primary/30 transition-all"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatedSection>

          {/* Stats Section */}
          <AnimatedSection>
            <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl p-12 md:p-16 shadow-2xl ring-1 ring-primary/20">
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  { number: '10K+', label: 'Happy Customers' },
                  { number: '50K+', label: 'Designs Created' },
                  { number: '99%', label: 'Satisfaction Rate' },
                  { number: '24/7', label: 'Support Available' }
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={fadeInUp}
                    className="text-center"
                  >
                    <div className="font-bold text-4xl md:text-5xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <div className="text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </AnimatedSection>

          {/* CTA Section */}
          <AnimatedSection className="text-center mt-24">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a
                href="/design/mens-classic-t-shirt"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 ring-2 ring-primary/20 hover:ring-primary/40"
              >
                Start Creating Today
                <Zap className="w-5 h-5" />
              </a>
            </motion.div>
            <p className="text-muted-foreground mt-6 text-lg">
              Join thousands of creators bringing their ideas to life
            </p>
          </AnimatedSection>
        </section>
      </div>
    </div>
  );
}
