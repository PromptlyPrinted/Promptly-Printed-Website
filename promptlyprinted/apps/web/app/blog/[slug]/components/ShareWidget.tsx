'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Share2, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Mail, 
  Link2, 
  Copy,
  Check 
} from 'lucide-react';

interface ShareWidgetProps {
  title: string;
  description?: string;
  url?: string;
}

interface SharePlatform {
  name: string;
  icon: React.ReactNode;
  action: (data: { title: string; description: string; url: string }) => void;
  color: string;
  hoverColor: string;
}

export default function ShareWidget({ title, description = '', url }: ShareWidgetProps) {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasWebShare, setHasWebShare] = useState(false);
  
  const currentUrl = mounted ? (url || window.location.href) : '';
  const shareData = { title, description, url: currentUrl };
  
  // Handle client-side mounting to prevent hydration errors
  useEffect(() => {
    setMounted(true);
    setHasWebShare('share' in navigator);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const sharePlatforms: SharePlatform[] = [
    {
      name: 'Twitter',
      icon: <Twitter className="w-4 h-4" />,
      action: ({ title, url }) => {
        const text = `${title} ${url}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
      },
      color: 'text-sky-500',
      hoverColor: 'hover:bg-sky-500/10 hover:border-sky-500/20'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-4 h-4" />,
      action: ({ url }) => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
      },
      color: 'text-blue-600',
      hoverColor: 'hover:bg-blue-600/10 hover:border-blue-600/20'
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-4 h-4" />,
      action: ({ url }) => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      },
      color: 'text-blue-500',
      hoverColor: 'hover:bg-blue-500/10 hover:border-blue-500/20'
    },
    {
      name: 'Email',
      icon: <Mail className="w-4 h-4" />,
      action: ({ title, description, url }) => {
        const subject = encodeURIComponent(title);
        const body = encodeURIComponent(`${description}\n\n${url}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      },
      color: 'text-gray-600',
      hoverColor: 'hover:bg-gray-600/10 hover:border-gray-600/20'
    }
  ];

  return (
    <motion.div
      className="sticky top-36 bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      onViewportEnter={() => setIsVisible(true)}
    >
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <Share2 className="w-5 h-5" style={{ color: '#F97316' }} />
        <h3 className="font-display font-bold" style={{ color: '#0F172A' }}>Share Article</h3>
      </div>

      <div className="space-y-3">
        {/* Social Platform Buttons */}
        {sharePlatforms.map((platform, index) => (
          <motion.button
            key={platform.name}
            onClick={() => platform.action(shareData)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg 
              border transition-all duration-200 group
              ${platform.hoverColor}
              hover:scale-[1.02] hover:shadow-md
            `}
            style={{
              borderColor: 'rgba(71, 85, 105, 0.2)',
              backgroundColor: 'rgba(248, 250, 252, 0.5)'
            }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: 0.5 + (index * 0.1),
              type: 'spring',
              stiffness: 300,
              damping: 25 
            }}
          >
            <div className={`${platform.color} group-hover:scale-110 transition-transform duration-200`}>
              {platform.icon}
            </div>
            <span className="font-medium text-sm" style={{ color: '#0F172A' }}>
              {platform.name}
            </span>
          </motion.button>
        ))}

        {/* Copy Link Button */}
        <motion.button
          onClick={copyToClipboard}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-lg 
            border transition-all duration-200 group
            hover:scale-[1.02] hover:shadow-md
          `}
          style={{
            borderColor: copied ? 'rgba(34, 197, 94, 0.3)' : 'rgba(249, 115, 22, 0.3)',
            backgroundColor: copied ? 'rgba(34, 197, 94, 0.1)' : 'rgba(249, 115, 22, 0.1)',
            color: copied ? '#22c55e' : '#F97316'
          }}
          whileHover={!copied ? { x: 4 } : {}}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3, 
            delay: 0.9,
            type: 'spring',
            stiffness: 300,
            damping: 25 
          }}
        >
          <div className={`transition-all duration-200 ${copied ? 'text-green-500' : 'text-blog-accent group-hover:scale-110'}`}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </div>
          <span className={`font-medium text-sm ${copied ? 'text-green-500' : 'text-blog-accent'}`}>
            {copied ? 'Copied!' : 'Copy Link'}
          </span>
        </motion.button>
      </div>

      {/* Share Stats (placeholder - could be replaced with real data) */}
      <motion.div 
        className="mt-6 pt-4 border-t border-blog-secondary-text/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <div className="flex items-center justify-between text-xs text-blog-secondary-text">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blog-accent rounded-full animate-pulse"></div>
            <span>Share this article</span>
          </div>
          <motion.div
            className="text-blog-accent font-medium"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.4, type: 'spring' }}
          >
            <Link2 className="w-3 h-3" />
          </motion.div>
        </div>
      </motion.div>

      {/* Native Web Share API (for mobile devices) */}
      {mounted && hasWebShare && (
        <motion.button
          onClick={async () => {
            try {
              await navigator.share({
                title,
                text: description,
                url: currentUrl,
              });
            } catch (error) {
              // Fallback to copy link if sharing fails
              copyToClipboard();
            }
          }}
          className="w-full mt-3 px-4 py-2 rounded-lg border border-blog-accent/30 bg-blog-accent/5 text-blog-accent text-sm font-medium hover:bg-blog-accent/10 transition-colors duration-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.3 }}
        >
          <div className="flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </div>
        </motion.button>
      )}
    </motion.div>
  );
}